import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';

const SEARCH_QUERIES = [
  'topic:agent-tool skill',
  'agent framework skill repository',
  'LLM agent skills collection',
  'awesome agents tools',
  'agent skill claude copilot',
  'mcp server tool repository',
  'autonomous agent tools',
  'AI coding agent skills',
  'multimodal agent skills',
  'agent framework tools github',
  'code generation agent skill',
  'AI assistant skills github',
  'workflow automation agent',
  'multi-agent system tools',
  'AI skills collection',
];

const HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ai-skill-map/1.0',
};

async function searchGitHub(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=25&sort=stars&order=desc`;
  console.log(`  Searching: ${query}`);
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) {
      console.warn(`    HTTP ${resp.status}`);
      return [];
    }
    const data = await resp.json();
    console.log(`    Found ${data.total_count}`);
    return data.items || [];
  } catch (e) {
    console.error(`    Error: ${e.message}`);
    return [];
  }
}

function inferTags(description, topics, name) {
  const tags = [];
  const text = `${description || ''} ${topics.join(' ')} ${name || ''}`.toLowerCase();

  if (text.includes('code') || text.includes('program') || text.includes('compile') || text.includes('lint') || text.includes('build')) tags.push('code-generation');
  if (text.includes('review') || text.includes('audit') || text.includes('cr')) tags.push('code-review');
  if (text.includes('test') || text.includes('testing')) tags.push('code-test');
  if (text.includes('debug')) tags.push('code-debug');
  if (text.includes('refactor')) tags.push('code-refactor');
  if (text.includes('data') || text.includes('analy')) tags.push('data-analysis');
  if (text.includes('chart') || text.includes('graph') || text.includes('viz')) tags.push('data-viz');
  if (text.includes('research') || text.includes('survey') || text.includes('paper')) tags.push('research');
  if (text.includes('scrap') || text.includes('crawl') || text.includes('fetch')) tags.push('web-scrape');
  if (text.includes('doc') || text.includes('write') || text.includes('author')) tags.push('doc-writing');
  if (text.includes('image') || text.includes('draw') || text.includes('illustrat')) tags.push('image-gen');
  if (text.includes('video') || text.includes('movie') || text.includes('film')) tags.push('video-gen');
  if (text.includes('audio') || text.includes('speech') || text.includes('tts') || text.includes('voice')) tags.push('audio-tts');
  if (text.includes('stt') || text.includes('transcrib') || text.includes('whisper')) tags.push('audio-stt');
  if (text.includes('translate') || text.includes('translation')) tags.push('translation');
  if (text.includes('browser') || text.includes('playwright') || text.includes('puppeteer') || text.includes('selenium')) tags.push('browser-auto');
  if (text.includes('plan') || text.includes('workflow') || text.includes('orchestrat')) tags.push('planning');
  if (text.includes('memory') || text.includes('context') || text.includes('recall')) tags.push('memory-mgmt');
  if (text.includes('deploy') || text.includes('ci') || text.includes('docker') || text.includes('kubernetes') || text.includes('k8s') || text.includes('terraform') || text.includes('infra')) tags.push('devops');
  if (text.includes('security') || text.includes('penet') || text.includes('vuln')) tags.push('security');
  if (text.includes('perf') || text.includes('optim') || text.includes('benchmark')) tags.push('perf-optim');
  if (text.includes('mcp') || text.includes('context protocol')) tags.push('mcp-server');
  if (text.includes('api') || text.includes('integrat') || text.includes('webhook') || text.includes('connector')) tags.push('api-integration');
  if (text.includes('web') || text.includes('frontend') || text.includes('react') || text.includes('vue') || text.includes('angular') || text.includes('css') || text.includes('html')) tags.push('web-dev');
  if (text.includes('mobile') || text.includes('ios') || text.includes('android') || text.includes('flutter') || text.includes('react native')) tags.push('mobile-dev');
  if (text.includes('backend') || text.includes('server') || text.includes('api')) tags.push('backend-dev');
  if (text.includes('ml') || text.includes('machine learning') || text.includes('deep learning') || text.includes('llm') || text.includes('transformer')) tags.push('ml-ai');
  if (text.includes('infra') || text.includes('cloud') || text.includes('serverless')) tags.push('infra');
  if (text.includes('finance') || text.includes('trading') || text.includes('stock') || text.includes('fintech')) tags.push('finance');
  if (text.includes('legal') || text.includes('law') || text.includes('contract') || text.includes('compliance')) tags.push('legal');
  if (text.includes('medical') || text.includes('health') || text.includes('clinical')) tags.push('medical');
  if (text.includes('educat') || text.includes('teach') || text.includes('learn')) tags.push('education');
  if (text.includes('market') || text.includes('advertis') || text.includes('seo') || text.includes('social')) tags.push('marketing');
  if (text.includes('hr') || text.includes('human resource') || text.includes('recruit')) tags.push('hr');
  if (text.includes('ecommerce') || text.includes('shop') || text.includes('retail')) tags.push('e-commerce');
  if (text.includes('langchain') || text.includes('lang graph')) tags.push('langchain');
  if (text.includes('crewai') || text.includes('crew ai')) tags.push('crewai');
  if (text.includes('autogen') || text.includes('auto gen')) tags.push('autogen');
  if (text.includes('claude')) tags.push('claude');
  if (text.includes('cloudflare') || text.includes('workers')) tags.push('cloudflare');
  if (text.includes('openai') || text.includes('gpt')) tags.push('openai');
  if (text.includes('anthropic')) tags.push('anthropic');
  if (text.includes('google') || text.includes('gemini')) tags.push('google');
  if (text.includes('cursor')) tags.push('cursor');
  if (text.includes('copilot')) tags.push('copilot');
  if (text.includes('agent') || text.includes('autonomous') || text.includes('bot')) tags.push('autonomy');
  if (text.includes('mcp')) tags.push('mcp');

  return [...new Set(tags)];
}

function inferFramework(name, description, topics) {
  const text = `${name} ${description || ''} ${topics.join(' ')}`.toLowerCase();
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
  if (text.includes('browser') || text.includes('playwright') || text.includes('puppeteer')) return 'Browser';
  return null;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('=== AI Skill Map Scraper ===\n');
  const seen = new Set();
  const allSkills = [];

  for (const query of SEARCH_QUERIES) {
    const repos = await searchGitHub(query);
    for (const repo of repos) {
      const key = repo.full_name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const desc = repo.description || '';
      const topics = repo.topics || [];
      const name = repo.name || '';
      const isRelevant = desc.toLowerCase().includes('agent') ||
        desc.toLowerCase().includes('skill') ||
        desc.toLowerCase().includes('ai ') ||
        desc.toLowerCase().includes(' llm') ||
        desc.toLowerCase().includes('llm') ||
        desc.toLowerCase().includes('copilot') ||
        desc.toLowerCase().includes('mcp') ||
        desc.toLowerCase().includes('automation') ||
        topics.some(t => ['agent', 'skill', 'ai', 'llm', 'automation', 'tools', 'mcp'].includes(t.toLowerCase()));

      if (!isRelevant) continue;

      const tags = inferTags(desc, topics, name);
      if (tags.length === 0) continue;

      allSkills.push({
        id: repo.full_name,
        name: repo.name || repo.full_name.split('/')[1],
        description: desc || repo.full_name,
        url: repo.html_url,
        source: 'github',
        tags,
        framework: inferFramework(name, desc, topics),
        github: {
          repo: repo.full_name,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language || undefined,
        },
        createdAt: repo.pushed_at,
        updatedAt: repo.updated_at,
      });
    }
    await sleep(500);
  }

  console.log(`\nTotal scraped: ${allSkills.length}`);
  mkdirSync('data', { recursive: true });
  writeFileSync('data/scraped-skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');
  console.log('Saved to data/scraped-skills.json');
}

main().catch(e => { console.error(e); process.exit(1); });