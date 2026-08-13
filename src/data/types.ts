export interface SkillTag {
  id: string;
  name: string;
  category: 'capability' | 'domain' | 'platform' | 'maturity';
  color: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  url: string;
  source: string;
  tags: string[];
  tagsMeta?: Record<string, string[]>;
  framework?: string;
  github?: {
    repo: string;
    stars?: number;
    forks?: number;
    language?: string;
  };
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  tags: string[];
}