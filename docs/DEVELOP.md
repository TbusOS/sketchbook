# 在本机开发

## 装环境

```bash
git clone https://github.com/TbusOS/sketchbook && cd sketchbook
npm ci                 # Node ≥ 20;开发依赖 sharp、playwright 只在画图和截图时用
npx playwright install chromium    # 本机还没有 Chromium 时
gh auth login          # fetch.mjs 通过 gh 调 GitHub API
```

第一次构建会从 GitHub release 下载霞鹜文楷 GB 屏幕阅读版(26 MB)到 `.cache/fonts/`,
用的是 `curl`,会走 `HTTPS_PROXY`。

## 常用命令

| 命令 | 做什么 |
|---|---|
| `npm run fetch` | 拉 GitHub 数据 → `data/repos.json` |
| `npm run build` | 画图、写 README、写网页到 `site/` |
| `node scripts/build.mjs --no-site` | 只画图和写 README,快 |
| `npm run check` | C1–C7 检查(`scripts/check.mjs` 文件头有说明) |
| `npm test` | 单测(收录规则、链接、star 档位) |
| `python3 -m http.server 8765 --directory site` | 本机看网页(直接双击打开时字体会被浏览器拦截) |
| `node scripts/preview.mjs art/xxx.svg out.png 1200 --wait=9000 [--dark]` | 把一张图截成 PNG 看 |
| `node scripts/social.mjs` | 重画分享预览图 `art/social-preview.png` |

## 常见改动

**加一个仓库 / 改介绍**:改 `catalog.yaml`,`npm run build && npm run check`。
`icon` 从 `scripts/art/icons.mjs` 里挑一个名字;想要新图标就在那里加一个函数。

**换精选**:改 `catalog.yaml` 的 `featured`。新精选的仓库要有配图:
在 `art/prompts/` 加 `v-<仓库名>.txt` 和 `v-<仓库名>-dark.txt`(照着现有的写),
把名字加进 `scripts/illo.sh` 和 `scripts/art-import.mjs` 的列表,然后:

```bash
scripts/illo.sh v-<仓库名> && scripts/illo.sh v-<仓库名>-dark   # 需要本机 codex
node scripts/art-import.mjs <仓库名>
```

出图的写法和坑见 sky-skills 的 `skills/graphite-design/references/image-prompts.md`,
本仓库每张图的记录在 `art/prompts/README.md`。

**改画风库**:`vendor/graphite/` 不要直接改,改 sky-skills 再拷过来(见 `vendor/graphite/SOURCE`)。

## 改完之后

1. `npm run build && npm run check && npm test`
2. 本机看网页,再跑 sky-skills 的客观检查(浅深两个主题):
   `node <sky-skills>/skills/design-review/scripts/check_objective.mjs --themes=dark,light site/index.html`
3. 提交。推到 main 后 Actions 会重新构建并发布网页。

## 不要提交的

`site/`(Actions 构建)、`.cache/`(字体原件、出图原图)、`node_modules/`。都在 `.gitignore` 里。
