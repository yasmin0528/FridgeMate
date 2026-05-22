<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Git 提交规范

### Commit message 格式

- **English prefix + 中文正文**，前缀从下列五个里选：
  - `feat:` 新功能
  - `fix:` 修 bug
  - `refactor:` 重构（行为不变）
  - `chore:` 构建/依赖/配置/文档等杂项
  - `merge:` 合并
- **不用 emoji**（commit、UI、代码、文档都不用）。
- 一次 commit 只做一件事；refactor commit 不能含行为变更。

### 工作流

1. 改代码前先 `git pull`。
2. 改完后总结 diff（动了哪些文件、为什么）。
3. **要用户明确同意才能 commit**。同意 commit 即同意 push 到 `origin/main`，中间不要再问。
4. 用 `git add <具体文件>`，**禁止** `git add -A` 或 `git add .`。
5. 禁止 `--no-verify` 跳 hook，禁止 force-push 到 `main`。
6. 禁止提交 `.env`、密钥、凭证、`.DS_Store`、IDE 配置、构建产物。

---

## 项目特有规则

- 项目路径含中文字符，Next.js 默认 Turbopack 会触发 UTF-8 字节边界 panic。`dev` 脚本固定用 `--webpack`，请勿改回。
- Mock 数据扩缩容时同步跑 `npm test` 确认 `src/mock/mock.test.ts` 的完整性检查通过（食材总数、类别分布、菜谱字段、外链 URL 格式、无孤立食材）。
- 修改 `src/store/` 下的 reducer 时，跑 `npm test` 确认 reducer 不可变性契约（[fridgeStore.test.ts](src/store/fridgeStore.test.ts) / [checkinStore.test.ts](src/store/checkinStore.test.ts)）。
- localStorage 数据 schema 变了，bump [src/store/fridgeStore.tsx](src/store/fridgeStore.tsx) 顶部的 `STORAGE_VERSION` 常量；老缓存自动作废。
