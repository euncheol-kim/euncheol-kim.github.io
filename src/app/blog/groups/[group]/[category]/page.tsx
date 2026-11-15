import { Metadata } from 'next';

import PostListPage from '@/components/post_list/PostListPage';
import { baseDomain, blogName, blogThumbnailURL } from '@/config/const';
import { getCategoryList, getCategoryPublicName, getCategoryUrl, getSortedPostList } from '@/lib/post';

type Props = {
  params: { group: string; category: string };
};

// 허용된 param 외 접근시 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategoryList();
}

export async function generateMetadata({ params: { group, category } }: Props): Promise<Metadata> {
  const cg = getCategoryPublicName(category);
  const title = `${cg} | ${blogName}`;
  const url = `${baseDomain}${getCategoryUrl(group, category)}`;

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

const CategoryPage = async ({ params }: Props) => {
  const postList = await getSortedPostList(params.group, params.category);
  return <PostListPage postList={postList} group={params.group} category={params.category} />;
};

export default CategoryPage;
