import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

const HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ai-skill-map/2.0',
};

const SKILL_PATHS = [
  'SKILL.md',
  'skill.md',
  'skills/SKILL.md',
  'skills/skill.md',
  'docs/SKILL.md',
  '.mimocode/skills/SKILL.md',
  'README.md',
];

async function fetchText(url) {
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return null;
    return resp.text();
  } catch {
    return null;
  }
}

async function findSkillContent(owner, repo, branch) {
  for (const path of SKILL_PATHS) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const content = await fetchText(url);
    if (content) return { content, path };
  }
  return null;
}

async function main() {
  const existing = JSON.parse(readFileSync('data/scraped-skills.json', 'utf8'));
  console.log(`Processing ${existing.length} skills for SKILL.md content...`);

  let updated = 0;
  let noContent = 0;

  for (const skill of existing) {
    if (skill.content) {
      updated++;
      continue;
    }

    const [owner, repo] = skill.github?.repo?.split('/') || [];
    if (!owner || !repo) {
      noContent++;
      continue;
    }

    const skillFile = await findSkillContent(owner, repo, 'main');
    if (!skillFile) {
      const skillFileFallback = await findSkillContent(owner, repo, 'master');
      if (!skillFileFallback) {
        noContent++;
        process.stdout.write('.');
        continue;
      }
      skill.content = skillFileFallback.content;
      skill.contentPath = skillFileFallback.path;
    } else {
      skill.content = skillFile.content;
      skill.contentPath = skillFile.path;
    }

    updated++;
    process.stdout.write(`+`);
  }

  console.log(`\n\nDone: ${updated} with content, ${noContent} without`);
  mkdirSync('data', { recursive: true });
  writeFileSync('data/scraped-skills.json', JSON.stringify(existing, null, 2), 'utf8');
  console.log('Saved to data/scraped-skills.json');
}

main().catch(e => { console.error(e); process.exit(1); });