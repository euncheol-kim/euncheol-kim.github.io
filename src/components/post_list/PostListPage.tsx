import { cn } from '@/lib/utils';
import CategoryList from './CategoryList';
import PostCard from './PostCard';
import { Post } from '@/config/types';
import { getAllPostCount, getCategoryDetailList, getHotPostCount } from '@/lib/post';

interface PostListProps extends React.HTMLAttributes<HTMLDivElement> {
  postList: Post[];
  category?: string;
}

const PostListPage = async ({ category, postList, className, ...props  }: PostListProps) => {
  const categoryList = await getCategoryDetailList();
  const allPostCount = await getAllPostCount();
  const hotPostCount = await getHotPostCount();

  return (
    <section className={cn('mx-auto w-full max-w-[1200px] px-4 mt-10', className)} {...props}>
      <div className='mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 pl-2 font-bold sm:pl-0'>
        <h2 className='text-sm sm:text-base'>Category</h2>
        <CategoryList
          allPostCount={allPostCount}
          categoryList={categoryList}
          hotPostCount={hotPostCount}
          currentCategory={category}
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
  );
};

export default PostListPage;
