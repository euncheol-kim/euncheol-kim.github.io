import { MiniPostCard } from '@/components/post_list/MiniPostCard';
import PostCard from '@/components/post_list/PostCard';
import PostListPage from '@/components/post_list/PostListPage';
import { getSortedPostList } from '@/lib/post';

const Blog = async () => {
  const postList = await getSortedPostList();
  const firstPost = postList[0];

  const hotPostAllList = postList.filter((post) => post.isHot);
  const hotPostShowList = firstPost.isHot ? hotPostAllList.slice(1, 5) : hotPostAllList.slice(0, 4);

  return (
    <section>
      <div className='mx-auto w-full max-w-[1200px] px-4 flex gap-8 mt-10 mb-16 flex-col sm:flex-row items-stretch'>
        <section className="flex-1 w-full">
          <h2 className='text-2xl font-bold mb-3'>최신 게시물</h2>
          <div>
          <PostCard post={firstPost} />
          </div>
        </section>
        <section className='flex-1 w-full flex flex-col self-stretch'>
          <h2 className='text-2xl font-bold mb-3'>추천 게시물 🔥</h2>
          <div className='flex flex-col gap-3 flex-1 justify-between'>
            {hotPostShowList.map((post) => (
              <MiniPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>
      <PostListPage postList={postList.slice(1)} />
    </section>
  );
};

export default Blog;
