import { getTagsByCategory } from '../data/tags';

interface Props {
  activeTags: string[];
  onToggleTag: (id: string) => void;
}

const tagGroups = [
  { label: '能力', category: 'capability' as const },
  { label: '领域', category: 'domain' as const },
  { label: '平台', category: 'platform' as const },
];

export default function TagFilter({ activeTags, onToggleTag }: Props) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
      {tagGroups.map(({ label, category }) => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</h3>
          <div className="flex flex-wrap gap-1.5">
            {getTagsByCategory(category).map(tag => {
              const isActive = activeTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => onToggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-200'
                  }`}
                  style={isActive ? { backgroundColor: tag.color, color: '#fff' } : {}}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}