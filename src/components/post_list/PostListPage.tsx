import CategoryList from './CategoryList';
import PostCard from './PostCard';
import { getAllPostCount, getCategoryDetailList, getSortedPostList } from '@/lib/post';

interface PostListProps {
  category?: string;
}

const PostListPage = async ({ category }: PostListProps) => {
  const postList = await getSortedPostList(category);
  const categoryList = await getCategoryDetailList();
  const allPostCount = await getAllPostCount();

  return (
    <section className='mx-auto mt-8 w-full max-w-[1200px] px-4'>
      <div className='mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-bold'>
        <h2 className='text-sm sm:text-base'>Category</h2>
        <CategoryList
          allPostCount={allPostCount}
          categoryList={categoryList}
          currentCategory={category}
        />
      </div>
      <section>
        <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 sm:gap-8 md:grid-cols-3 lg:gap-6'>
          {postList.map((post) => (
            <PostCard key={post.url + post.date} post={post} />
          ))}
        </ul>
      </section>
    </section>
  );
};

export default PostListPage;
