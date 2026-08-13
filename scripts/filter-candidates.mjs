import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const candidates = JSON.parse(readFileSync('data/candidates.json', 'utf-8'));
const existing = JSON.parse(readFileSync('data/scraped-skills.json', 'utf-8'));

const seenHashes = new Set(existing.map(s => {
  const c = s.content || '';
  return createHash('sha256').update(c.substring(0, 2000)).digest('hex').substring(0, 16);
}));

function isSkill(candidate) {
  const content = candidate.content || '';
  if (content.length < 200) return false;

  const c = content.toLowerCase();

  // Reject: project-specific config files by name
  const projectSpecific = ['git.mdc', 'ci.mdc', 'docker.mdc', 'pr.mdc', 'db.mdc', 'ffi.mdc', 'yo.mdc', 'fh.mdc', 'hs.mdc', 'v5.mdc', 'cli.mdc', 'ipc.mdc', 'go.mdc'];
  const fileName = candidate.contentPath.split('/').pop().toLowerCase();
  if (projectSpecific.includes(fileName)) return false;

  // Reject: no markdown structure
  if (!/^#|^##|^```|^- |^\d+\. |\*\*|__|`[^`]+`/m.test(content)) return false;

  // Reject: too many links (resource collection)
  const links = (content.match(/https?:\/\//g) || []).length;
  if (content.length > 0 && links / content.length > 0.03) return false;

  // Score skill-likeness
  let score = 0;

  if (/^#\s+(skill|prompt|instruction|agent|rule|template|config|guide|workflow)/im.test(content)) score += 2;
  if (/^##\s+(description|overview|purpose|usage|how to|example|features|capabilities|用法|功能|描述|说明|示例|步骤)/im.test(content)) score += 2;
  if ((content.match(/```/g) || []).length >= 2) score += 1;
  if (/you (can|should|must|need|will|are|have)/i.test(content) || /steps?:|instructions?:|用法|步骤|如何/.test(c)) score += 1;

  const domainKw = ['code', 'test', 'data', 'api', 'web', 'design', 'research', 'write', 'image', 'video', 'security', 'deploy', 'config', 'build', 'docker', 'git', 'database', 'auth', 'css', 'html', 'react', 'node', 'python', 'typescript', 'prompt', 'agent'];
  const kwCount = domainKw.filter(k => c.includes(k)).length;
  if (kwCount >= 3) score += 1;

  if (content.length > 5000) score += 1;
  if (content.length > 1000) score += 1;

  const lines = content.split('\n').filter(l => l.trim()).length;
  if (lines < 10) score -= 2;

  return score >= 4;
}

const good = [];
const bad = [];

for (const candidate of candidates) {
  const contentHash = createHash('sha256').update((candidate.content || '').substring(0, 2000)).digest('hex').substring(0, 16);
  if (seenHashes.has(contentHash)) continue;

  if (isSkill(candidate)) {
    delete candidate.query;
    if (!candidate.tags || candidate.tags.length === 0 || candidate.tags[0] === 'candidate') {
      candidate.tags = ['autonomy'];
    }
    good.push(candidate);
    seenHashes.add(contentHash);
  } else {
    bad.push(candidate);
  }
}

console.log('Candidates: ' + candidates.length);
console.log('Verified as skill: ' + good.length);
console.log('Rejected: ' + bad.length);
console.log();

console.log('=== Accepted ===');
for (const x of good.slice(0, 20)) {
  console.log('  ' + x.contentPath + ' (' + (x.content || '').length + ' chars)');
}

console.log();
console.log('=== Rejected (sample) ===');
for (const x of bad.slice(0, 15)) {
  console.log('  ' + x.contentPath + ' (' + (x.content || '').length + ' chars)');
}

for (const s of good) existing.push(s);
writeFileSync('data/scraped-skills.json', JSON.stringify(existing, null, 2), 'utf-8');
console.log('\nAdded ' + good.length + ' to scraped-skills.json (total: ' + existing.length + ')');