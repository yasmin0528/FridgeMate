# FridgeMate — 居家减脂食谱推荐 App

> 人机交互导论大作业 · 第 25 组
> 扫一下、抽一下、拍一下，居家减脂从冰箱开始

FridgeMate 是一款 **mobile-first** 的智能冰箱管理与食谱推荐 Web 应用。用户通过管理冰箱库存、拍照识别食材，获得基于 TF-IDF + Cosine 相似度的个性化减脂食谱推荐，并通过打卡烹饪记录追踪健康习惯。

---

## 功能概览

| 页面 | 路由 | 说明 |
|------|------|------|
| **冰箱** | `/fridge` | 可视化管理冰箱库存（冷藏 / 冷冻分区），搜索筛选，多选食材组合菜谱 |
| **扫描** | `/scan` | 拍照 / 上传图片 → AI 识别食材 → 确认后同步至冰箱库存 |
| **食谱** | `/recipes` | 基于已选食材的智能推荐排行，支持综合 / 减脂 / 时间 / 匹配多维度排序；老虎机随机抽选 |
| **食谱详情** | `/recipes/[id]` | 分步烹饪教程 + 内置计时器 + B 站视频链接 |
| **烹饪完成** | `/recipes/[id]/done` | 庆祝动画 + 打卡记录 |
| **个人成就** | `/profile` | 等级经验系统（🥚 → 🔥 → 🌟 → 👑）、连续打卡追踪、日历视图、烹饪历史 |

---

## 快速开始

```bash
cd fridgemate
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，Chrome DevTools 切换到 **iPhone 12 Pro** 视口（414 × 896）体验最佳。

> ⚠️ 项目路径含中文字符，Turbopack 在 Next.js 16 上存在 UTF-8 字节边界 panic，已通过 `--webpack` 固定绕过。**请勿改回 Turbopack**。

### 环境变量

如需启用 AI 拍照识别功能，在 `fridgemate/.env.local` 中配置：

```env
# 豆包（火山引擎，默认）
ARK_API_KEY=your_ark_api_key
DOUBAO_MODEL=your_model_id

# 或百度智能云（需同时配置两个 key）
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key

# 或 Gemini
GEMINI_API_KEY=your_gemini_api_key

# 或 OpenAI
OPENAI_API_KEY=your_openai_api_key
```

---

## 技术栈

| 层 | 技术选型 |
|---|---|
| 框架 | Next.js 16.2.6（App Router，webpack 模式） |
| UI | React 19.2.4 |
| 样式 | Tailwind CSS v4（`@tailwindcss/postcss`） |
| 动效 | framer-motion 12.39.0（老虎机、庆祝粒子、弹簧动画） |
| 状态管理 | React Context + useReducer（主），Zustand 4.5.0（副） |
| 类型 | TypeScript 5 |
| 测试 | Vitest 4.1.7 + happy-dom 20.9.0 |
| 代码检查 | ESLint 9 + eslint-config-next |
| AI 识别 | 豆包 / 百度智能云 / Gemini / OpenAI（四选一，运行时切换） |

---

## 项目结构

```
fridgemate/
├── public/
│   └── scene.png                  # 全局背景图
├── src/
│   ├── app/                       # Next.js App Router 路由
│   │   ├── globals.css            # 设计系统 + Tailwind + 组件样式
│   │   ├── layout.tsx             # 根布局（Provider 注入 + BottomTab）
│   │   ├── page.tsx               # 重定向 → /fridge
│   │   ├── fridge/page.tsx        # 冰箱库存管理页
│   │   ├── scan/page.tsx          # 拍照识别页
│   │   ├── recipes/page.tsx       # 食谱推荐列表页
│   │   ├── recipes/[id]/page.tsx  # 食谱详情 + 分步烹饪
│   │   ├── recipes/[id]/done/page.tsx  # 烹饪完成庆祝页
│   │   ├── profile/page.tsx       # 个人成就页
│   │   └── api/recognize/route.ts # AI 食材识别 API
│   ├── components/
│   │   ├── BottomTab.tsx          # 底部四标签导航栏
│   │   ├── CookingTimer.tsx       # 步进计时器
│   │   ├── SlotMachine.tsx        # 老虎机随机推荐
│   │   ├── CelebrationLayer.tsx   # 庆祝动效层
│   │   ├── IngredientChip.tsx     # 食材标签
│   │   ├── MatchCircles.tsx       # 食材匹配度指示
│   │   ├── fridge/                # 冰箱页专属组件（网格、货架、筛选栏...）
│   │   ├── scan/                  # 扫描页专属组件（相机、控制面板、识别抽屉）
│   │   └── profile/               # 个人页专属组件（日历、经验条、历史列表）
│   ├── types/                     # 领域类型定义
│   │   ├── ingredient.ts          # Ingredient（食材数据模型）
│   │   ├── recipe.ts              # Recipe / RecipeStep / RecipeIngredientRef
│   │   ├── food.ts                # Food（冰箱实物模型）
│   │   └── events.ts             # CookingDoneEvent
│   ├── mock/                      # Mock 数据
│   │   ├── ingredients.ts         # 66 种食材（63 冰箱 + 3 主食）
│   │   └── recipes.ts             # 34 道菜谱（含真实 B 站 videoUrl）
│   ├── lib/                       # 纯算法库
│   │   ├── tfidf.ts               # TF-IDF 加权 + Cosine 相似度
│   │   ├── match.ts               # 菜谱评分 + 排序 + 老虎机候选
│   │   ├── profileXp.ts           # 等级经验值计算
│   │   ├── checkinCalendar.ts     # 打卡日历工具函数
│   │   └── cookingHistory.ts      # 烹饪历史排序与格式化
│   ├── store/                     # 状态管理
│   │   ├── Providers.tsx          # Provider 组合注入
│   │   ├── fridgeStore.tsx        # 冰箱库存 Store（localStorage 持久化）
│   │   ├── recipeStore.tsx        # 食谱推荐 Store（内存计算）
│   │   ├── checkinStore.tsx       # 打卡签到 Store（localStorage 持久化）
│   │   └── foodStore.tsx          # 备选食物选择 Store（Zustand）
│   └── design/
│       └── tokens.ts              # 设计 Token 常量
├── vitest.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## 核心设计

### 推荐算法

采用 **TF-IDF + Cosine 相似度** 算法（参考 Yummly 开源克隆 + Food.com TF-IDF 论文），并叠加减脂适配与烹饪时长的双约束修正：

```
sim(u, r)   = cos(u, r) over IDF-weighted vectors    （排除主食类食材）
score(R)    = sim(u, r) × (1 + 0.2·fatLossScore/5 + 0.1·(1 - cookTimeMin/60))
```

- 主食食材（米饭 / 面条 / 燕麦等 pantry）不参与 IDF / cosine / coverage 计算
- 推荐列表仅在已选食材与菜谱有交集（`coverage > 0`）时展示
- 老虎机：候选菜谱 ≥ 5 道时正常抽选；不足时退化为 top 10 by score 兜底

### 状态管理

| Store | Hook | 职责 | 持久化 |
|-------|------|------|--------|
| FridgeStore | `useFridgeStore()` | 冰箱库存 CRUD + 多选食材 | `localStorage("fridgemate:fridge")` |
| RecipeStore | `useRecipeStore()` | 食谱排序 + 老虎机候选 | 内存计算 |
| CheckinStore | `useCheckinStore()` | 打卡记录 + 连续天数 | `localStorage("fridgemate:checkin")` |

数据持久化使用版本化机制（`STORAGE_VERSION`），schema 变更时自动作废旧缓存。

### 设计风格

采用 **claymorphism（粘土风格）** 设计系统：
- **主色调**：薄荷绿（mint green `#7BCF8E`）
- **辅色**：蜜桃、香蕉黄、薰衣草、天蓝、草莓红
- **组件风格**：柔和阴影 + 内高光边框 + 色彩情绪卡片
- **动效**：浮动、脉冲、摆动动画贯穿全站
- **排版**：中文系统字体栈，10 级字号体系（hero-display 32px → micro 11px）
- **响应式**：768px+ 屏幕强制居中 414px 模拟手机视口

### 食材模型

| 字段 | 说明 |
|------|------|
| `ingredientId` | 关联 `mock/ingredients.ts` 中的食材定义 |
| `qty` | 库存数量 |
| `status` | 新鲜度：`fresh` / `soon` / `urgent` |
| `zone` | 存储区域：`fridge`（冷藏） / `freeze`（冷冻） |
| `shelfLife` | 保质期天数 |

### AI 识别流程

1. 用户拍照 / 上传图片
2. 前端对图片进行压缩优化（max 1600px 边，JPEG 86% 质量）
3. `POST /api/recognize` 调用 AI 大模型识别图片中的食材
4. 返回识别结果（食材名、数量、保质期、新鲜度状态）
5. 用户在抽屉中确认 / 编辑后同步至冰箱库存

支持四家 AI 服务商，通过环境变量运行时切换（默认豆包）。

---

## 页面间协作契约

| 发起页 | 目标页 | 协作方式 |
|--------|--------|----------|
| 冰箱 | 食谱 | `toggleSelect(id)` 选中食材 → 跳转 `/recipes`，自动消费 `selectedSet` |
| 扫描 | 冰箱 | 识别完成 → `addItems(...)` 同步至 `fridgeStore` 库存 |
| 食谱详情 | 完成页 | `recordCooking(recipeId)` → 跳转 `/recipes/[id]/done` |
| 完成页 | 冰箱 | 庆祝动画 → 返回首页 |

> **ingredientId 约定**：扫描页同步时必须使用 `mock/ingredients.ts` 中存在的 `id`。

---

## 开发指南

### 测试

```bash
npm test            # 一次性运行全部 97 个测试
npm run test:watch  # Watch 模式
npm run test:ui     # Vitest UI 界面
```

**测试覆盖**：纯算法（TF-IDF、匹配评分、日历）、Reducer 不可变性契约、Mock 数据完整性、边界条件。UI 层手测验收。

### 类型检查 & Lint

```bash
npm run lint
npx tsc --noEmit
```

### 开发约束

- **Mobile-first**：所有页面以 414px 宽度基准设计。禁止 `max-w-7xl`、`lg:grid-cols-N`、`md:flex` 等桌面多栏布局
- 修改 `src/store/` 的 reducer 后必须跑 `npm test` 确认不可变性契约通过
- Mock 数据扩缩容时同步跑 `npm test` 确认数据完整性检查通过
- localStorage schema 变更时需 bump `fridgeStore.tsx` 顶部的 `STORAGE_VERSION` 常量

---

## 团队

| 模块 | 路由 | 负责人 |
|------|------|--------|
| 首页冰箱 + 整体 UI | `/fridge` | 郑以琳 |
| 拍照识别 | `/scan` | 毛郡仪 |
| 食谱推荐 + 烹饪教程 | `/recipes` | 何 dj |
| 个人成就 | `/profile` | zyx |

---

## License

本项目为同济大学人机交互导论课程大作业，仅供学习交流使用。
