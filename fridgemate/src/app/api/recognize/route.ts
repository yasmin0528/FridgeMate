import { NextResponse } from "next/server";

type RecognitionItem = {
  name: string;
  amount: string;
  shelfLife: string;
  status: "fresh" | "soon" | "urgent";
};

type BaiduImageApi = "ingredient" | "dish" | "advanced_general";

type BaiduRecognitionResult = {
  name?: string;
  keyword?: string;
  score?: number;
  probability?: number;
};

type BaiduRecognitionPayload = {
  error_code?: number;
  error_msg?: string;
  result?: BaiduRecognitionResult[];
};

let baiduAccessTokenCache: { token: string; expiresAt: number } | null = null;

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["ingredients"],
  properties: {
    ingredients: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "amount", "shelfLife", "status"],
        properties: {
          name: {
            type: "string",
            description: "Food ingredient name in Simplified Chinese.",
          },
          amount: {
            type: "string",
            description: "Visible or estimated amount, such as 3 pieces.",
          },
          shelfLife: {
            type: "string",
            description: "Estimated remaining shelf life in Chinese.",
          },
          status: {
            type: "string",
            enum: ["fresh", "soon", "urgent"],
            description: "fresh means safe, soon means expiring soon, urgent means use quickly.",
          },
        },
      },
    },
  },
};

const geminiSchema = {
  type: "OBJECT",
  required: ["ingredients"],
  properties: {
    ingredients: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["name", "amount", "shelfLife", "status"],
        properties: {
          name: { type: "STRING" },
          amount: { type: "STRING" },
          shelfLife: { type: "STRING" },
          status: {
            type: "STRING",
            enum: ["fresh", "soon", "urgent"],
          },
        },
      },
    },
  },
};

function readOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const response = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => Boolean(text))
      .join("") ?? ""
  );
}

function normalizeItems(items: RecognitionItem[]) {
  return items.map((item, index) => ({
    id: Date.now() + index,
    name: item.name.trim() || "\u672a\u547d\u540d\u98df\u6750",
    amount: item.amount.trim() || "\u5f85\u786e\u8ba4",
    shelfLife: item.shelfLife.trim() || "\u5f85\u786e\u8ba4",
    status: item.status,
  }));
}

function normalizeBaiduApi(value: string | undefined): BaiduImageApi {
  if (value === "dish" || value === "advanced_general") {
    return value;
  }

  return "ingredient";
}

function getBaiduEndpoint(api: BaiduImageApi) {
  if (api === "dish") {
    return "https://aip.baidubce.com/rest/2.0/image-classify/v2/dish";
  }

  if (api === "advanced_general") {
    return "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general";
  }

  return "https://aip.baidubce.com/rest/2.0/image-classify/v1/classify/ingredient";
}

async function getBaiduAccessToken() {
  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error(
      "\u672a\u914d\u7f6e BAIDU_API_KEY \u6216 BAIDU_SECRET_KEY\uff0c\u8bf7\u5728 .env.local \u4e2d\u6dfb\u52a0\u540e\u91cd\u542f\u5f00\u53d1\u670d\u52a1\u3002",
    );
  }

  if (
    baiduAccessTokenCache &&
    Date.now() < baiduAccessTokenCache.expiresAt
  ) {
    return baiduAccessTokenCache.token;
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: apiKey,
    client_secret: secretKey,
  });

  const response = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?${params.toString()}`,
    { method: "POST" },
  );
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ||
        payload.error ||
        "\u767e\u5ea6\u667a\u80fd\u4e91 access_token \u83b7\u53d6\u5931\u8d25\u3002",
    );
  }

  baiduAccessTokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + ((payload.expires_in ?? 2592000) - 300) * 1000,
  };

  return payload.access_token;
}

function parseBaiduIngredients(payload: BaiduRecognitionPayload) {
  if (payload.error_code) {
    throw new Error(
      payload.error_msg ||
        `\u767e\u5ea6\u667a\u80fd\u4e91\u8bc6\u522b\u5931\u8d25\uff1a${payload.error_code}`,
    );
  }

  const seen = new Set<string>();
  const items: RecognitionItem[] = [];

  for (const result of payload.result ?? []) {
    const name = (result.name || result.keyword || "").trim();
    const confidence = result.score ?? result.probability ?? 0;

    if (!name || name === "\u975e\u679c\u852c\u98df\u6750" || seen.has(name)) {
      continue;
    }

    if (confidence && confidence < 0.2) {
      continue;
    }

    seen.add(name);
    items.push({
      name,
      amount: "\u5f85\u786e\u8ba4",
      shelfLife: "\u5f85\u786e\u8ba4",
      status: "fresh",
    });
  }

  return { ingredients: items };
}

async function recognizeWithBaidu(file: File) {
  const accessToken = await getBaiduAccessToken();
  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = imageBuffer.toString("base64");

  if (imageBase64.length > 4 * 1024 * 1024) {
    throw new Error(
      "\u767e\u5ea6\u56fe\u50cf\u8bc6\u522b\u8981\u6c42 base64 \u56fe\u7247\u4e0d\u8d85\u8fc7 4MB\uff0c\u8bf7\u538b\u7f29\u540e\u91cd\u8bd5\u3002",
    );
  }

  const api = normalizeBaiduApi(process.env.BAIDU_IMAGE_API);
  const body = new URLSearchParams({
    image: imageBase64,
    top_num: "8",
  });

  if (api === "advanced_general") {
    body.set("baike_num", "0");
  }

  const response = await fetch(
    `${getBaiduEndpoint(api)}?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );
  const payload = (await response.json()) as BaiduRecognitionPayload;

  if (!response.ok) {
    throw new Error(
      payload.error_msg ||
        "\u767e\u5ea6\u667a\u80fd\u4e91\u8bc6\u522b\u670d\u52a1\u8fd4\u56de\u9519\u8bef\u3002",
    );
  }

  return parseBaiduIngredients(payload);
}

function readGeminiText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const response = payload as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  return (
    response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter((text): text is string => Boolean(text))
      .join("") ?? ""
  );
}

async function recognizeWithGemini(file: File) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "\u672a\u914d\u7f6e GEMINI_API_KEY\uff0c\u8bf7\u5728 .env.local \u4e2d\u6dfb\u52a0\u540e\u91cd\u542f\u5f00\u53d1\u670d\u52a1\u3002",
    );
  }

  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: imageBuffer.toString("base64"),
                },
              },
              {
                text:
                  "Recognize visible food ingredients in this refrigerator or food photo. Return JSON only. Use Simplified Chinese for ingredient names, amount, and shelfLife. Estimate amount and shelf life when uncertain. If no food is visible, return an empty ingredients array.",
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: geminiSchema,
        },
      }),
    },
  );

  const payload = await geminiResponse.json();

  if (!geminiResponse.ok) {
    throw new Error(
      payload?.error?.message ||
        "\u8bc6\u522b\u670d\u52a1\u8fd4\u56de\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
    );
  }

  const text = readGeminiText(payload);
  return JSON.parse(text) as { ingredients?: RecognitionItem[] };
}

async function recognizeWithOpenAI(file: File) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "\u672a\u914d\u7f6e OPENAI_API_KEY\uff0c\u8bf7\u5728 .env.local \u4e2d\u6dfb\u52a0\u540e\u91cd\u542f\u5f00\u53d1\u670d\u52a1\u3002",
    );
  }

  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = `data:${file.type};base64,${imageBuffer.toString("base64")}`;
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Recognize visible food ingredients in this refrigerator or food photo. Return JSON only. Use Simplified Chinese for ingredient names, amount, and shelfLife. Estimate amount and shelf life when uncertain. If no food is visible, return an empty ingredients array.",
            },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "low",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "fridgemate_food_recognition",
          strict: true,
          schema,
        },
      },
    }),
  });

  const payload = await openaiResponse.json();

  if (!openaiResponse.ok) {
    throw new Error(
      payload?.error?.message ||
        "\u8bc6\u522b\u670d\u52a1\u8fd4\u56de\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
    );
  }

  const text = readOutputText(payload);
  return JSON.parse(text) as { ingredients?: RecognitionItem[] };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "\u8bf7\u4e0a\u4f20\u4e00\u5f20\u56fe\u7247\u3002" },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "\u4e0a\u4f20\u6587\u4ef6\u5fc5\u987b\u662f\u56fe\u7247\u3002" },
      { status: 400 },
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: "\u56fe\u7247\u8bf7\u63a7\u5236\u5728 8MB \u4ee5\u5185\u3002" },
      { status: 400 },
    );
  }

  try {
    const provider = process.env.AI_PROVIDER || "gemini";
    const parsed =
      provider === "openai"
        ? await recognizeWithOpenAI(file)
        : provider === "baidu"
          ? await recognizeWithBaidu(file)
        : await recognizeWithGemini(file);

    return NextResponse.json({
      ingredients: normalizeItems(parsed.ingredients ?? []),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "\u8bc6\u522b\u7ed3\u679c\u89e3\u6790\u5931\u8d25\uff0c\u8bf7\u6362\u4e00\u5f20\u66f4\u6e05\u6670\u7684\u56fe\u7247\u91cd\u8bd5\u3002",
      },
      { status: 502 },
    );
  }
}
