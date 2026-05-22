# FridgeMate

人机交互导论大作业 · 居家减脂食谱推荐 App。

## Quick Start

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，Chrome DevTools 切换到 iPhone 12 Pro 视口（414×896）体验最佳。

> ⚠️ 项目路径含中文，Turbopack 在 Next.js 16 上有 UTF-8 字节边界 panic，已通过 `--webpack` 绕过。请勿改回 Turbopack。

---

## Tech Stack

- Next.js 16 (App Router, webpack mode)
- React 19（启用 `react-hooks/purity` lint，禁 render 内 `Math.random()`）
- TypeScript 5
- Tailwind CSS 4
- framer-motion（slot machine + 庆祝粒子动效）
- Vitest + happy-dom（纯逻辑单测）
- OpenAI Responses API（拍照识别，需 API key）

---

## Team Integration Points

| 页面 | 路由 | 负责人 | 入口契约 |
|---|---|---|---|
| P0 首页冰箱 | `/` | 郑以琳 | `useFridgeStore()` 读 `inventory`/`selectedIds`，点食材调 `toggleSelect(id)`，组合好后跳 `/recipes` |
| P1 拍照上传 | `/scan` | 毛郡仪 ✅ 已集成 | 识别完成调 `useFridgeStore().addItems([{ ingredientId, qty }])` 同步到首页库存（**ingredientId 必须是 [mock/ingredients.ts](src/mock/ingredients.ts) 里存在的 id**） |
| P3 食谱 + 教程 | `/recipes`, `/recipes/[id]`, `/recipes/[id]/done` | 何 dj ✅ | 自动消费 `selectedSet` |
| P4 个人成就 | `/profile` | zyx | 订阅 `useCheckinStore()` 读 `history`/`streak`/`lastCookedDate` |



> **重要**：所有页面遵循 mobile-first 设计（414px 宽度）。**禁止**用 `max-w-7xl` / `lg:grid-cols-N` / `md:flex` 等桌面双栏布局，详见 [AGENTS.md](AGENTS.md) 项目特有规则。

---

## Architecture

```
src/
├── types/              领域类型 (Ingredient/Recipe/CookingDoneEvent)
├── mock/               50 冰箱食材 + 3 后台食材 + 28 菜谱（含真实 B 站 videoUrl）
├── lib/                纯算法 (TF-IDF + Cosine + 减脂/时间加权 + slot machine 兜底)
├── store/              React Context store (fridge/recipe/checkin) + Providers
├── components/         共享组件 (BottomTab/IngredientChip/MatchCircles/CookingTimer/SlotMachine/CelebrationLayer)
├── design/             设计 token (mint primary)
└── app/                Next.js App Router 路由 + api/recognize (OpenAI 识别)
```

---

## Stores

| Hook | 提供 | 持久化 |
|---|---|---|
| `useFridgeStore()` | `inventory`, `selectedIds`, `selectedSet`, `addItems()`, `removeItem()`, `toggleSelect()`, `clearSelection()` | `localStorage('fridgemate:fridge')` + `STORAGE_VERSION` |
| `useRecipeStore()` | `allRecipes`, `getRecipe(id)`, `rankedForSelected`, `slotCandidates` | memo only |
| `useCheckinStore()` | `history`, `streak`, `lastCookedDate`, `recordCooking(recipeId)` | `localStorage('fridgemate:checkin')` |

---

## Recommendation Algorithm

**TF-IDF + Cosine Similarity**（参考 Yummly 开源克隆 + Food.com TF-IDF 论文），叠加减脂适配（`α=0.2`）与时长（`β=0.1`）两项约束修正：

```
sim(u, r)   = cos(u, r) over IDF-weighted vectors  (excluding pantry items)
score(R)    = sim(u, r) × (1 + 0.2·fatLossScore/5 + 0.1·(1 - cookTimeMin/60))
```

- pantry 食材（米饭/面条/燕麦）不参与 IDF / cosine / coverage 计算
- 推荐列表选食材后只显示 `coverage > 0` 的菜谱
- 🎲 老虎机：合格候选 ≥ 5 时正常筛；否则退化为 top 10 by score 兜底

详见 [src/lib/match.ts](src/lib/match.ts) 与设计文档 [`docs/superpowers/specs/2026-05-21-fridgemate-iteration-design.md`](../../docs/superpowers/specs/2026-05-21-fridgemate-iteration-design.md) §4-5。

---

## Tests

```bash
npm test           # 一次性跑 97 个
npm run test:watch # watch 模式
```

覆盖：纯算法 + reducer + mock 数据完整性 + 边界。UI 层手测验收。

## Lint / Type Check

```bash
npm run lint
npx tsc --noEmit
```

---

## 动态需求查看要点

> 以下为迭代过程中发现的待处理问题，随开发进度动态更新。每个条目标注提出时间和优先级，解决后勾选移入 commit log。

- [ ] **前端风格统一** — 拍照识图页 (`/scan`) 与菜谱页 (`/recipes`) UI 风格不一致：
  - `/scan` 使用硬编码紫色 `#5645d4` + 深蓝 `#0a1530` 配色
  - `/recipes` 使用设计 token `var(--color-primary)`（mint green `#10B981`），遵循 `src/design/tokens.ts` 与 `globals.css` 统一规范
  - **要求**：`/scan` 应迁移到设计 token 体系，主色统一为 mint green，去除 hardcoded 色值；Hero section 风格与 P0 首页/P3 菜谱页保持一致

---

## 演示前 checklist

- [ ] `npm test` 全过（97/97）
- [ ] `OPENAI_API_KEY` 配置在 `.env.local`
- [ ] 演示设备清空 localStorage 一次（确保看到新版冰箱 50 项而不是老缓存的 8 项）
- [ ] Chrome DevTools 切 iPhone 12 Pro 视口
- [ ] 跑通 5 步任务：选食材 → 推荐 → 老虎机 → 烹饪 → 打卡庆祝
- [ ] 跑通拍照流：上传图片 → 识别 → 编辑 → 同步 → 看首页冰箱真的多了
