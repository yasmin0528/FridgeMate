import { NextResponse } from "next/server";

type RecognitionItem = {
  name: string;
  amount: string;
  shelfLife: string;
  status: "fresh" | "soon" | "urgent";
};

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

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "\u672a\u914d\u7f6e OPENAI_API_KEY\uff0c\u8bf7\u5728 .env.local \u4e2d\u6dfb\u52a0\u540e\u91cd\u542f\u5f00\u53d1\u670d\u52a1\u3002",
      },
      { status: 500 },
    );
  }

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
    return NextResponse.json(
      {
        error:
          payload?.error?.message ||
          "\u8bc6\u522b\u670d\u52a1\u8fd4\u56de\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
      },
      { status: openaiResponse.status },
    );
  }

  try {
    const text = readOutputText(payload);
    const parsed = JSON.parse(text) as { ingredients?: RecognitionItem[] };
    return NextResponse.json({
      ingredients: normalizeItems(parsed.ingredients ?? []),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "\u8bc6\u522b\u7ed3\u679c\u89e3\u6790\u5931\u8d25\uff0c\u8bf7\u6362\u4e00\u5f20\u66f4\u6e05\u6670\u7684\u56fe\u7247\u91cd\u8bd5\u3002",
      },
      { status: 502 },
    );
  }
}
