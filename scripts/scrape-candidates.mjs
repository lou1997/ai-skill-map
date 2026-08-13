import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const TOKEN = process.env.GITHUB_TOKEN || '';
const AUTH = TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {};
const HEADERS = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'candidate-scraper', ...AUTH };

const CODE_SEARCHES = [
  'filename:.mdc+path:.cursor/rules',
  'filename:prompts.md',
  'filename:instructions.md',
  'filename:agents.md',
  'filename:rules.md',
  'filename:system-prompt.md',
];

async function fetchJSON(url) {
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) {
      const t = await resp.text().catch(()=>'');
      return null;
    }
    return resp.json();
  } catch { return null; }
}

async function fetchText(url) {
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return null;
    return resp.text();
  } catch { return null; }
}

async function main() {
  // Load existing verified skills to avoid duplicates
  let verified = [];
  if (existsSync('data/scraped-skills.json')) {
    verified = JSON.parse(readFileSync('data/scraped-skills.json', 'utf-8'));
  }
  const verifiedHashes = new Set(verified.map(s => {
    const c = s.content || '';
    return createHash('sha256').update(c.substring(0, 2000)).digest('hex').substring(0, 16);
  }));

  // Load existing candidates
  let candidates = [];
  if (existsSync('data/candidates.json')) {
    candidates = JSON.parse(readFileSync('data/candidates.json', 'utf-8'));
  }
  const seenHashes = new Set(candidates.map(s => {
    const c = s.content || '';
    return createHash('sha256').update(c.substring(0, 2000)).digest('hex').substring(0, 16);
  }));
  const seenRepos = new Set(candidates.map(s => s.github?.repo?.toLowerCase()).filter(Boolean));

  let totalNew = 0;

  for (const codeQuery of CODE_SEARCHES) {
    console.log(`\n=== Code search: ${codeQuery.substring(0, 50)}`);
    for (let page = 1; page <= 3; page++) {
      process.stdout.write(` p${page}`);
      const url = `https://api.github.com/search/code?q=${codeQuery}&per_page=50&page=${page}`;
      const data = await fetchJSON(url);
      if (!data) { process.stdout.write('(no response)'); break; }
      const items = data?.items || [];
      if (items.length === 0) { process.stdout.write(`(total:${data.total_count||0})`); break; }

      // Group by repo
      const repoMap = new Map();
      for (const item of items) {
        const repo = item.repository?.full_name;
        if (!repo || seenRepos.has(repo.toLowerCase())) continue;
        if (!repoMap.has(repo)) repoMap.set(repo, []);
        repoMap.get(repo).push(item);
      }

      if (repoMap.size === 0) { process.stdout.write('(all seen)'); continue; }

      // For each new repo, fetch all its candidate files
      const repoResults = await Promise.all(Array.from(repoMap.entries()).map(async ([repo, files]) => {
        const [owner, name] = repo.split('/');
        const branch = 'main';

        // Fetch all file contents in parallel
        const fileResults = await Promise.all(files.map(async (file) => {
          const path = file.path;
          const url = `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${path}`;
          const content = await fetchText(url);
          if (!content || content.length < 50) return null;

          const contentHash = createHash('sha256').update(content.substring(0, 2000)).digest('hex').substring(0, 16);
          if (verifiedHashes.has(contentHash) || seenHashes.has(contentHash)) return null;

          const fileName = path.split('/').pop().replace(/\.(md|mdc)$/i, '');
          const skillName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return {
            id: repo + '/' + path,
            name: skillName,
            description: skillName,
            content,
            contentPath: path,
            url: `https://github.com/${repo}/blob/${branch}/${path}`,
            source: 'github',
            tags: ['candidate'],
            github: { repo, stars: 0 },
            query: codeQuery,
          };
        }));

        return fileResults.filter(Boolean);
      }));

      const flat = repoResults.flat();
      for (const r of flat) {
        const contentHash = createHash('sha256').update((r.content || '').substring(0, 2000)).digest('hex').substring(0, 16);
        seenHashes.add(contentHash);
        seenRepos.add(r.github.repo.toLowerCase());
        candidates.push(r);
      }
      totalNew += flat.length;
      process.stdout.write(`+${flat.length}`);
      await sleep(400);
    }
  }

  console.log(`\n\n=== Total candidates: ${candidates.length} (${totalNew} new this run) ===`);
  mkdirSync('data', { recursive: true });
  writeFileSync('data/candidates.json', JSON.stringify(candidates, null, 2), 'utf-8');
  console.log('Saved to data/candidates.json');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
main().catch(e => { console.error(e); process.exit(1); });