import { Metadata } from 'next';

import FloatingButton from '@/components/common/FloatingButton';
import Giscus from '@/components/post_detail/Giscus';
import { PostBody } from '@/components/post_detail/PostBody';
import { PostHeader } from '@/components/post_detail/PostHeader';
import TocSidebar from '@/components/post_detail/TableOfContentSidebar';
import { baseDomain } from '@/config/const';
import { getPostDetail, getPostList, parseToc } from '@/lib/post';

type Props = {
  params: { group: string; category: string; slug: string };
};

// 허용된 param 외 접근시 404
export const dynamicParams = false;

export async function generateMetadata({ params: { group, category, slug } }: Props): Promise<Metadata> {
  const post = await getPostDetail(group, category, slug);

  const title = `${post.title} | D5BL5G`;
  const imageURL = `${baseDomain}${post.thumbnail}`;

  return {
    title,
    description: post.desc,

    openGraph: {
      title,
      description: post.desc,
      type: 'article',
      publishedTime: post.date.toISOString(),
      url: `${baseDomain}${post.url}`,
      images: [imageURL],
    },
    twitter: {
      title,
      description: post.desc,
      images: [imageURL],
    },
  };
}

export async function generateStaticParams() {
  const postList = await getPostList();
  return postList.map((post) => ({ group: post.groupPath, category: post.categoryPath, slug: post.slug }));
}

const PostDetail = async ({ params: { group, category, slug } }: Props) => {
  const post = await getPostDetail(group, category, slug);
  const toc = parseToc(post.content);
  return (
    // lg부터 본문을 900px로 넓힌다. xl에서는 오른쪽 목차 위치를 유지하도록 늘어난 폭만큼 왼쪽으로 옮긴다.
    // 그래프 패널이 열려 오른쪽 목차를 둘 자리가 없으면(1964px 미만) 본문을 다시 가운데에 둔다.
    <div className='prose mx-auto w-full max-w-[750px] px-5 dark:prose-invert sm:px-6 lg:max-w-[900px] xl:relative xl:right-[75px] graph-open:max-[1963px]:right-0'>
      <PostHeader post={post} />
      <article className='relative'>
        <TocSidebar toc={toc} />
        <PostBody post={post} />
      </article>
      <hr />
      <Giscus />
      <FloatingButton />
    </div>
  );
};

export default PostDetail;
