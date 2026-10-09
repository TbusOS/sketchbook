# sketchbook 实施计划与进度

> **接手的人(或 AI)先读这里。** 本文件是唯一的进度记录:做完一项就把 `[ ]` 改成 `[x]`,
> 写上日期和 commit。设计理由在 [`DESIGN.md`](DESIGN.md),本机环境在 [`DEVELOP.md`](DEVELOP.md)。
>
> 状态行(每次停下前更新):
> **2026-10-10 · v1 已上线**(README、网页 https://doc.tbusos.com/sketchbook/ 、GitHub 主页)。下一步见文末「待办」和 v2

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
- [x] 用 playwright 截 GitHub 上 README 的图,浅深各看一遍:字体、配图、动画都正常,0 张图加载失败
- [x] `.github/workflows/refresh.yml`:每天更新 + 发布 Pages + 新上架开 issue。第一次跑:构建成功、部署被拒(`github-pages` 环境只允许当时的临时分支 `render-test`),加上 main 后重跑成功
- [x] 打开 Pages(`build_type=workflow`),`https://doc.tbusos.com/sketchbook/` 返回 200,线上截图字体正常
- [x] 推 main(`69bbfb7`),删掉临时分支 `render-test`
- [x] 仓库 topics(11 个)、描述、主页地址;LICENSE 只留 MIT 正文(多一段说明时 GitHub 显示 NOASSERTION),字体许可放 `NOTICE`
- [x] 外发前检查:黑话、自造简称、敏感词两条、本机路径,93 个文件全部 0 命中

## 阶段 4 · GitHub 主页

- [x] 生成 `profile/README.md`(图片引用 sketchbook 网页上的文件)
- [x] 推到 `TbusOS/TbusOS`(`e03059a`),截图确认。注意:GitHub 图片代理第一次抓图可能超时、显示裂图,刷新一次就好

## 待办(需要人手动,或要 user 决定)

- [ ] 上传 `art/social-preview.png`:仓库 Settings → General → Social preview(GitHub 没有接口)
- [ ] GitHub 主页置顶 6 个精选仓库(同样没有接口)
- [ ] 6 个仓库的 homepage 填的是 `http://`:sky-skills、engram、android-llm-bridge、claude-code-memory-checkpoint、ai-doc、Helix。
      生成时已自动改成 https,但仓库页右上角显示的还是 http,建议在各仓库设置里改掉
- [ ] `vim-ide-enhanced` 的 homepage 填成了 CodeMetrics 的地址
- [ ] 收录的仓库里 7 个没有许可证:ai-doc、SkymOS、openwrt-tools、memcode、mlx-pager、cursor-memory-server、whetstone-curator;
      Helix、clangd-kernel-helper 的许可证 GitHub 认不出(NOASSERTION)。没有许可证,别人不敢拿去用
- [ ] Actions 警告:几个官方 action 还是 Node 20(GitHub 现在强制用 Node 24 跑,结果不受影响);
      `ubuntu-latest` 2026-10-19 起换成 Ubuntu 26。升级 action 版本前先查各自的 release 说明,别凭印象改版本号

## 下一版(v2,已和 user 约定先不做)

- [ ] 33 个成员仓库 README 底部加一行「看 TbusOS 的全部项目 →」
- [ ] 每个仓库一张 1200×630 分享图(发微信 / X 用)
- [ ] 20 秒左右的汇总短视频(graphite 的 `export.mjs` 逐帧导出)
- [ ] 手动:上传 `art/social-preview.png` 为仓库 Social preview;主页置顶 6 个仓库

## 记录

| 日期 | 做了什么 | commit |
|---|---|---|
| 2026-10-10 | 阶段 0–2 全部,阶段 3 的本机部分 | `69bbfb7` |
| 2026-10-10 | LICENSE 修正;Pages 部署权限;主页 README | `64a5b0c` / TbusOS `e03059a` |
