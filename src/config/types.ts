import { RESUME_DATA_EN } from '@/data/resume-data-en';
import { RESUME_DATA_KO } from '@/data/resume-data-ko';

export interface PostMatter {
  title: string;
  date: Date;
  dateString: string;
  thumbnail: string;
  desc: string;
  isHot?: boolean;
  isVisible?: boolean;
  tags?: string;
}

export interface Post extends Omit<PostMatter, 'tags'> {
  url: string;
  slug: string;
  categoryPath: string;
  content: string;
  readingMinutes: number;
  categoryPublicName: string;
  tags: string[];
}

export interface SearchablePost {
  title: string;
  tags: string[];
  url: string;
  categoryPublicName: string;
  dateString: string;
  desc: string;
}

export interface CategoryDetail {
  dirName: string;
  publicName: string;
  count: number;
}

export interface HeadingItem {
  text: string;
  link: string;
  indent: number;
}

export interface ProjectMatter {
  title: string;
  desc: string;
  startMonth: string;
  endMonth: string;
  tags: string;
  gitRepoUrl?: string;
  link?: string;
  isVisible?: boolean;
}

export interface Project extends ProjectMatter {
  slug: string;
  startMonthString: string;
  endMonthString?: string;
  content: string;
}

export const DATAS = {
  en: {
    data: RESUME_DATA_EN,
    aboutClassName: '',
  },
  ko: {
    data: RESUME_DATA_KO,
    aboutClassName: 'sm:whitespace-pre-wrap whitespace-normal',
  },
};

export type Locale = keyof typeof DATAS;
