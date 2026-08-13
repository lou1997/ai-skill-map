import { writeFileSync, mkdirSync } from 'node:fs';
import { scrape } from './scrape-github.ts';
import { seedSkills } from '../src/data/seed.ts';

async function main() {
  console.log('=== AI Skill Map Scraper ===\n');
  const scraped = await scrape();
  mkdirSync('data', { recursive: true });
  writeFileSync('data/scraped-skills.json', JSON.stringify(scraped, null, 2), 'utf-8');
  console.log(`\nDone! Found ${scraped.length} skills from web sources.`);
  console.log(`Total with seed: ${scraped.length + seedSkills.length}`);
}

if (process.argv[1]?.endsWith('scrape-all')) {
  main().catch(console.error);
}