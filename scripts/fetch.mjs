#!/usr/bin/env node
// fetch.mjs — pull every public repo of the owner from the GitHub API into data/repos.json.
//
//   node scripts/fetch.mjs            write data/repos.json
//   node scripts/fetch.mjs --dry      print what would be written
//
// Goes through the `gh` CLI (GH_TOKEN / GITHUB_TOKEN in CI, `gh auth login` on a
// laptop) because gh already handles auth and the local proxy; Node's built-in
// fetch ignores HTTP(S)_PROXY, which is how most machines here reach GitHub.
//
// The file is written with sorted keys and no timestamp, so a day with no change
// in any repo leaves it byte-for-byte identical — the daily job commits nothing.
// On any error the old file stays as it is and the exit code is non-zero.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data/repos.json');

const QUERY = `query($owner: String!, $after: String) {
  user(login: $owner) {
    repositories(first: 30, after: $after, ownerAffiliations: OWNER, privacy: PUBLIC,
                 orderBy: {field: NAME, direction: ASC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name description url homepageUrl isFork isArchived
        stargazerCount forkCount createdAt
        primaryLanguage { name color }
        licenseInfo { spdxId }
        repositoryTopics(first: 40) { nodes { topic { name } } }
        defaultBranchRef { target { ... on Commit { history { totalCount } committedDate } } }
      }
    }
  }
}`;

// 30 per page: commit counts are expensive for GitHub to compute, and 100 per page
// came back as HTTP 502 (2026-10-10). A 502 is usually transient, so retry a few times.
function graphql(vars, tries = 3) {
  const args = ['api', 'graphql', '-f', `query=${QUERY}`];
  for (const [k, v] of Object.entries(vars)) if (v != null) args.push('-f', `${k}=${v}`);
  for (let i = 1; ; i++) {
    try {
      const json = JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 << 20, stdio: ['ignore', 'pipe', 'pipe'] }));
      if (json.errors) throw new Error(`GitHub GraphQL: ${JSON.stringify(json.errors)}`);
      return json.data;
    } catch (e) {
      if (i >= tries) throw new Error(String(e.stderr || e.message).trim());
      execFileSync('sleep', [String(5 * i)]);
    }
  }
}

export function shape(node) {
  const head = node.defaultBranchRef && node.defaultBranchRef.target;
  return {
    name: node.name,
    description: node.description || '',
    url: node.url,
    homepage: node.homepageUrl || '',
    fork: node.isFork,
    archived: node.isArchived,
    stars: node.stargazerCount,
    forks: node.forkCount,
    created: node.createdAt.slice(0, 10),
    updated: head && head.committedDate ? head.committedDate.slice(0, 10) : node.createdAt.slice(0, 10),
    commits: head && head.history ? head.history.totalCount : 0,
    language: node.primaryLanguage ? node.primaryLanguage.name : '',
    languageColor: node.primaryLanguage ? node.primaryLanguage.color || '' : '',
    license: node.licenseInfo ? node.licenseInfo.spdxId : '',
    topics: node.repositoryTopics.nodes.map(n => n.topic.name).sort(),
  };
}

function main() {
  const owner = parse(readFileSync(join(ROOT, 'catalog.yaml'), 'utf8')).owner;
  const repos = [];
  let after = null;
  do {
    const page = graphql({ owner, after }).user.repositories;
    // forks never appear in the catalog; keeping them out also keeps upstream syncs
    // from changing this file
    repos.push(...page.nodes.filter(n => !n.isFork).map(shape));
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  if (!repos.length) throw new Error(`no public repositories found for ${owner}`);
  repos.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  const text = JSON.stringify({ owner, repos }, null, 2) + '\n';
  if (process.argv.includes('--dry')) { process.stdout.write(text); return; }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, text);
  console.log(`fetch: ${repos.length} public repos of ${owner} → data/repos.json`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try { main(); } catch (e) { console.error(`fetch failed, data/repos.json left unchanged:\n${e.message}`); process.exit(1); }
}
