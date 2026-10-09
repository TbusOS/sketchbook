import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildModel, statusOf, demoOf, monthOf } from '../scripts/lib/model.mjs';

const repo = (name, extra = {}) => ({
  name, description: `${name} on GitHub`, url: `https://github.com/o/${name}`, homepage: '',
  fork: false, archived: false, stars: 0, forks: 0, created: '2026-01-01', updated: '2026-09-15',
  commits: 10, language: 'Python', languageColor: '#3572A5', license: 'MIT', topics: [], ...extra,
});

const catalog = (extra = {}) => ({
  owner: 'o', site: 'https://x/', star_threshold: 10, featured: ['a'],
  groups: [{ id: 'g1', en: 'G1', zh: '组一', pen: 'orange' }, { id: 'g2', en: 'G2', zh: '组二', pen: 'blue' }],
  repos: {
    a: { group: 'g1', en: 'A does a', zh: 'A 做 a', hook_en: 'hook a', hook_zh: '钩子 a', icon: 'gear' },
    b: { group: 'g2', en: 'B does b', zh: 'B 做 b', icon: 'doc' },
  },
  archive: { old: { en: 'old one', zh: '旧的' } },
  exclude: { junk: 'a test repo' },
  ...extra,
});

test('every public own repo lands in exactly one place', () => {
  const data = { repos: [repo('a'), repo('b'), repo('old'), repo('junk'), repo('box', { topics: ['sandbox'] }), repo('newbie')] };
  const m = buildModel(catalog(), data);
  assert.deepEqual(m.groups.map(g => g.repos.map(r => r.name)), [['a'], ['b']]);
  assert.deepEqual(m.archive.map(r => r.name), ['old']);
  assert.deepEqual(m.fresh.map(r => r.name), ['newbie']);
  assert.deepEqual(m.excluded.map(e => e.name).sort(), ['box', 'junk']);
  assert.deepEqual(m.problems, []);
});

test('forks never appear, even when listed', () => {
  const m = buildModel(catalog(), { repos: [repo('a'), repo('b', { fork: true })] });
  assert.deepEqual(m.groups[1].repos, []);
  assert.match(m.problems.join('\n'), /b.*fork/);
});

test('status-archive topic sends an uncatalogued repo to the archive', () => {
  const m = buildModel(catalog(), { repos: [repo('a'), repo('b'), repo('relic', { topics: ['status-archive'] })] });
  assert.deepEqual(m.archive.map(r => r.name), ['relic']);
  assert.equal(m.archive[0].en, 'relic on GitHub');
});

test('a catalogued repo missing on GitHub is a problem, not a silent gap', () => {
  const m = buildModel(catalog(), { repos: [repo('a')] });
  assert.match(m.problems.join('\n'), /"b".*not found/);
});

test('featured keeps catalog order and must be catalogued', () => {
  const m = buildModel(catalog({ featured: ['b', 'a', 'ghost'] }), { repos: [repo('a'), repo('b')] });
  assert.deepEqual(m.featured.map(r => r.name), ['b', 'a']);
  assert.match(m.problems.join('\n'), /featured "ghost"/);
});

test('stars show only at or above the threshold', () => {
  const m = buildModel(catalog(), { repos: [repo('a', { stars: 9 }), repo('b', { stars: 10 })] });
  assert.equal(m.groups[0].repos[0].showStars, false);
  assert.equal(m.groups[1].repos[0].showStars, true);
});

test('stats count shown projects only', () => {
  const m = buildModel(catalog(), { repos: [repo('a', { commits: 5 }), repo('b', { commits: 7 }), repo('junk', { commits: 100 }), repo('newbie', { commits: 1 })] });
  assert.equal(m.stats.projects, 3);
  assert.equal(m.stats.commits, 13);
});

test('statusOf reads the status-* topics', () => {
  assert.equal(statusOf(['x', 'status-wip']), 'wip');
  assert.equal(statusOf(['status-stable']), 'stable');
  assert.equal(statusOf([]), '');
});

test('demoOf: only a non-GitHub homepage counts as a demo', () => {
  assert.equal(demoOf({}, { homepage: 'https://doc.tbusos.com/x/' }), 'https://doc.tbusos.com/x/');
  assert.equal(demoOf({}, { homepage: 'https://github.com/TbusOS/x#readme' }), '');
  assert.equal(demoOf({ demo: 'https://d/' }, { homepage: '' }), 'https://d/');
});

test('demoOf upgrades http only for hosts known to serve https', () => {
  assert.equal(demoOf({}, { homepage: 'http://doc.tbusos.com/ai-doc/' }), 'https://doc.tbusos.com/ai-doc/');
  assert.equal(demoOf({}, { homepage: 'http://someone.github.io/x' }), 'https://someone.github.io/x');
  assert.equal(demoOf({}, { homepage: 'http://example.org/' }), 'http://example.org/');
});

test('monthOf gives year-month, not a relative time that changes every day', () => {
  assert.equal(monthOf('2026-09-15'), '2026-09');
});

test('card star steps change rarely: 10+, 50+, 100+ … 1k+', async () => {
  const { starStep } = await import('../scripts/art/card.mjs');
  assert.equal(starStep(9), '');
  assert.equal(starStep(10), '★ 10+');
  assert.equal(starStep(73), '★ 50+');
  assert.equal(starStep(1500), '★ 1k+');
});

test('fetch shape: last commit date and count come from the default branch head', async () => {
  const { shape } = await import('../scripts/fetch.mjs');
  const r = shape({
    name: 'x', description: null, url: 'u', homepageUrl: null, isFork: false, isArchived: false,
    stargazerCount: 3, forkCount: 0, createdAt: '2025-01-02T00:00:00Z', primaryLanguage: null, licenseInfo: null,
    repositoryTopics: { nodes: [{ topic: { name: 'b' } }, { topic: { name: 'a' } }] },
    defaultBranchRef: { target: { history: { totalCount: 42 }, committedDate: '2026-09-30T10:00:00Z' } },
  });
  assert.equal(r.commits, 42);
  assert.equal(r.updated, '2026-09-30');
  assert.deepEqual(r.topics, ['a', 'b']);
  assert.equal(r.description, '');
  const empty = shape({ name: 'e', url: 'u', createdAt: '2025-01-02T00:00:00Z', repositoryTopics: { nodes: [] }, defaultBranchRef: null });
  assert.equal(empty.commits, 0);
  assert.equal(empty.updated, '2025-01-02');
});
