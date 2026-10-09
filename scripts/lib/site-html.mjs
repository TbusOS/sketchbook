// site-html.mjs — the markup of the web page, section by section.
//
// Both languages are in the page; :root[data-lang] hides one (site.css), so a
// reader switches without a reload and a shared link can force one with ?lang=zh.
// Every project is a plain <a> to its GitHub page: the page works with no script.
import { Sketch, Props, esc } from './svg.mjs';
import { drawBanner } from '../art/banner.mjs';
import { drawShelf } from '../art/shelf.mjs';
import { drawIcon } from '../art/icons.mjs';

export const L = (en, zh) => `<span class="lang-en">${en}</span><span class="lang-zh">${zh}</span>`;
const STATUS = { stable: ['stable', '可用'], wip: ['in progress', '在做'], archive: ['archived', '已归档'] };

export function inlineSvg(fig, o = {}) {
  const a11y = o.decorative ? ' aria-hidden="true" focusable="false"' : ` role="img" aria-label="${esc(fig.title)}"`;
  return `<svg viewBox="0 0 ${fig.w} ${fig.h}" class="gfig${o.cls ? ' ' + o.cls : ''}"${a11y} data-fig="${o.id}"` +
    `${o.motion === false ? '' : ' data-motion="1"'}${o.shrink ? ' data-allow-shrink=""' : ''}>` +
    `${fig.css ? `<style>${fig.css}</style>` : ''}<g filter="url(#g-pencil)">${fig.art}</g><g>${fig.labels}</g></svg>`;
}

function iconSvg(r, i) {
  const S = Sketch.create({ seed: 300 + i, id: `ic-${r.name}` });
  S.at(0.1, 1.1, () => drawIcon(S, Props, r.icon, 50, 50, 0.84, r.pen));
  return inlineSvg({ w: 100, h: 100, art: S.art(), labels: '', css: S.css(), title: '' }, { id: `ic-${r.name}`, decorative: true });
}

const commits = n => L(`${n} commit${n === 1 ? '' : 's'}`, `${n} 次提交`);
const updated = r => `<time data-ago datetime="${r.updated}">${r.month}</time>`;

export function head(model, { css, ogImage }) {
  const s = model.stats;
  const title = `TbusOS sketchbook — ${s.projects} open-source projects`;
  const desc = `${s.projects} open-source projects by TbusOS, drawn in pencil: AI agent tooling, Linux kernel & embedded, learning and running LLMs.`;
  return `<!doctype html>
<html lang="en" data-lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${model.site}">
${ogImage ? `<meta property="og:image" content="${model.site}${ogImage}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#f6efe2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#131925" media="(prefers-color-scheme: dark)">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M6 26l3-9L22 4l6 6-13 13z' fill='%23e2772c' stroke='%2339332c' stroke-width='2' stroke-linejoin='round'/%3E%3Cpath d='M6 26l3-9 6 6z' fill='%23f0c9a2' stroke='%2339332c' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E">
<script>(function(){var r=document.documentElement,l=null,t=null;try{l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('sky-lang');t=localStorage.getItem('graphite-theme')}catch(e){}if(l!=='en'&&l!=='zh')l=/^zh/i.test(navigator.language||'')?'zh':'en';r.setAttribute('data-lang',l);r.lang=l==='zh'?'zh-CN':'en';if(t==='dark'||t==='light')r.setAttribute('data-theme',t)})();</script>
${css.map(href => `<link rel="stylesheet" href="${href}">`).join('\n')}
</head>`;
}

export function topBar(model) {
  return `<header class="top"><div class="wrap">
<a class="brand" href="#top">TbusOS · <b>${L('sketchbook', '速写本')}</b></a>
<nav class="nav" aria-label="sections">
<a href="#featured">${L('Featured', '精选')}</a><a href="#shelf">${L('Shelf', '书架')}</a><a href="#all">${L('All projects', '全部项目')}</a><a href="https://github.com/TbusOS/sketchbook">GitHub</a>
</nav>
<div class="toggles">
<button class="toggle" type="button" data-lang-toggle="en" aria-label="English">EN</button><button class="toggle" type="button" data-lang-toggle="zh" aria-label="中文">中</button>
<button class="toggle" type="button" data-theme-toggle aria-label="dark / light">☾</button>
</div></div></header>`;
}

export function hero(model, root) {
  const s = model.stats;
  const over = lang => {
    const f = drawBanner(model, { lang, theme: 'light', root });
    return inlineSvg(f, { id: `banner-${lang}`, cls: `lang-${lang}`, shrink: true });
  };
  return `<section class="hero" id="top">
<h1 class="sr-only">${L(`TbusOS sketchbook: ${s.projects} open-source projects`, `TbusOS 速写本:${s.projects} 个开源项目`)}</h1>
<div class="hero-frame"><div class="hero-stage">
<img class="illo-light" src="media/hero.webp" alt="" width="1600" height="686" fetchpriority="high">
<img class="illo-dark" src="media/hero-dark.webp" alt="" width="1600" height="687">
${over('en')}${over('zh')}
</div></div>
<div class="wrap">
<p class="stats">${L(`<b>${s.projects}</b> projects · <b>${s.commits.toLocaleString('en')}</b> commits · <b>${s.languages}</b> languages · refreshed every day`,
    `<b>${s.projects}</b> 个项目 · <b>${s.commits}</b> 次提交 · <b>${s.languages}</b> 种语言 · 每天自动更新`)}</p>
<p class="lede">${L('Tools for AI coding agents, Linux kernel and driver work, and learning LLMs — everything open-source from TbusOS, on one page. Each card opens the project on GitHub.',
    '给 AI 编程 Agent 用的工具、Linux 内核与驱动开发、大模型学习 —— TbusOS 所有开源项目都在这一页。每张卡片都能直接打开对应的 GitHub 仓库。')}</p>
</div></section>`;
}

export function featured(model) {
  const cards = model.featured.map(r => `<article class="fcard" data-pen="${r.pen}" id="f-${r.name}">
<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>
<div class="pic"><img class="illo-light" src="media/v-${r.name}.webp" alt="" loading="lazy" width="960" height="510"><img class="illo-dark" src="media/v-${r.name}-dark.webp" alt="" loading="lazy" width="960" height="510"></div>
<h3><a href="${r.url}">${r.name}</a></h3>
<p class="hook">${L(esc(r.hookEn), esc(r.hookZh))}</p>
<p class="desc">${L(esc(r.en), esc(r.zh))}</p>
<p class="facts">${[r.language, commits(r.commits), L('updated ', '更新于 ') + updated(r), r.showStars ? `★ ${r.stars}` : ''].filter(Boolean).join(' · ')}</p>
<div class="acts"><a class="g-btn g-btn--accent" href="${r.url}">${L('View on GitHub', '去 GitHub 看看')}</a>${r.demo ? `<a class="g-btn" href="${r.demo}">${L('Live demo ↗', '在线演示 ↗')}</a>` : ''}</div>
</article>`).join('\n');
  return `<section class="band" id="featured"><div class="wrap">
<h2>${L('Featured', '精选')}<span class="n">6</span></h2>
<p class="intro">${L('Six projects to start with — the most worked on, and most of them with a live demo you can open right now.', '先从这 6 个看起:投入最多的几个,大多有能直接打开的在线演示。')}</p>
<div class="fgrid">${cards}</div>
<p class="star-note">${L('If one of these saves you time, a ★ on its repository helps other people find it.', '如果其中哪个帮你省了时间,去它的仓库点个 ★,能让更多人看到它。')}</p>
</div></section>`;
}

export function shelf(model) {
  const one = lang => inlineSvg(drawShelf(model, { lang, theme: 'light' }), { id: `shelf-${lang}`, cls: `lang-${lang} shelf` });
  return `<section class="band" id="shelf"><div class="wrap">
<h2>${L('The shelf', '书架')}</h2>
<p class="intro">${L('One book per project. Thicker means more commits, the colour is the group, ★ marks the featured six. Click a book to jump to its card.', '每本书是一个项目:书越厚提交越多,颜色是分组,★ 是精选的 6 个。点一本书,跳到下面它的卡片。')}</p>
<div class="gpan">${one('en')}${one('zh')}</div>
</div></section>`;
}

function pcard(r, i, order) {
  const st = STATUS[r.status];
  const text = [r.name, r.en, r.zh, r.language].join(' ').toLowerCase();
  return `<article class="pcard" id="p-${r.name}" data-pen="${r.pen}" data-group="${r.group}" data-order="${order}" data-commits="${r.commits}" data-updated="${r.updated}" data-text="${esc(text)}"${r.demo ? ' data-demo=""' : ''}>
${iconSvg(r, i)}
<h3><a href="${r.url}">${r.name}</a></h3>
<p>${L(esc(r.en), esc(r.zh))}</p>
<div class="meta">${r.language ? `<span>${r.language}</span>` : ''}<span>${commits(r.commits)}</span><span>${updated(r)}</span>${st ? `<span class="badge">${L(...st)}</span>` : ''}${r.showStars ? `<span>★ ${r.stars}</span>` : ''}${r.demo ? `<a href="${r.demo}">${L('demo ↗', '演示 ↗')}</a>` : ''}</div>
</article>`;
}

export function all(model) {
  const groups = model.groups.filter(g => g.repos.length);
  if (model.fresh.length) groups.push({ id: 'fresh', en: 'New on the shelf', zh: '新上架', pen: 'sky', repos: model.fresh });
  const listed = groups.flatMap(g => g.repos);
  const chips = [`<button class="chip" type="button" data-filter="all" aria-pressed="true">${L('All', '全部')} <span class="c">${listed.length}</span></button>`]
    .concat(groups.map(g => `<button class="chip" type="button" data-filter="${g.id}" data-pen="${g.pen}" aria-pressed="false">${L(esc(g.en), esc(g.zh))} <span class="c">${g.repos.length}</span></button>`));
  let n = 0;
  const cards = listed.map(r => pcard(r, n, n++)).join('\n');
  const earlier = model.archive.length ? `<details class="earlier"><summary>${L('Earlier work', '早期作品')} (${model.archive.length})</summary><div class="pgrid">${model.archive.map(r => pcard(r, n, n++)).join('\n')}</div></details>` : '';
  return `<section class="band" id="all"><div class="wrap">
<h2>${L('All projects', '全部项目')}<span class="n">${listed.length}</span></h2>
<p class="intro">${L('Filter by group, search by name or words in the description, or sort by commits or by the latest commit.', '按分组筛选,按名字或介绍里的词搜索,也可以按提交数或最近更新排序。')}</p>
<div class="tools">
<div class="chips" role="group" aria-label="groups">${chips.join('')}</div>
<input class="search" id="search" type="search" data-ph-en="Search projects…" data-ph-zh="搜索项目…" placeholder="Search projects…" aria-label="search">
<label class="count"><input type="checkbox" id="only-demo"> ${L('with live demo', '有在线演示')}</label>
<select class="sort" aria-label="sort"><option value="group">${'Shelf order / 书架顺序'}</option><option value="commits">${'Most commits / 提交最多'}</option><option value="recent">${'Recently updated / 最近更新'}</option></select>
<span class="count" id="count" aria-live="polite"></span>
</div>
<div class="pgrid" id="pgrid">${cards}</div>
<p class="empty" id="empty" hidden>${L('Nothing matches. Try another word.', '没有匹配的项目,换个词试试。')}</p>
${earlier}
</div></section>`;
}

export function how(model) {
  const step = (h, p) => `<li><h3>${h}</h3><p>${p}</p></li>`;
  return `<section class="band" id="how"><div class="wrap">
<h2>${L('How this page is made', '这一页是怎么做出来的')}</h2>
<ol class="how">
${step(L('Written by hand', '手写的部分'), L('<code>catalog.yaml</code>: the groups, one sentence per project, the six featured picks.', '<code>catalog.yaml</code>:分组、每个项目一句话介绍、精选哪 6 个。'))}
${step(L('Fetched every day', '每天拉取的部分'), L('Commits, last commit, language and licence come from the GitHub API into <code>data/repos.json</code>.', '提交数、最近提交、语言、许可证,从 GitHub API 拉到 <code>data/repos.json</code>。'))}
${step(L('Drawn by code', '由代码画出来'), L('Lines, handwriting, icons and the shelf are drawn stroke by stroke in the graphite pencil style. The desk scene and card pictures come from an image model.', '线条、手写字、图标和书架都按石墨铅笔画风一笔一笔画出来;桌面场景和卡片配图由出图模型画。'))}
${step(L('Never out of date', '不会过时'), L('A GitHub Action rebuilds this page and the README daily. A new public repository appears under "New on the shelf" the next day.', 'GitHub Action 每天重建这一页和 README。新开的公开仓库第二天就会出现在「新上架」里。'))}
</ol>
</div></section>`;
}

export function footer(model, built) {
  return `<footer><div class="wrap">
<span>${L('Drawn with the graphite style from', '画风来自')} <a href="https://github.com/TbusOS/sky-skills">sky-skills</a> · ${L('code MIT, fonts OFL 1.1', '代码 MIT,字体 OFL 1.1')}</span>
<span><a href="https://github.com/TbusOS/sketchbook">${L('Source of this page', '本页源码')}</a> · <a href="https://github.com/TbusOS">@TbusOS</a>${model.blog ? ` · <a href="${model.blog}">${L('Blog', '博客')}</a>` : ''} · ${L('built', '生成于')} ${built}</span>
</div></footer>`;
}
