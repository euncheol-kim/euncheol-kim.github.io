import { GraphLink, GraphNode, PostGraph } from '@/config/types';
import { getCategoryGroupPublicName, getSortedPostList } from '@/lib/post';

// 본문에서 다른 글로 건 링크 : [텍스트](/blog/{category}/{slug}) 또는 href="/blog/{category}/{slug}"
const POST_LINK_REGEX = /(?:\]\(|href=["'])(\/blog\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+)(?=[)"'#?])/g;

// 포스트 그래프 데이터 : 글과 하위 카테고리를 노드로, 그 사이의 관계를 링크로 만든다.
// 상위 카테고리는 노드가 아니라, 속한 노드들을 화면에서 한 영역으로 묶는 기준이다.
export const getPostGraph = async (): Promise<PostGraph> => {
  const postList = await getSortedPostList();
  const postUrlSet = new Set(postList.map((post) => post.url));

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const categoryNames = new Map<string, string>();
  const groupOfCategory = new Map<string, string>();
  const linkKeys = new Set<string>();

  for (const post of postList) {
    nodes.push({
      id: post.url,
      type: 'post',
      label: post.title,
      url: post.url,
      sub: post.categoryPublicName,
      desc: post.desc,
      dateString: post.dateString,
      tags: post.tags,
    });

    categoryNames.set(post.categoryPath, post.categoryPublicName);
    groupOfCategory.set(post.categoryPath, post.groupPath);
    links.push({ source: post.url, target: `category:${post.categoryPath}`, type: 'category' });

    for (const [, target] of Array.from(post.content.matchAll(POST_LINK_REGEX))) {
      const key = `${post.url}>${target}`;
      if (target === post.url || !postUrlSet.has(target) || linkKeys.has(key)) continue;
      linkKeys.add(key);
      links.push({ source: post.url, target, type: 'link' });
    }
  }

  const groupIdOf = (groupPath: string) => `group:${groupPath}`;

  for (const node of nodes) {
    const post = postList.find((item) => item.url === node.id);
    if (post) node.group = groupIdOf(post.groupPath);
  }

  categoryNames.forEach((label, categoryPath) => {
    nodes.push({
      id: `category:${categoryPath}`,
      type: 'category',
      label,
      url: `/blog/${categoryPath}`,
      group: groupIdOf(groupOfCategory.get(categoryPath)!),
    });
  });

  const groups = Array.from(new Set(groupOfCategory.values()), (groupPath) => ({
    id: groupIdOf(groupPath),
    label: getCategoryGroupPublicName(groupPath),
  }));

  return { nodes, links, groups };
};
