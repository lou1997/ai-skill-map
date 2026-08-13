import { writeFileSync, mkdirSync } from 'node:fs';
import type { Skill } from '../src/data/types.ts';

interface GitHubSearchResult {
  total_count: number;
  items: Array<{
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    pushed_at: string;
    updated_at: string;
    topics: string[];
  }>;
}

export const SEARCH_QUERIES = [
  'SKILL.md in:path agent skills',
  'agent skill github topic:agent',
  'claude skill README',
  'AI agent framework skill',
  'awesome agent skills',
];

const HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ai-skill-map-scraper/1.0',
};

async function searchGitHub(query: string): Promise<GitHubSearchResult['items']> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=30&sort=stars`;
  console.log(`  Searching: ${query}`);

  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) {
    console.warn(`    API error: ${resp.status} ${resp.statusText}`);
    return [];
  }

  const data: GitHubSearchResult = await resp.json();
  console.log(`    Found ${data.total_count} repos`);
  return data.items;
}

export async function scrape(): Promise<Skill[]> {
  const seen = new Set<string>();
  const skills: Skill[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const repos = await searchGitHub(query);
      for (const repo of repos) {
        const id = repo.full_name.toLowerCase();
        if (seen.has(id)) continue;
        seen.add(id);

        const desc = repo.description || '';
        const descLower = desc.toLowerCase();
        const isAgent = descLower.includes('agent') ||
          descLower.includes('skill') ||
          descLower.includes('ai') ||
          repo.topics.some(t => t.toLowerCase().includes('agent') || t.toLowerCase().includes('skill'));

        if (!isAgent) continue;

        skills.push({
          id: repo.full_name,
          name: repo.full_name.split('/')[1]?.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || repo.full_name,
          description: desc,
          url: repo.html_url,
          source: 'github',
          tags: inferTags(desc, repo.topics),
          github: {
            repo: repo.full_name,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language || undefined,
          },
          createdAt: repo.pushed_at,
          updatedAt: repo.updated_at,
        });

        await delay(500);
      }
    } catch (e) {
      console.error(`  Error searching "${query}":`, e);
    }
  }

  return skills;
}

function inferTags(description: string, topics: string[]): string[] {
  const tags: string[] = [];
  const text = `${description} ${topics.join(' ')}`.toLowerCase();

  if (text.includes('code') || text.includes('program')) tags.push('code-generation');
  if (text.includes('review') || text.includes('audit')) tags.push('code-review');
  if (text.includes('test') || text.includes('testing')) tags.push('code-test');
  if (text.includes('data') || text.includes('analy')) tags.push('data-analysis');
  if (text.includes('research') || text.includes('survey')) tags.push('research');
  if (text.includes('browser') || text.includes('playwright') || text.includes('puppeteer')) tags.push('browser-auto');
  if (text.includes('doc') || text.includes('write')) tags.push('doc-writing');
  if (text.includes('deploy') || text.includes('ci') || text.includes('docker')) tags.push('devops');
  if (text.includes('security')) tags.push('security');
  if (text.includes('mcp')) tags.push('mcp-server');
  if (text.includes('langchain')) tags.push('langchain');
  if (text.includes('crewai') || text.includes('crew ai')) tags.push('crewai');
  if (text.includes('autogen')) tags.push('autogen');
  if (text.includes('claude')) tags.push('claude');
  if (text.includes('cloudflare')) tags.push('cloudflare');
  if (text.includes('agent') || text.includes('autonomous')) tags.push('autonomy');
  if (text.includes('plan') || text.includes('workflow')) tags.push('planning');

  return [...new Set(tags)];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Scraping GitHub for agent skills...\n');
  const skills = await scrape();
  console.log(`\nTotal skills found: ${skills.length}\n`);

  mkdirSync('data', { recursive: true });
  writeFileSync('data/scraped-skills.json', JSON.stringify(skills, null, 2), 'utf-8');
  console.log('Saved to data/scraped-skills.json');
}

if (process.argv[1]?.endsWith('scrape-github')) {
  main().catch(console.error);
}