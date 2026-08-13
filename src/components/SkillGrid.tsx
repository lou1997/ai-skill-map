import { getTagById } from '../data/tags';
import type { Skill } from '../data/types';

interface Props {
  skills: Skill[];
  onSkillClick: (skill: Skill) => void;
}

export default function SkillGrid({ skills, onSkillClick }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {skills.map((skill, i) => (
        <div
          key={skill.id}
          onClick={() => onSkillClick(skill)}
          className="group bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 hover:border-primary-500/40 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer animate-fade-in"
          style={{ animationDelay: `${i * 20}ms` }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-100 text-sm group-hover:text-primary-300 transition-colors line-clamp-1">
              {skill.name}
            </h3>
            {skill.github?.stars !== undefined && skill.github.stars > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-amber-400 shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span>{formatStars(skill.github.stars)}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{skill.description}</p>

          <div className="flex flex-wrap gap-1 mb-2">
            {skill.tags.slice(0, 4).map(tagId => {
              const tag = getTagById(tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: tag.color + '22', color: tag.color }}
                >
                  {tag.name}
                </span>
              );
            })}
            {skill.tags.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500">+{skill.tags.length - 4}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-700/30">
            <span className="truncate max-w-[60%]">{skill.github?.repo || skill.source}</span>
            {skill.framework && (
              <span className="text-primary-400/70 shrink-0 ml-2">{skill.framework}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatStars(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}