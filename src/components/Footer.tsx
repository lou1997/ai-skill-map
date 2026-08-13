export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 mt-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          AI Skill Map &copy; 2026 &mdash; 持续更新中的 Agent Skills 导航
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>数据来源: GitHub / 社区贡献</span>
          <span>·</span>
          <a href="https://github.com/lou1997/ai-skill-map" className="text-primary-400 hover:text-primary-300 transition-colors">
            提交 PR
          </a>
        </div>
      </div>
    </footer>
  );
}