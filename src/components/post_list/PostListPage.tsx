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
      <CategoryList
        allPostCount={allPostCount}
        categoryList={categoryList}
        currentCategory={category}
      />
      <section>
        <ul className='grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:gap-6'>
          {postList.map((post) => (
            <PostCard key={post.url + post.date} post={post} />
          ))}
        </ul>
      </section>
    </section>
  );
};

export default PostListPage;
