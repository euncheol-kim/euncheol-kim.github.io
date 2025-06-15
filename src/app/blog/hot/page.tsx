import PostListPage from '@/components/post_list/PostListPage';
import { getHotPostList } from '@/lib/post';

const HotList = async () => {
  const postList = await getHotPostList();
  return <PostListPage postList={postList} category='hot' />;
};

export default HotList;
