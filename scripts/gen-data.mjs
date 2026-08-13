import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

function main() {
  const skills = [];
  const seen = new Set();

  if (existsSync('data/scraped-skills.json')) {
    const scraped = JSON.parse(readFileSync('data/scraped-skills.json', 'utf-8'));
    for (const skill of scraped) {
      const key = (skill.id || skill.github?.repo || '').toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      if (skill.framework === 'unknown' || skill.framework === null) delete skill.framework;
      skills.push(skill);
    }
  }

  skills.sort((a, b) => (b.github?.stars || 0) - (a.github?.stars || 0));

  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/skills.json', JSON.stringify(skills, null, 2), 'utf-8');
  writeFileSync('src/data/skills.json', JSON.stringify(skills, null, 2), 'utf-8');

  console.log(`Generated ${skills.length} skills`);
}

main();