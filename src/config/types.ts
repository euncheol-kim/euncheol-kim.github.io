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
  groupPath: string;
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

export interface CategoryGroupDetail {
  id: string;
  name: string;
  row: number; // 카테고리 탭에서 노출될 줄 번호
  count: number;
  children: CategoryDetail[];
}

export type GraphNodeType = 'post' | 'category';
export type GraphLinkType = 'link' | 'category';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  url: string; // 이동할 경로
  // 아래는 글에만 있다
  group?: string; // 속한 상위 카테고리의 id. 같은 값끼리 화면에서 한 영역으로 묶인다
  sub?: string; // 하위 카테고리 표시 이름
  desc?: string;
  dateString?: string;
  tags?: string[];
}

export interface GraphLink {
  source: string;
  target: string;
  type: GraphLinkType; // link: 본문에서 다른 글로 건 링크, category: 글이 속한 하위 카테고리
}

export interface PostGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  groups: { id: string; label: string }[]; // 상위 카테고리. 화면에서 점들을 감싸는 영역이 된다
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
