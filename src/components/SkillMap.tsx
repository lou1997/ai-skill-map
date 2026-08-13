import { useMemo } from 'react';
import type { Skill } from '../data/types';
import { getTagById } from '../data/tags';

interface Props {
  skills: Skill[];
}

export default function SkillMap({ skills }: Props) {
  const nodes = useMemo(() => {
    const tagPositions: Record<string, { x: number; y: number }> = {};
    const categories = ['coding', 'research', 'creative', 'automation'];
    const cx = 400, cy = 300, r = 220;

    categories.forEach((cat, ci) => {
      const angle = (ci / categories.length) * Math.PI * 2 - Math.PI / 2;
      tagPositions[cat] = {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    });

    return skills.map(skill => {
      const mainTag = skill.tags[0];
      const tag = getTagById(mainTag);
      const color = tag?.color || '#64748b';

      return {
        skill,
        x: 100 + Math.random() * 600,
        y: 80 + Math.random() * 440,
        color,
        radius: Math.max(8, Math.min(24, (skill.github?.stars || 0) / 50 + 8)),
      };
    });
  }, [skills]);

  return (
    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300">Skills 分布地图</h2>
        <span className="text-xs text-slate-500">{skills.length} 个技能</span>
      </div>
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto rounded-lg"
        style={{ maxHeight: '500px' }}
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="400" cy="300" r="250" fill="url(#glow)" />

        {nodes.map((node, i) => (
          <g key={node.skill.id} className="cursor-pointer">
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius * 1.5}
              fill={node.color}
              fillOpacity="0.1"
              className="transition-all duration-300 hover:fill-opacity-20"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color}
              fillOpacity="0.7"
              stroke={node.color}
              strokeOpacity="0.9"
              strokeWidth="1"
              className="transition-all duration-300 hover:fill-opacity-100"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          </g>
        ))}

        <text x="400" y="304" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace">
          AI Skill Universe
        </text>
      </svg>
    </div>
  );
}