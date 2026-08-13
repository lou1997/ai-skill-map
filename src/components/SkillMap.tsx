import { useMemo } from 'react';
import type { Skill } from '../data/types';
import { getTagById } from '../data/tags';

interface Props {
  skills: Skill[];
  onSkillClick: (skill: Skill) => void;
}

export default function SkillMap({ skills, onSkillClick }: Props) {
  const nodes = useMemo(() => {
    const shown = skills.slice(0, 150);
    return shown.map(skill => {
      const mainTag = skill.tags[0];
      const tag = getTagById(mainTag);
      const color = tag?.color || '#64748b';
      const stars = skill.github?.stars || 0;
      return {
        skill,
        x: 100 + (Math.abs(hashStr(skill.id) % 600)),
        y: 80 + (Math.abs(hashStr(skill.id + 'y') % 440)),
        color,
        radius: Math.max(6, Math.min(20, Math.log10(stars + 1) * 5 + 4)),
      };
    });
  }, [skills]);

  return (
    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300">Skills 分布地图</h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {skills.length > 150 && <span>显示 {nodes.length}/{skills.length} 个</span>}
          <span>{skills.length} 个技能</span>
        </div>
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

        {nodes.map((node) => (
          <g
            key={node.skill.id}
            className="cursor-pointer"
            onClick={() => onSkillClick(node.skill)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius * 1.5}
              fill={node.color}
              fillOpacity="0.08"
              className="transition-all duration-300 hover:fill-opacity-20"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color}
              fillOpacity="0.6"
              stroke={node.color}
              strokeOpacity="0.8"
              strokeWidth="1"
              className="transition-all duration-300 hover:fill-opacity-100"
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

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}