import { useEffect, useRef } from 'react';
import { getTagById } from '../data/tags';
import { renderMarkdown } from '../utils/markdown';
import type { Skill } from '../data/types';

interface Props {
  skill: Skill;
  onClose: () => void;
}

export default function SkillDetail({ skill, onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const capabilityTags = skill.tags.filter(t => getTagById(t)?.category === 'capability');
  const domainTags = skill.tags.filter(t => getTagById(t)?.category === 'domain');
  const platformTags = skill.tags.filter(t => getTagById(t)?.category === 'platform');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/95 backdrop-blur-sm rounded-t-2xl z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-100">{skill.name}</h2>
            <p className="text-sm text-slate-400 mt-0.5 truncate">{skill.github?.repo || skill.source}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-slate-300 leading-relaxed text-sm">{skill.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {skill.github?.stars !== undefined && skill.github.stars > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                <div className="text-amber-400 flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span className="font-semibold">{skill.github.stars.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Stars</div>
              </div>
            )}
            {skill.github?.forks !== undefined && skill.github.forks > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                <div className="text-purple-400 flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h4v1a2 2 0 01-2 2h-.08A2 2 0 018 11V9h2v1h1a1 1 0 110 2h-1v1h1z"/></svg>
                  <span className="font-semibold">{skill.github.forks.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Forks</div>
              </div>
            )}
            {skill.github?.language && (
              <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                <div className="text-cyan-400 font-semibold text-sm">{skill.github.language}</div>
                <div className="text-[10px] text-slate-500 mt-1">Language</div>
              </div>
            )}
            {skill.framework && (
              <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                <div className="text-primary-400 font-semibold text-sm">{skill.framework}</div>
                <div className="text-[10px] text-slate-500 mt-1">Framework</div>
              </div>
            )}
          </div>

          {skill.content ? (
              <div
                ref={contentRef}
                className="prose prose-invert prose-sm max-w-none bg-slate-900/30 rounded-xl p-4 border border-slate-700/30 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(skill.content) }}
              />
            ) : null}

          <TagSection title="能力" tags={capabilityTags} />
          {domainTags.length > 0 && <TagSection title="领域" tags={domainTags} />}
          {platformTags.length > 0 && <TagSection title="平台" tags={platformTags} />}

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-700/30">
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 border border-primary-500/30 rounded-xl transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.212v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              查看 GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TagSection({ title, tags }: { title: string; tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tagId => {
          const tag = getTagById(tagId);
          if (!tag) return null;
          return (
            <span
              key={tagId}
              className="px-2 py-1 rounded-md text-xs font-medium"
              style={{ backgroundColor: tag.color + '22', color: tag.color, borderColor: tag.color + '44' }}
            >
              {tag.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}