import PostListPage from '@/components/post_list/PostListPage';
import { getSortedPostList } from '@/lib/post';

const Blog = async () => {
  const postList = await getSortedPostList();
  return <PostListPage postList={postList} />;
};

export default Blog;
