import { useState, useMemo, useEffect } from 'react';
import { skillCategories, getTagById, getTagsByCategory } from './data/tags';
import type { Skill } from './data/types';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TagFilter from './components/TagFilter';
import SkillGrid from './components/SkillGrid';
import SkillMap from './components/SkillMap';
import SkillDetail from './components/SkillDetail';
import Footer from './components/Footer';

async function loadSkills(): Promise<Skill[]> {
  try {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const resp = await fetch(`${basePath}/data/skills.json`);
    return resp.json();
  } catch {
    return [];
  }
}

export default function App() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    loadSkills().then(setSkills);
  }, []);

  const filteredSkills = useMemo(() => {
    let results = skills;

    if (activeCategory !== 'all') {
      const cat = skillCategories.find(c => c.id === activeCategory);
      if (cat) {
        results = results.filter(s => s.tags.some(t => cat.tags.includes(t)));
      }
    }

    if (activeTags.length > 0) {
      results = results.filter(s => activeTags.some(t => s.tags.includes(t)));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => getTagById(t)?.name.toLowerCase().includes(q)) ||
        (s.framework || '').toLowerCase().includes(q)
      );
    }

    return results;
  }, [skills, search, activeTags, activeCategory]);

  const toggleTag = (tagId: string) => {
    setActiveTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const stats = useMemo(() => {
    const frameworks = new Set(skills.map(s => s.framework).filter(Boolean));
    const domains = getTagsByCategory('domain').length;
    return { total: skills.length, filtered: filteredSkills.length, frameworks: frameworks.size, domains };
  }, [skills, filteredSkills]);

  if (skills.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header stats={stats} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="space-y-5">
          <SearchBar value={search} onChange={setSearch} />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setActiveCategory('all'); setActiveTags([]); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeCategory === 'all'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-transparent'
              }`}
            >
              <span>全部</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700/50">{skills.length}</span>
            </button>
            {skillCategories.map(cat => {
              const count = skills.filter(s => s.tags.some(t => cat.tags.includes(t))).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setActiveTags([]); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700/50">{count}</span>
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}
                title="网格视图"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/></svg>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}
                title="地图视图"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>

          <TagFilter activeTags={activeTags} onToggleTag={toggleTag} />

          {filteredSkills.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">没有找到匹配的 Skills</p>
              <p className="text-slate-500 mt-2 text-sm">试试调整搜索条件或标签筛选</p>
            </div>
          ) : viewMode === 'map' ? (
            <SkillMap skills={filteredSkills} onSkillClick={setSelectedSkill} />
          ) : (
            <SkillGrid skills={filteredSkills} onSkillClick={setSelectedSkill} />
          )}
        </div>
      </main>

      <Footer />
      {selectedSkill && (
        <SkillDetail skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}