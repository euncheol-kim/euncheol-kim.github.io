import { notFound, redirect } from 'next/navigation';

import { getPostList } from '@/lib/post';

type Props = {
  params: { category: string; slug: string };
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const postList = await getPostList();
  return postList.map((post) => ({ category: post.categoryPath, slug: post.slug }));
}

// 예전 주소(/blog/{category}/{slug})로 들어오면 새 주소로 보낸다
const LegacyPostPage = async ({ params: { category, slug } }: Props) => {
  const postList = await getPostList(undefined, category);
  const post = postList.find((item) => item.slug === slug);
  if (!post) notFound();
  redirect(post.url);
};

export default LegacyPostPage;
