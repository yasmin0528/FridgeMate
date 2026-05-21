# FridgeMate

人机交互导论大作业 · 居家减脂食谱推荐 App。

## Quick Start

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，Chrome DevTools 切换到 iPhone 12 Pro 视口体验最佳。

> ⚠️ 项目路径含中文，`next dev` 默认的 Turbopack 会触发 UTF-8 字节边界 panic，已通过 `--webpack` 绕过。请勿改回 Turbopack。

## Tech Stack

- Next.js 16 (App Router, webpack mode)
- React 19
- TypeScript 5
- Tailwind CSS 4
- framer-motion (slot machine / 庆祝粒子)
- Vitest + happy-dom (纯算法单测)

## Team Integration Points

| 页面 | 路由 | 负责人 | 入口契约 |
|---|---|---|---|
| P0 首页冰箱 | `/` | 郑以琳 | `useFridgeStore()` 读 `inventory`/`selectedIds`，点食材调 `toggleSelect(id)`，组合好后跳 `/recipes` |
| P1 拍照上传 | `/scan` | 毛郡仪 | 识别完成后调 `useFridgeStore().addItems([{ ingredientId, qty }])` 同步到首页库存 |
| P3a 推荐列表 | `/recipes` | 何 dj · 已实现 | 自动消费 `useFridgeStore().selectedSet` 跑匹配算法 |
| P3b 教程详情 | `/recipes/[id]` | 何 dj · 已实现 | 完成菜肴 → 跳 `/recipes/[id]/done?old=X&new=Y` |
| P3c 庆祝层 | `/recipes/[id]/done` | 何 dj · 已实现 | 3 秒后 `router.replace('/')` 回首页 |
| P4 个人成就 | `/profile` | zyx | 订阅 `useCheckinStore()` 读 `history`/`streak`/`lastCookedDate` |

## Architecture

```
src/
├── types/              领域类型 (Ingredient/Recipe/CookingDoneEvent)
├── mock/               30 种食材 + 15 道菜谱
├── lib/                纯算法层 (TF-IDF + Cosine + 打分)
├── store/              React Context store (fridge/recipe/checkin) + Providers
├── components/         共享组件 (BottomTab/IngredientChip/MatchCircles/CookingTimer/SlotMachine/CelebrationLayer)
├── design/             设计 token
└── app/                Next.js App Router 路由
```

## Stores

| Hook | 提供 |
|---|---|
| `useFridgeStore()` | `inventory`, `selectedIds`, `selectedSet`, `addItems()`, `removeItem()`, `toggleSelect()`, `clearSelection()` |
| `useRecipeStore()` | `allRecipes`, `getRecipe(id)`, `rankedForSelected`, `slotCandidates` |
| `useCheckinStore()` | `history`, `streak`, `lastCookedDate`, `recordCooking(recipeId) → { oldStreak, newStreak }` |

所有 store 均 localStorage 持久化（`fridgemate:fridge` / `fridgemate:checkin`）。

## Recommendation Algorithm

主算法：**TF-IDF + Cosine Similarity**（参考 Yummly 开源克隆 + Food.com TF-IDF 论文），叠加减脂适配（`α=0.2`）与时长（`β=0.1`）两项约束修正。

```
sim(u, r)   = cos(u, r) over IDF-weighted vectors
score(R)    = sim(u, r) × (1 + 0.2·fatLossScore/5 + 0.1·(1 - cookTimeMin/60))
```

详见 [src/lib/match.ts](src/lib/match.ts) 与设计文档 `../../docs/superpowers/specs/2026-05-20-fridgemate-p3-design.md` §4。

## Tests

```bash
npm test           # 一次性跑 14 个算法单测
npm run test:watch # watch 模式
```

只覆盖纯算法层（TF-IDF / Cosine / Score / Coverage / Rank / Slot 候选）。UI 层不写单测，通过浏览器手测验收。

## Lint / Type Check

```bash
npm run lint
npx tsc --noEmit
```

React 19 启用了新的 `react-hooks/purity` 规则，所有 `Math.random()` 都不能在 render 中调用。已通过 `useState(() => ...)` 初始化函数处理。
