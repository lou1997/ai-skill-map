import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

function loadJSON(path) {
  if (!existsSync(path)) return [];
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return []; }
}

function main() {
  const scraped = loadJSON('data/scraped-skills.json');
  const seedSkills = loadJSON('src/data/seed-skills.json');
  const allSkills = [];
  const seen = new Set();

  for (const skill of [...seedSkills, ...scraped]) {
    const key = (skill.id || skill.github?.repo || '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (skill.framework === 'unknown' || skill.framework === null) delete skill.framework;
    allSkills.push(skill);
  }

  // Sort by stars desc
  allSkills.sort((a, b) => (b.github?.stars || 0) - (a.github?.stars || 0));

  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');
  writeFileSync('src/data/skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');

  console.log(`Generated ${allSkills.length} skills total`);
  console.log(`  Seed: ${seedSkills.length}`);
  console.log(`  Scraped: ${scraped.length}`);
}

main();