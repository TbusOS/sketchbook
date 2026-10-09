# sketchbook — 给接手的 AI 看

TbusOS 全部公开仓库的汇总页:GitHub README(英文 + 中文)和网页 `https://doc.tbusos.com/sketchbook/`,
石墨铅笔画风(sky-skills 的 graphite-design)。

**开工前先读 `docs/PLAN.md`**:那里是进度,第一个没打勾的任务就是下一步。设计理由在 `docs/DESIGN.md`,
命令在 `docs/DEVELOP.md`。

规矩:

- `README.md`、`README_zh.md`、`art/*.svg`、`profile/README.md` 都是生成的,改源(`catalog.yaml`、`scripts/`、`web/`)再 `npm run build`。
- `vendor/graphite/` 是从 sky-skills 拷来的,不在这里改。
- 做完一项就在 `docs/PLAN.md` 打勾、写日期和 commit,停下来之前更新它的状态行。
- 提交前 `npm run build && npm run check && npm test` 都要过。
- 对外的文字(README、网页、提交信息)不写黑话,先跑 `tech-writing-gate` 的检查脚本。
