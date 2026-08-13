import { readFileSync, writeFileSync } from 'node:fs';
import { existsSync, mkdirSync } from 'node:fs';
import { seedSkills } from '../src/data/seed.ts';
import type { Skill } from '../src/data/types.ts';

function loadScraped(): Skill[] {
  if (!existsSync('data/scraped-skills.json')) return [];
  try {
    return JSON.parse(readFileSync('data/scraped-skills.json', 'utf-8'));
  } catch {
    return [];
  }
}

function main() {
  const scraped = loadScraped();
  const allSkills: Skill[] = [];
  const seen = new Set<string>();

  for (const skill of [...seedSkills, ...scraped]) {
    const key = (skill.id || skill.github?.repo || '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    allSkills.push(skill);
  }

  mkdirSync('dist/data', { recursive: true });
  writeFileSync('dist/data/skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');
  writeFileSync('src/data/skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');

  console.log(`Generated ${allSkills.length} skills total`);
  console.log(`  Seed: ${seedSkills.length}`);
  console.log(`  Scraped: ${scraped.length}`);
}

main();