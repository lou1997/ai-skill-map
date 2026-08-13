import { writeFileSync, mkdirSync } from 'node:fs';

const HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ai-skill-map/3.0',
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

// Check if content is a real agent skill
function isRealSkill(name, desc, content) {
  if (!content || content.length < 50) return false;
  const c = content.toLowerCase();
  const d = (desc + ' ' + name).toLowerCase();
  const political = ['propaganda', 'dictatorship', '反共', '中共', 'pcl', 'antichina'];
  if (political.some(p => c.includes(p) || d.includes(p))) return false;
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (content.length > 0 && linkCount / content.length > 0.05) return false;
  const hasSkillMarkers = /#{1,3}\s+(skill|description|usage|purpose|how\s+to|capabilities|prompt|instructions|功能|用法|技能|描述)/i.test(content);
  if (!hasSkillMarkers) return false;
  return true;
}

function inferTags(name, desc, content) {
  const tags = [];
  const text = `${name} ${desc} ${(content || '').substring(0, 2000)}`.toLowerCase();
  const checks = [
    ['code-generation', ['code', 'program', 'compile', 'lint', 'build']],
    ['code-review', ['review', 'audit', 'cr']],
    ['code-test', ['test', 'testing']],
    ['code-debug', ['debug']],
    ['code-refactor', ['refactor']],
    ['data-analysis', ['data', 'analy']],
    ['data-viz', ['chart', 'graph', 'viz']],
    ['research', ['research', 'survey', 'paper']],
    ['doc-writing', ['doc', 'write', 'author']],
    ['image-gen', ['image', 'draw', 'illustrat']],
    ['video-gen', ['video', 'movie', 'film']],
    ['browser-auto', ['browser', 'playwright', 'puppeteer']],
    ['planning', ['plan', 'workflow', 'orchestrat']],
    ['memory-mgmt', ['memory', 'context']],
    ['devops', ['deploy', 'docker', 'kubernetes', 'k8s', 'infra']],
    ['security', ['security', 'penetration', 'vuln']],
    ['perf-optim', ['perf', 'optim', 'benchmark']],
    ['mcp-server', ['mcp', 'context protocol']],
    ['api-integration', ['api', 'integrat', 'webhook']],
    ['web-dev', ['web', 'frontend', 'react', 'vue', 'html', 'css']],
    ['mobile-dev', ['mobile', 'ios', 'android', 'flutter']],
    ['backend-dev', ['backend', 'server']],
    ['ml-ai', ['ml', 'machine learning', 'deep learning', 'llm', 'transformer']],
    ['finance', ['finance', 'trading', 'stock', 'fintech']],
    ['legal', ['legal', 'law', 'contract', 'compliance']],
    ['education', ['educat', 'teach', 'learn']],
    ['langchain', ['langchain', 'langgraph']],
    ['claude', ['claude']],
    ['cloudflare', ['cloudflare', 'workers']],
    ['openai', ['openai', 'gpt']],
    ['anthropic', ['anthropic']],
    ['google', ['google', 'gemini']],
    ['cursor', ['cursor']],
    ['copilot', ['copilot']],
    ['autonomy', ['agent', 'autonomous', 'bot']],
  ];
  for (const [tag, keywords] of checks) {
    if (keywords.some(k => text.includes(k))) tags.push(tag);
  }
  return [...new Set(tags)];
}

function inferFramework(name, desc, content) {
  const text = `${name} ${desc} ${(content || '').substring(0, 500)}`.toLowerCase();
  if (text.includes('langchain') || text.includes('langgraph')) return 'LangChain';
  if (text.includes('crewai') || text.includes('crew ai')) return 'CrewAI';
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

const SEARCH_QUERIES = [
  'SKILL.md in:path agent',
  'SKILL.md in:path skill',
  'SKILL.md in:path claude',
  'SKILL.md in:path copilot',
  'SKILL.md in:path prompt',
  'SKILL.md in:path assistant',
  'SKILL.md in:path mcp',
  'SKILL.md in:path tool',
  'SKILL.md in:path workflow',
  'SKILL.md in:path code',
  'SKILL.md in:path data',
  'SKILL.md in:path research',
  'SKILL.md in:path write',
  'SKILL.md in:path design',
  'SKILL.md in:path translate',
  'SKILL.md in:path image',
  'SKILL.md in:path video',
  'SKILL.md in:path browser',
  'SKILL.md in:path security',
  'SKILL.md in:path test',
];

async function main() {
  console.log('=== AI Skill Map Scraper v3 ===\n');
  const allSkills = [];
  const seen = new Set();

  for (const query of SEARCH_QUERIES) {
    if (allSkills.length >= 50) break;
    process.stdout.write(`\n${query}... `);
    const data = await fetchJSON(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=30&sort=stars&order=desc`
    );
    const repos = data?.items || [];
    if (repos.length === 0) { process.stdout.write('0'); continue; }
    process.stdout.write(`${repos.length}`);

    // Fetch SKILL.md content in parallel for all repos
    const results = await Promise.all(repos.map(async (repo) => {
      const key = repo.full_name.toLowerCase();
      if (seen.has(key)) return null;
      seen.add(key);

      const branch = repo.default_branch || 'main';
      const url = `https://raw.githubusercontent.com/${repo.owner.login}/${repo.name}/${branch}/SKILL.md`;
      const content = await fetchText(url);
      if (!content) return null;

      const name = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const desc = repo.description || '';
      if (!isRealSkill(name, desc, content)) return null;

      return {
        id: repo.full_name,
        name,
        description: desc || name,
        content,
        contentPath: 'SKILL.md',
        url: repo.html_url,
        source: 'github',
        tags: inferTags(name, desc, content),
        framework: inferFramework(name, desc, content),
        github: { repo: repo.full_name, stars: repo.stargazers_count, forks: repo.forks_count, language: repo.language || undefined },
        createdAt: repo.pushed_at,
        updatedAt: repo.updated_at,
      };
    }));

    const valid = results.filter(Boolean);
    for (const r of valid) allSkills.push(r);
    process.stdout.write(` → ${valid.length} valid`);
    await sleep(300);
  }

  console.log(`\n\n=== Results: ${allSkills.length} real skills found ===`);
  mkdirSync('data', { recursive: true });
  writeFileSync('data/scraped-skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');
  console.log('Saved to data/scraped-skills.json');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
main().catch(e => { console.error(e); process.exit(1); });