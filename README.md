https://lou1997.github.io/ai-skill-map/
# AI Skill Map

全网 Agent Skills 分类导航。自动搜集 GitHub 上的 Agent Skills，按多维度标签分类整理，提供交互式浏览和搜索。

## 功能

- **多维标签体系** — 能力、领域、平台、成熟度四个维度，一个 Skill 可打多个标签
- **实时搜索** — 支持搜索技能名、描述、标签、框架名，`⌘K` 快捷键唤起
- **分类筛选** — 6 大类别（编码/研究/创意/自动化/行业/开发），标签组合交叉过滤
- **双视图** — 网格卡片视图 + 可视化分布地图
- **自动抓取** — 通过 GitHub Search API 自动发现新 Skills

## 技术栈

- **前端** — Vite + React + TypeScript + Tailwind CSS
- **部署** — GitHub Pages (GitHub Actions CI)

## 快速开始

```bash
npm install
npm run dev          # 本地开发 http://localhost:5173/ai-skill-map/
npm run build        # 生产构建
npm run scrape:all   # 抓取全网 Skills
npm run gen:data     # 合并数据
```

## 目录结构

```
ai-skill-map/
├── src/
│   ├── App.tsx              # 主应用
│   ├── data/
│   │   ├── types.ts         # 类型定义
│   │   ├── tags.ts          # 标签体系
│   │   ├── seed.ts          # 种子数据
│   │   └── skills.json      # 合并后的数据
│   └── components/          # UI 组件
├── scripts/
│   ├── scrape-github.ts     # GitHub API 抓取
│   └── generate-data.ts     # 数据合并
├── .github/workflows/deploy.yml  # CI 部署
└── ...
```

## 数据模型

每个 Skill 包含：

| 字段 | 说明 |
|------|------|
| `name` | 技能名称 |
| `description` | 简短描述 |
| `tags` | 多维度标签数组 |
| `framework` | 所属框架 |
| `github.repo` | GitHub 仓库地址 |
| `github.stars` | Star 数 |

## 标签维度

| 维度 | 示例 |
|------|------|
| 能力 | code-generation, research, browser-auto, mcp-server |
| 领域 | web-dev, ml-ai, finance, legal |
| 平台 | claude, cursor, langchain, crewai, cloudflare |
| 成熟度 | production, beta, experimental |

## 贡献

欢迎提交 PR 补充新 Skills！只需在 `src/data/seed.ts` 中添加新条目，或运行 `npm run scrape:all` 自动发现。

## License

MIT
