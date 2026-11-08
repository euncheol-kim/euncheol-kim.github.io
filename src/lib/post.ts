import { CATEGORY_GROUP_NAMES, CATEGORY_PUBLIC_NAMES, PINNED_CATEGORY_GROUPS } from '@/config/category';
import { CategoryDetail, CategoryGroupDetail, HeadingItem, Post, PostMatter, SearchablePost } from '@/config/types';
import dayjs from 'dayjs';
import fs from 'fs';
import GithubSlugger from 'github-slugger';
import { sync } from 'glob';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';

const BASE_PATH = 'src/posts';
const POSTS_PATH = path.join(process.cwd(), BASE_PATH);

// 모든 MDX 파일 조회 : src/posts/{group}/{category}/{slug}/content.mdx
export const getPostPaths = (category?: string) => {
  const folder = category || '*';
  const postPaths: string[] = sync(`${POSTS_PATH}/*/${folder}/*/*.mdx`);
  return postPaths;
};

// MDX 파일 파싱 : abstract / detail 구분
const parsePost = async (postPath: string): Promise<Post> => {
  const postAbstract = parsePostAbstract(postPath);
  const postDetail = await parsePostDetail(postPath);
  const { groupPath, categoryPath, slug } = postAbstract;
  const imageBase = `/posts/${groupPath}/${categoryPath}/${slug}/`;
  const thumbnail = postDetail.thumbnail.startsWith('./')
    ? postDetail.thumbnail.replace('./', imageBase)
    : postDetail.thumbnail;
  const content = postDetail.content.replaceAll('](./', '](' + imageBase);
  return {
    ...postAbstract,
    ...postDetail,
    thumbnail,
    content,
  };
};

// MDX의 개요 파싱
// url, group path, cg path, cg name, slug
export const parsePostAbstract = (postPath: string) => {
  const normalizedPath = postPath.split(path.sep).join('/');
  const filePath = normalizedPath
    .slice(normalizedPath.indexOf(BASE_PATH))
    .replace(`${BASE_PATH}/`, '')
    .replace('.mdx', '');

  const [groupPath, categoryPath, slug] = filePath.split('/');
  const url = `/blog/${categoryPath}/${slug}`;
  const categoryPublicName = getCategoryPublicName(categoryPath);
  return { url, groupPath, categoryPath, categoryPublicName, slug };
};

// MDX detail
const parsePostDetail = async (postPath: string) => {
  const file = fs.readFileSync(postPath, 'utf8');
  const { data, content } = matter(file);
  const grayMatter = data as PostMatter;
  const readingMinutes = Math.ceil(readingTime(content).minutes);
  const dateString = dayjs(grayMatter.date).locale('ko').format('YYYY년 MM월 DD일');
  const isVisible = grayMatter.isVisible !== false;
  const tags = grayMatter.tags
    ? grayMatter.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];
  return { ...grayMatter, dateString, content, readingMinutes, isVisible, tags };
};

// category folder name을 public name으로 변경 : dir_name -> Dir Name
export const getCategoryPublicName = (dirPath: string) =>
  CATEGORY_PUBLIC_NAMES[dirPath] ??
  dirPath
    .split('_')
    .map((token) => token[0].toUpperCase() + token.slice(1, token.length))
    .join(' ');

// post를 날짜 최신순으로 정렬
const sortPostList = (PostList: Post[]) => {
  return PostList.sort((a, b) => (a.date > b.date ? -1 : 1));
};

// 모든 포스트 목록 조회. 블로그 메인 페이지에서 사용
export const getPostList = async (category?: string): Promise<Post[]> => {
  const postPaths = getPostPaths(category);
  const postList = await Promise.all(postPaths.map((postPath) => parsePost(postPath)));
  return postList.filter((post) => post.isVisible !== false);
};

export const getHotPostList = async () => {
  const postList = await getPostList();
  const hotPostList = postList.filter((post) => post.isHot);
  return sortPostList(hotPostList);
};

export const getSortedPostList = async (category?: string) => {
  const postList = await getPostList(category);
  return sortPostList(postList);
};

export const getSitemapPostList = async () => {
  const postList = await getPostList();
  const baseUrl = 'https://www.d5br5.dev';
  const sitemapPostList = postList.map(({ url }) => ({
    lastModified: new Date(),
    url: `${baseUrl}${url}`,
  }));
  return sitemapPostList;
};

export const getAllPostCount = async () => (await getPostList()).length;
export const getHotPostCount = async () => (await getHotPostList()).length;

const getSubDirNames = (dirPath: string) =>
  fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

// 상위 카테고리 폴더 목록 : 고정 카테고리 → 설정된 순서 → 설정에 없는 폴더 순
export const getCategoryGroupList = () => {
  const groupOrder = [
    ...PINNED_CATEGORY_GROUPS,
    ...Object.keys(CATEGORY_GROUP_NAMES).filter((group) => !PINNED_CATEGORY_GROUPS.includes(group)),
  ];
  const orderOf = (group: string) =>
    groupOrder.includes(group) ? groupOrder.indexOf(group) : groupOrder.length;
  return getSubDirNames(POSTS_PATH).sort((a, b) => orderOf(a) - orderOf(b));
};

export const getCategoryGroupPublicName = (groupPath: string) =>
  CATEGORY_GROUP_NAMES[groupPath] ?? getCategoryPublicName(groupPath);

// 하위 카테고리 폴더 목록. URL이 /blog/{category}/{slug}이므로 하위 카테고리명은 전체에서 유일해야 한다.
export const getCategoryList = () => {
  const cgList = getCategoryGroupList().flatMap((group) =>
    getSubDirNames(path.join(POSTS_PATH, group))
  );
  const duplicated = cgList.filter((cg, index) => cgList.indexOf(cg) !== index);
  if (duplicated.length > 0) {
    throw new Error(`하위 카테고리 폴더명이 중복되었습니다: ${duplicated.join(', ')}`);
  }
  return cgList;
};

export const getCategoryDetailList = async () => {
  const postList = await getPostList();
  const result: { [key: string]: number } = {};
  for (const post of postList) {
    const category = post.categoryPath;
    if (result[category]) {
      result[category] += 1;
    } else {
      result[category] = 1;
    }
  }
  const detailList: CategoryDetail[] = Object.entries(result).map(([category, count]) => ({
    dirName: category,
    publicName: getCategoryPublicName(category),
    count,
  }));

  return detailList;
};

// 상위 카테고리별로 하위 카테고리를 묶어서 조회 (노출할 포스트가 없는 카테고리는 고정 카테고리만 노출)
export const getCategoryGroupDetailList = async (): Promise<CategoryGroupDetail[]> => {
  const postList = await getPostList();
  const detailList = await getCategoryDetailList();
  return getCategoryGroupList()
    .map((groupPath) => {
      const categorySet = new Set(
        postList.filter((post) => post.groupPath === groupPath).map((post) => post.categoryPath)
      );
      const children = detailList
        .filter((detail) => categorySet.has(detail.dirName))
        .sort((a, b) => b.count - a.count);
      const count = children.reduce((sum, detail) => sum + detail.count, 0);
      return { id: groupPath, name: getCategoryGroupPublicName(groupPath), count, children };
    })
    .filter((group) => group.count > 0 || PINNED_CATEGORY_GROUPS.includes(group.id));
};

// 상위 카테고리에 속한 모든 포스트를 날짜 최신순으로 조회
export const getSortedPostListByGroup = async (groupPath: string) => {
  const postList = await getPostList();
  return sortPostList(postList.filter((post) => post.groupPath === groupPath));
};

// 검색용 포스트 목록 조회 (content 제외하여 경량화)
export const getSearchablePostList = async (): Promise<SearchablePost[]> => {
  const postList = await getSortedPostList();
  return postList.map(({ title, tags, url, categoryPublicName, dateString, desc }) => ({
    title,
    tags,
    url,
    categoryPublicName,
    dateString,
    desc,
  }));
};

// post 상세 페이지 내용 조회
export const getPostDetail = async (category: string, slug: string) => {
  const [filePath] = sync(`${POSTS_PATH}/*/${category}/${slug}/content.mdx`);
  const detail = await parsePost(filePath);
  return detail;
};

export const parseToc = (content: string): HeadingItem[] => {
  // 코드 블록 안의 주석(# ...)이 헤딩으로 잡히지 않도록 제거
  const withoutCodeBlocks = content.replace(/^(```|~~~)[\s\S]*?^\1/gm, '');
  const regex = /^(#{1,3}) (.*$)/gm;
  const headingList = Array.from(withoutCodeBlocks.matchAll(regex));
  const slugger = new GithubSlugger();

  const stripHtml = (str: string) => str.replace(/<[^>]*>/g, '').trim();

  // 포스트에서 사용된 가장 상위 헤딩 레벨을 기준으로 들여쓰기 계산
  const minLevel = Math.min(...headingList.map(([, hashes]) => hashes.length));

  return headingList.map(([, hashes, rawText]) => {
    const indent = hashes.length - minLevel;
    const text = stripHtml(rawText);
    const link = '#' + slugger.slug(text);
    return { text, link, indent };
  });
};
