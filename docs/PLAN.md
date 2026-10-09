# sketchbook 实施计划与进度

> **接手的人(或 AI)先读这里。** 本文件是唯一的进度记录:做完一项就把 `[ ]` 改成 `[x]`,
> 写上日期和 commit。设计理由在 [`DESIGN.md`](DESIGN.md),本机环境在 [`DEVELOP.md`](DEVELOP.md)。
>
> 状态行(每次停下前更新):
> **2026-10-10 · v1 开发中 · 当前在阶段 3(上线):代码、图、文档都已完成,正在推送和打开 Pages**

## 怎么接着做

```bash
git clone https://github.com/TbusOS/sketchbook && cd sketchbook
npm ci                      # 依赖:yaml、subset-font;开发用 sharp、playwright
npm run fetch               # 需要 GITHUB_TOKEN 或已登录的 gh
npm run build && npm run check && npm test
```

然后找到下面第一个没打勾的任务继续。出图相关的任务需要本机有 `codex`(见 DEVELOP.md)。

## 阶段 0 · 准备(2026-10-10 完成)

- [x] 调研:TbusOS 159 个仓库 → 自有公开仓 45 个,定收录 33 / 早期 1 / 不收 11
- [x] user 定名字 `sketchbook`、README 英文为主加中文版、第一版做汇总仓 + 主页 README
- [x] GitHub 上建 `TbusOS/sketchbook`(公开)
- [x] 拷 graphite 画图库到 `vendor/graphite/`(sky-skills `99b234c`)
- [x] **实测 README 里 SVG 的能力**:嵌入字体、嵌入 WebP、滤镜、CSS 动画都能用(DESIGN §5)
- [x] `catalog.yaml`:6 组、33 个仓库的中英文介绍、6 个精选

## 阶段 1 · 配图(出图模型)

- [x] 横幅浅色 `hero`(1916×821),一次通过
- [x] 横幅深色 `hero-dark`
- [x] 6 张精选配图,各浅、深两张(`v-<仓库名>`、`v-<仓库名>-dark`)——14 张全部一次通过
- [x] 逐张验收:没有字、颜色只在指定的东西上、角色和横幅一致
- [x] 量出横幅上速写本两页的像素范围(浅、深相差 ≤ 4 px,共用一组)
- [x] 转 WebP 放 `art/source/`(35–86 KB/张),记录在 `art/prompts/README.md`

## 阶段 2 · 生成器

- [x] `scripts/fetch.mjs`:GraphQL → `data/repos.json`;每页 30 个(100 个会 HTTP 502)、失败重试、失败不覆盖旧文件
- [x] `scripts/lib/model.mjs`:收录规则(纯函数,12 条单测;删掉 sandbox 规则时对应测试会失败,已验证)
- [x] `scripts/lib/fonts.mjs`:按用到的字裁字体
- [x] `scripts/lib/svg.mjs`:独立 SVG,浅深各一份(深色文件要先放浅色变量再覆盖,否则字体变量丢失)
- [x] `scripts/art/`:横幅、精选卡、34 个图标、书架(原计划的「项目地图」改成书架,理由见 shelf.mjs 文件头)
- [x] `scripts/lib/readme.mjs`、`profile.mjs`
- [x] `scripts/lib/site.mjs` + `site-html.mjs` + `web/`:网页
- [x] `scripts/build.mjs`(含 `--check`)、`scripts/check.mjs`(C1–C7,C5 改坏一张图能抓到,已验证)、`test/`

## 阶段 3 · 上线

- [x] 本机跑 `check_objective.mjs`(sky-skills),浅深两个主题 5 项全过
- [ ] 用 playwright 截 GitHub 上 README 的图,浅深各看一遍
- [x] `.github/workflows/refresh.yml`:每天更新 + 发布 Pages + 新上架开 issue(已写,未在 GitHub 上跑过)
- [ ] 打开 Pages(`build_type=workflow`),确认 `https://doc.tbusos.com/sketchbook/` 能打开
- [ ] 推 main,删掉临时分支 `render-test`
- [ ] 仓库 topics、描述、主页地址
- [x] 外发前检查:黑话、自造简称、敏感词两条、本机路径,93 个文件全部 0 命中

## 阶段 4 · GitHub 主页

- [ ] 生成 `profile/README.md`(图片引用 sketchbook 网页上的文件)
- [ ] 推到 `TbusOS/TbusOS`,截图确认主页显示正常

## 下一版(v2,已和 user 约定先不做)

- [ ] 33 个成员仓库 README 底部加一行「看 TbusOS 的全部项目 →」
- [ ] 每个仓库一张 1200×630 分享图(发微信 / X 用)
- [ ] 20 秒左右的汇总短视频(graphite 的 `export.mjs` 逐帧导出)
- [ ] 手动:上传 `art/social-preview.png` 为仓库 Social preview;主页置顶 6 个仓库

## 记录

| 日期 | 做了什么 | commit |
|---|---|---|
| 2026-10-10 | 阶段 0–2 全部,阶段 3 的本机部分 | (首个提交) |
