# sketchbook 实施计划与进度

> **接手的人(或 AI)先读这里。** 本文件是唯一的进度记录:做完一项就把 `[ ]` 改成 `[x]`,
> 写上日期和 commit。设计理由在 [`DESIGN.md`](DESIGN.md),本机环境在 [`DEVELOP.md`](DEVELOP.md)。
>
> 状态行(每次停下前更新):
> **2026-10-10 05:20 · v1 已上线,分享预览图已上传**。下一步:按「待办」的顺序做;第 2 组要 user 同意才动(改的是别的仓库)

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

## 待办(按顺序做;2026-10-10 05:20 用 GitHub 接口核对过状态)

### 1 · user 在网页上手动做(GitHub 没有接口)

- [x] 上传 `art/social-preview.png` 为仓库 Social preview —— 2026-10-10 user 已上传,
      接口确认 `usesCustomOpenGraphImage: true`
- [ ] 换主页置顶:现在是 `battery-historian`(fork 自 google/battery-historian)和 `openwrt-tools`;
      建议换成 sketchbook + 5 个精选(最多 6 个)

### 2 · 我来做,但改的是别的仓库,先等 user 同意

- [ ] 主页地址改正(每个一条 `gh repo edit --homepage`,改错能改回):
      6 个 `http://` → `https://`:sky-skills、engram、android-llm-bridge、claude-code-memory-checkpoint、ai-doc、Helix;
      `vim-ide-enhanced` 现在填的是 CodeMetrics 的地址。汇总页已自动用 https,但各仓库页右上角仍是错的
- [ ] 补许可证(等 user 定种类,建议 MIT,和其他仓库一致):
      没有许可证的 7 个:ai-doc、SkymOS、openwrt-tools、memcode、mlx-pager、cursor-memory-server、whetstone-curator;
      GitHub 认不出的 2 个(NOASSERTION):Helix、clangd-kernel-helper,先看它们的 LICENSE 文件哪里不标准
- [ ] 33 个成员仓库 README 底部加一行「看 TbusOS 的全部项目 →」(33 次提交;访客从任何一个仓库进来都能看到其他项目)

### 3 · 让更多人看到(拿 star 靠这一组)

- [ ] awesome 列表投稿,先写草稿给 user 挑:awesome-claude-code(sky-skills、whetstone、
      claude-code-memory-checkpoint、sky-claude-hud)、awesome-mcp-servers(android-llm-bridge、memcode)。
      向别人的仓库提 PR 属于对外公开,要 user 定
- [ ] 每个仓库一张 1200×630 分享图(发微信、朋友圈、V2EX、掘金、X)
- [ ] 20 秒左右的汇总短视频(graphite 的 `export.mjs` 逐帧导出,素材已有)

### 4 · 维护

- [ ] 确认第一次定时更新跑成功:2026-10-10 01:17 UTC(北京时间 09:17)。之前两次是推送和手动触发
- [ ] `runs-on` 固定成 `ubuntu-24.04`:`ubuntu-latest` 2026-10-19 起换成 Ubuntu 26,固定一行避免那天出意外
- [ ] Actions 的 Node 20 警告:GitHub 现在强制用 Node 24 跑,结果不受影响;
      升级 action 版本前先查各自的 release 说明,别凭印象改版本号

## 记录

| 日期 | 做了什么 | commit |
|---|---|---|
| 2026-10-10 | 阶段 0–2 全部,阶段 3 的本机部分 | `69bbfb7` |
| 2026-10-10 | LICENSE 修正;Pages 部署权限;主页 README | `64a5b0c` / TbusOS `e03059a` |
| 2026-10-10 | user 上传分享预览图;待办按 4 组重排 | 提交标题「docs: PLAN 记分享预览图已上传,待办按 4 组重排」 |
