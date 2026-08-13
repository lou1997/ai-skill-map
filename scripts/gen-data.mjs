import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

function contentHash(skill) {
  const content = skill.content || '';
  return createHash('sha256').update(content.substring(0, 2000)).digest('hex').substring(0, 16);
}

function main() {
  const skills = [];
  const seenById = new Set();
  const seenByHash = new Set();

  if (existsSync('data/scraped-skills.json')) {
    const scraped = JSON.parse(readFileSync('data/scraped-skills.json', 'utf-8'));
    for (const skill of scraped) {
      const id = (skill.id || skill.github?.repo || '').toLowerCase();
      const hash = contentHash(skill);
      if (seenById.has(id) || seenByHash.has(hash)) continue;
      seenById.add(id);
      seenByHash.add(hash);
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