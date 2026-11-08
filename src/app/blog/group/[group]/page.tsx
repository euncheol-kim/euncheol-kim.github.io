import { Metadata } from 'next';

import PostListPage from '@/components/post_list/PostListPage';
import { baseDomain, blogName, blogThumbnailURL } from '@/config/const';
import { getCategoryGroupList, getCategoryGroupPublicName, getSortedPostListByGroup } from '@/lib/post';

type Props = {
  params: { group: string };
};

// 허용된 param 외 접근시 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategoryGroupList().map((group) => ({ group }));
}

export async function generateMetadata({ params: { group } }: Props): Promise<Metadata> {
  const groupName = getCategoryGroupPublicName(group);
  const title = `${groupName} | ${blogName}`;
  const url = `${baseDomain}/blog/group/${group}`;

  return {
    title,
    openGraph: {
      title,
      url,
      images: [blogThumbnailURL],
    },
    twitter: {
      title,
      images: [blogThumbnailURL],
    },
  };
}

const CategoryGroupPage = async ({ params }: Props) => {
  const postList = await getSortedPostListByGroup(params.group);
  return <PostListPage postList={postList} group={params.group} />;
};

export default CategoryGroupPage;
