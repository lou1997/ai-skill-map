import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';

const TOKEN = process.env.GITHUB_TOKEN || '';
const HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ai-skill-map/3.0',
  ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {}),
};

async function fetchJSON(url) {
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return null;
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

function isRealSkill(name, desc, content) {
  if (!content || content.length < 50) return false;
  const c = content.toLowerCase();
  const d = (desc + ' ' + name).toLowerCase();
  if (['propaganda','dictatorship','反共','中共','pcl','antichina'].some(p => c.includes(p) || d.includes(p))) return false;
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (content.length > 0 && linkCount / content.length > 0.05) return false;
  if (!/#{1,3}\s+(skill|description|usage|purpose|how\s+to|capabilities|prompt|instructions|功能|用法|技能|描述)/i.test(content)) return false;
  return true;
}

function inferTags(name, desc, content) {
  const tags = [];
  const text = `${name} ${desc} ${(content || '').substring(0, 2000)}`.toLowerCase();
  const checks = [
    ['code-generation', ['code','program','compile','lint','build']],
    ['code-review', ['review','audit']],
    ['code-test', ['test','testing']],
    ['data-analysis', ['data','analy']],
    ['research', ['research','survey','paper']],
    ['doc-writing', ['doc','write','author']],
    ['image-gen', ['image','draw','illustrat']],
    ['video-gen', ['video','movie','film']],
    ['browser-auto', ['browser','playwright','puppeteer']],
    ['planning', ['plan','workflow','orchestrat']],
    ['devops', ['deploy','docker','kubernetes','infra']],
    ['security', ['security','penetration']],
    ['perf-optim', ['perf','optim','benchmark']],
    ['mcp-server', ['mcp','context protocol']],
    ['api-integration', ['api','integrat','webhook']],
    ['web-dev', ['web','frontend','react','vue','html','css']],
    ['mobile-dev', ['mobile','ios','android','flutter']],
    ['backend-dev', ['backend','server']],
    ['ml-ai', ['ml','machine learning','deep learning','llm','transformer']],
    ['finance', ['finance','trading','stock']],
    ['legal', ['legal','law','contract']],
    ['education', ['educat','teach','learn']],
    ['langchain', ['langchain']],
    ['claude', ['claude']],
    ['cloudflare', ['cloudflare','workers']],
    ['openai', ['openai','gpt']],
    ['cursor', ['cursor']],
    ['copilot', ['copilot']],
    ['autonomy', ['agent','autonomous','bot']],
  ];
  for (const [tag, keywords] of checks) {
    if (keywords.some(k => text.includes(k))) tags.push(tag);
  }
  return [...new Set(tags)];
}

function inferFramework(name, desc, content) {
  const text = `${name} ${desc} ${(content || '').substring(0, 500)}`.toLowerCase();
  if (text.includes('langchain')) return 'LangChain';
  if (text.includes('crewai')) return 'CrewAI';
  if (text.includes('autogen')) return 'AutoGen';
  if (text.includes('cloudflare') || text.includes('workers')) return 'Cloudflare';
  if (text.includes('claude') || text.includes('anthropic')) return 'Claude Code';
  if (text.includes('openai') || text.includes('gpt')) return 'OpenAI';
  if (text.includes('google') || text.includes('gemini')) return 'Google';
  if (text.includes('mcp')) return 'MCP';
  if (text.includes('cursor')) return 'Cursor';
  if (text.includes('copilot')) return 'GitHub Copilot';
  return null;
}

function buildSkill(repo, content, contentPath) {
  const name = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const desc = repo.description || '';
  return {
    id: repo.full_name,
    name,
    description: desc || name,
    content,
    contentPath,
    url: repo.html_url,
    source: 'github',
    tags: inferTags(name, desc, content),
    framework: inferFramework(name, desc, content),
    github: { repo: repo.full_name, stars: repo.stargazers_count, forks: repo.forks_count, language: repo.language || undefined },
    createdAt: repo.pushed_at,
    updatedAt: repo.updated_at,
  };
}

const SKILL_PATHS = ['SKILL.md', 'skill.md', 'skills/SKILL.md', 'skills/skill.md', 'docs/SKILL.md', '.github/SKILL.md', 'ai/SKILL.md', '.cursor/rules/SKILL.md'];

// Each query is broad — GitHub caps at 1000 results per query
// Multiple queries with different scopes find more unique repos
const QUERIES = [
  'skill.md in:path',
  'path:SKILL.md',
  'path:skills/SKILL.md',
  'path:skill.md',
  'path:docs/SKILL.md',
  'path:.cursor/rules/SKILL.md',
  'path:ai/SKILL.md',
  'path:.github/SKILL.md',
  'SKILL.md in:name',
  'skill.md in:name',
];

async function main() {
  let existing = [];
  if (existsSync('data/scraped-skills.json')) {
    existing = JSON.parse(readFileSync('data/scraped-skills.json', 'utf-8'));
  }
  console.log(`Existing: ${existing.length} skills\n`);

  const allSkills = [...existing];
  const seen = new Set(existing.map(s => s.id.toLowerCase()));
  let newCount = 0;

  for (const query of QUERIES) {
    if (newCount >= 50) break;
    process.stdout.write(`\nQuery: ${query}`);

    for (let page = 1; page <= 10; page++) {
      if (newCount >= 50) break;
      process.stdout.write(` p${page}`);

      const data = await fetchJSON(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=100&page=${page}&sort=stars&order=desc`
      );
      const repos = data?.items || [];
      if (repos.length === 0) { process.stdout.write('(0)'); break; }

      const results = await Promise.all(repos.map(async (repo) => {
        const key = repo.full_name.toLowerCase();
        if (seen.has(key)) return null;
        seen.add(key);

        const branch = repo.default_branch || 'main';
        const paths = SKILL_PATHS;
        const resps = await Promise.all(paths.map(p => fetchText(`https://raw.githubusercontent.com/${repo.owner.login}/${repo.name}/${branch}/${p}`)));
        const idx = resps.findIndex(c => c !== null);
        if (idx === -1) return null;
        if (!isRealSkill(repo.name, repo.description||'', resps[idx])) return null;
        return buildSkill(repo, resps[idx], paths[idx]);
      }));

      const valid = results.filter(Boolean);
      for (const r of valid) allSkills.push(r);
      newCount += valid.length;
      process.stdout.write(`+${valid.length}`);
      await sleep(200);
    }
    process.stdout.write(` (total ${newCount} new)`);
  }

  console.log(`\n\n=== Total: ${allSkills.length} skills (${newCount} new this run) ===`);
  mkdirSync('data', { recursive: true });
  writeFileSync('data/scraped-skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');
  console.log('Saved');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
main().catch(e => { console.error(e); process.exit(1); });