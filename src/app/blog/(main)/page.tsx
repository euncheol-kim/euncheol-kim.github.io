import PostListPage from '@/components/post_list/PostListPage';
import { getSortedPostList } from '@/lib/post';
import { Curation } from './curation';

const Blog = async () => {
  const postList = await getSortedPostList();
  
  return (
    <section>
      <Curation postList={postList}/>
      <div className='mx-auto w-full max-w-[1200px] my-10 px-8' >
      <hr />
      </div>
      <PostListPage postList={postList.slice(1)} />
    </section>
  );
};

export default Blog;
