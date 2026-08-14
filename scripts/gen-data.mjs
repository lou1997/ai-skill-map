import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

function contentHash(skill) {
  const content = skill.content || '';
  return createHash('sha256').update(content.substring(0, 2000)).digest('hex').substring(0, 16);
}

function safeFileName(id) {
  return id.replace(/[^a-z0-9._-]/g, '_').toLowerCase();
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

  const outDir = 'public/data';
  const contentDir = `${outDir}/content`;
  mkdirSync(contentDir, { recursive: true });

  for (const skill of skills) {
    const { content, ...meta } = skill;
    const fileName = safeFileName(skill.id || '');
    writeFileSync(`${contentDir}/${fileName}.json`, JSON.stringify(content || '', 'utf-8'));
  }

  const metaSkills = skills.map(({ content, ...rest }) => rest);
  writeFileSync(`${outDir}/skills.json`, JSON.stringify(metaSkills, null, 2), 'utf-8');

  console.log(`Generated ${skills.length} skills (metadata only)`);
  console.log(`Content files: ${skills.length}`);
}

main();