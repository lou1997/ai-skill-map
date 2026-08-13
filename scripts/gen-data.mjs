import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

function main() {
  const seedSkills = JSON.parse(readFileSync('src/data/seed-skills.json', 'utf-8'));
  const allSkills = [...seedSkills];
  allSkills.sort((a, b) => (b.github?.stars || 0) - (a.github?.stars || 0));

  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');
  writeFileSync('src/data/skills.json', JSON.stringify(allSkills, null, 2), 'utf-8');

  console.log(`Generated ${allSkills.length} curated skills`);
}

main();