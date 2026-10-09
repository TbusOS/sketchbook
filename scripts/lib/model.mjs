// model.mjs — join the hand-written catalog with the fetched GitHub data.
//
// One pure function, so the inclusion rule (docs/DESIGN.md §2) lives in one place
// and the tests can feed it made-up repos. Everything the README, the images and
// the site show comes out of buildModel(); none of them read catalog.yaml or
// repos.json on their own.

export function statusOf(topics) {
  for (const s of ['wip', 'stable', 'archive']) if (topics.includes(`status-${s}`)) return s;
  return '';
}

// A homepage on github.com is just the repo page again (some repos point at their
// own README, one points at a different repo), so only other sites count as a demo.
// Six repos still say http:// in their GitHub homepage field (2026-10-10). Their
// sites are GitHub Pages, which serve https, so the link is upgraded rather than
// sending readers through a redirect (or a browser warning) — only for hosts known
// to serve https; anything else is left as written.
export function demoOf(entry, gh) {
  const h = entry.demo || gh.homepage || '';
  if (!h || /^https?:\/\/(www\.)?github\.com\//.test(h)) return '';
  return h.replace(/^http:\/\/(doc\.tbusos\.com|[\w-]+\.github\.io)(?=[/:]|$)/i, 'https://$1');
}

// The README says "2026-09", not "3 days ago": a relative time changes every day
// and would make the daily job commit every day.
export function monthOf(day) { return String(day || '').slice(0, 7); }

function project(name, entry, gh, extra, threshold) {
  return {
    name,
    url: gh.url,
    en: entry.en || gh.description,
    zh: entry.zh || entry.en || gh.description,
    hookEn: entry.hook_en || '',
    hookZh: entry.hook_zh || '',
    icon: entry.icon || 'doc',
    demo: demoOf(entry, gh),
    language: gh.language,
    languageColor: gh.languageColor,
    license: gh.license,
    commits: gh.commits,
    updated: gh.updated,
    month: monthOf(gh.updated),
    stars: gh.stars,
    showStars: gh.stars >= threshold,
    status: statusOf(gh.topics),
    topics: gh.topics,
    ...extra,
  };
}

export function buildModel(catalog, data) {
  const problems = [];
  const threshold = catalog.star_threshold == null ? 10 : catalog.star_threshold;
  const entries = catalog.repos || {};
  const archived = catalog.archive || {};
  const excluded = catalog.exclude || {};
  const byName = new Map(data.repos.map(r => [r.name, r]));
  const placed = new Set();

  const groups = catalog.groups.map(g => ({ ...g, repos: [] }));
  const groupById = new Map(groups.map(g => [g.id, g]));

  for (const [name, entry] of Object.entries(entries)) {
    const gh = byName.get(name);
    if (!gh) { problems.push(`catalog repo "${name}" not found among the public repos on GitHub`); continue; }
    if (gh.fork) { problems.push(`catalog repo "${name}" is a fork; forks are never listed`); placed.add(name); continue; }
    const g = groupById.get(entry.group);
    if (!g) { problems.push(`catalog repo "${name}" has unknown group "${entry.group}"`); continue; }
    if (name in excluded) problems.push(`"${name}" is both listed and excluded`);
    g.repos.push(project(name, entry, gh, { group: g.id, pen: g.pen }, threshold));
    placed.add(name);
  }

  const archive = [];
  for (const [name, entry] of Object.entries(archived)) {
    const gh = byName.get(name);
    if (!gh) { problems.push(`archive repo "${name}" not found among the public repos on GitHub`); continue; }
    archive.push(project(name, entry, gh, { group: 'archive', pen: 'grey' }, threshold));
    placed.add(name);
  }

  const out = [];
  const fresh = [];
  for (const gh of data.repos) {
    if (placed.has(gh.name) || gh.fork) continue;
    if (gh.name in excluded) { out.push({ name: gh.name, reason: excluded[gh.name] }); continue; }
    if (gh.topics.includes('sandbox')) { out.push({ name: gh.name, reason: 'topic sandbox' }); continue; }
    if (gh.topics.includes('status-archive') || gh.archived) {
      archive.push(project(gh.name, {}, gh, { group: 'archive', pen: 'grey' }, threshold));
      continue;
    }
    fresh.push(project(gh.name, {}, gh, { group: 'fresh', pen: 'sky' }, threshold));
  }
  fresh.sort((a, b) => b.updated.localeCompare(a.updated));

  const listed = new Map(groups.flatMap(g => g.repos).map(r => [r.name, r]));
  const featured = [];
  for (const name of catalog.featured || []) {
    const r = listed.get(name);
    if (r) featured.push(r); else problems.push(`featured "${name}" is not a listed repo`);
  }

  const shown = [...listed.values(), ...fresh];
  const stats = {
    projects: shown.length,
    commits: shown.reduce((s, r) => s + r.commits, 0),
    languages: new Set(shown.map(r => r.language).filter(Boolean)).size,
    groups: groups.filter(g => g.repos.length).length,
  };

  return {
    owner: catalog.owner, site: catalog.site, blog: catalog.blog || '',
    groups, featured, archive, fresh, excluded: out, problems, stats,
    all: [...listed.values(), ...fresh, ...archive],
  };
}
