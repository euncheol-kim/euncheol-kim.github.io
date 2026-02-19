import { MiniPostCard } from "@/components/post_list/MiniPostCard";
import PostCard from "@/components/post_list/PostCard";
import { Post } from "@/config/types";

export const Curation = ({postList}: {postList: Post[]}) => {
  if (postList.length === 0) return null;

  const firstPost = postList[0];
  const hotPostAllList = postList.filter((post) => post.isHot);
  const hotPostShowList = firstPost.isHot? hotPostAllList.slice(1,  5) : hotPostAllList.slice(0,  4);

  return (
    <div className='mx-auto w-full max-w-[1200px] px-4 flex gap-6 lg:gap-8 mt-6 sm:mt-10 flex-col sm:flex-row items-stretch'>
      <section className="flex-1 w-full flex flex-col min-[980px]:min-w-[520px]">
        <h2 className='text-lg sm:text-2xl font-bold mb-3'>최신 게시물</h2>
        <div>
        <PostCard post={firstPost} />
        </div>
      </section>
      <section className='flex-1 w-full flex flex-col'>
        <h2 className='text-lg sm:text-2xl font-bold mb-3'>추천 게시물 🔥</h2>
        <div className='flex flex-col gap-3 flex-1 '>
          {hotPostShowList.map((post) => (
            <MiniPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}