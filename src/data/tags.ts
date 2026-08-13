import type { SkillTag, SkillCategory } from './types';

export const skillTags: SkillTag[] = [
  // === Capability (能力维度) ===
  { id: 'code-generation', name: '代码生成', category: 'capability', color: '#3b82f6' },
  { id: 'code-review', name: '代码审查', category: 'capability', color: '#3b82f6' },
  { id: 'code-debug', name: '调试修复', category: 'capability', color: '#3b82f6' },
  { id: 'code-test', name: '测试生成', category: 'capability', color: '#3b82f6' },
  { id: 'code-refactor', name: '代码重构', category: 'capability', color: '#3b82f6' },
  { id: 'data-analysis', name: '数据分析', category: 'capability', color: '#8b5cf6' },
  { id: 'data-viz', name: '数据可视化', category: 'capability', color: '#8b5cf6' },
  { id: 'research', name: '深度研究', category: 'capability', color: '#8b5cf6' },
  { id: 'web-scrape', name: '网页抓取', category: 'capability', color: '#8b5cf6' },
  { id: 'doc-writing', name: '文档撰写', category: 'capability', color: '#8b5cf6' },
  { id: 'doc-review', name: '文档审阅', category: 'capability', color: '#8b5cf6' },
  { id: 'translation', name: '翻译', category: 'capability', color: '#8b5cf6' },
  { id: 'image-gen', name: '图像生成', category: 'capability', color: '#ec4899' },
  { id: 'video-gen', name: '视频生成', category: 'capability', color: '#ec4899' },
  { id: 'audio-tts', name: '语音合成', category: 'capability', color: '#ec4899' },
  { id: 'audio-stt', name: '语音识别', category: 'capability', color: '#ec4899' },
  { id: 'autonomy', name: '自主执行', category: 'capability', color: '#f59e0b' },
  { id: 'browser-auto', name: '浏览器自动化', category: 'capability', color: '#f59e0b' },
  { id: 'api-integration', name: 'API 集成', category: 'capability', color: '#f59e0b' },
  { id: 'memory-mgmt', name: '记忆管理', category: 'capability', color: '#f59e0b' },
  { id: 'planning', name: '任务规划', category: 'capability', color: '#f59e0b' },
  { id: 'security', name: '安全审计', category: 'capability', color: '#ef4444' },
  { id: 'perf-optim', name: '性能优化', category: 'capability', color: '#ef4444' },
  { id: 'devops', name: 'DevOps', category: 'capability', color: '#ef4444' },
  { id: 'mcp-server', name: 'MCP 服务', category: 'capability', color: '#ef4444' },

  // === Domain (领域维度) ===
  { id: 'web-dev', name: 'Web 开发', category: 'domain', color: '#06b6d4' },
  { id: 'mobile-dev', name: '移动端开发', category: 'domain', color: '#06b6d4' },
  { id: 'backend-dev', name: '后端开发', category: 'domain', color: '#06b6d4' },
  { id: 'ml-ai', name: '机器学习', category: 'domain', color: '#06b6d4' },
  { id: 'infra', name: '基础设施', category: 'domain', color: '#06b6d4' },
  { id: 'finance', name: '金融分析', category: 'domain', color: '#10b981' },
  { id: 'legal', name: '法律合规', category: 'domain', color: '#10b981' },
  { id: 'medical', name: '医疗健康', category: 'domain', color: '#10b981' },
  { id: 'education', name: '教育培训', category: 'domain', color: '#10b981' },
  { id: 'marketing', name: '市场营销', category: 'domain', color: '#10b981' },
  { id: 'hr', name: '人力资源', category: 'domain', color: '#10b981' },
  { id: 'e-commerce', name: '电商', category: 'domain', color: '#10b981' },

  // === Platform (平台维度) ===
  { id: 'claude', name: 'Claude Code', category: 'platform', color: '#d97706' },
  { id: 'mimo', name: 'MiMoCode', category: 'platform', color: '#d97706' },
  { id: 'cursor', name: 'Cursor', category: 'platform', color: '#d97706' },
  { id: 'copilot', name: 'GitHub Copilot', category: 'platform', color: '#d97706' },
  { id: 'langchain', name: 'LangChain', category: 'platform', color: '#d97706' },
  { id: 'autogen', name: 'AutoGen', category: 'platform', color: '#d97706' },
  { id: 'crewai', name: 'CrewAI', category: 'platform', color: '#d97706' },
  { id: 'mcp', name: 'MCP Protocol', category: 'platform', color: '#d97706' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'platform', color: '#d97706' },
  { id: 'openai', name: 'OpenAI', category: 'platform', color: '#d97706' },
  { id: 'anthropic', name: 'Anthropic', category: 'platform', color: '#d97706' },
  { id: 'google', name: 'Google', category: 'platform', color: '#d97706' },

  // === Maturity (成熟度) ===
  { id: 'production', name: '生产可用', category: 'maturity', color: '#22c55e' },
  { id: 'beta', name: 'Beta', category: 'maturity', color: '#eab308' },
  { id: 'experimental', name: '实验性', category: 'maturity', color: '#f97316' },
];

export const skillCategories: SkillCategory[] = [
  { id: 'coding', name: '编码能力', icon: '🖥️', tags: ['code-generation', 'code-review', 'code-debug', 'code-test', 'code-refactor', 'security', 'perf-optim', 'devops'] },
  { id: 'research', name: '研究分析', icon: '🔬', tags: ['data-analysis', 'data-viz', 'research', 'web-scrape', 'doc-writing', 'doc-review'] },
  { id: 'creative', name: '创意生成', icon: '🎨', tags: ['image-gen', 'video-gen', 'audio-tts', 'audio-stt', 'translation'] },
  { id: 'automation', name: '智能自动化', icon: '⚡', tags: ['autonomy', 'browser-auto', 'api-integration', 'memory-mgmt', 'planning', 'mcp-server'] },
  { id: 'business', name: '行业应用', icon: '💼', tags: ['finance', 'legal', 'medical', 'education', 'marketing', 'hr', 'e-commerce'] },
  { id: 'dev-platform', name: '开发平台', icon: '🔧', tags: ['web-dev', 'mobile-dev', 'backend-dev', 'ml-ai', 'infra'] },
];

export function getTagById(id: string): SkillTag | undefined {
  return skillTags.find(t => t.id === id);
}

export function getTagsByCategory(category: SkillTag['category']): SkillTag[] {
  return skillTags.filter(t => t.category === category);
}

export function getTagColors(tags: string[]): string[] {
  const result: string[] = [];
  for (const tagId of tags) {
    const tag = getTagById(tagId);
    if (tag) result.push(tag.color);
  }
  return [...new Set(result)];
}