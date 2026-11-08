import { cn } from '@/lib/utils';
import CategoryList from './CategoryList';
import { Curation } from './Curation';
import PostCard from './PostCard';
import { Post } from '@/config/types';
import { getAllPostCount, getCategoryGroupDetailList, getHotPostCount, getSortedPostList } from '@/lib/post';

interface PostListProps extends React.HTMLAttributes<HTMLDivElement> {
  postList: Post[];
  category?: string;
  group?: string;
}

const PostListPage = async ({ category, group, postList, className, ...props  }: PostListProps) => {
  const categoryGroupList = await getCategoryGroupDetailList();
  const allPostCount = await getAllPostCount();
  const hotPostCount = await getHotPostCount();
  // 상단 최신/추천 게시물은 선택한 카테고리와 무관하게 전체 포스트 기준으로 노출
  const allPostList = await getSortedPostList();

  return (
    <>
      <Curation postList={allPostList} />
      <div className='mx-auto my-6 w-full max-w-[1200px] px-8'>
        <hr />
      </div>
      <section className={cn('mx-auto w-full max-w-[1200px] px-4 mt-2', className)} {...props}>
        <div className='mb-5 flex flex-wrap items-center gap-x-3 sm:items-start gap-y-2 pl-2 font-bold sm:pl-0'>
          <h2 className='py-1 text-sm sm:hidden'>Category</h2>
          <CategoryList
            allPostCount={allPostCount}
            categoryGroupList={categoryGroupList}
            hotPostCount={hotPostCount}
            currentCategory={category}
            currentGroup={group}
          />
        </div>
        <section>
          <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:gap-6'>
            {postList.map((post) => (
              <PostCard key={post.url + post.date} post={post} />
            ))}
          </ul>
        </section>
      </section>
    </>
  );
};

export default PostListPage;
