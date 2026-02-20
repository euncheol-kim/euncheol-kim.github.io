import Link from 'next/link';

import { Post } from '@/config/types';
import { CalendarDays, Clock3 } from 'lucide-react';

interface Props {
  post: Post;
}

export const PostHeader = ({ post }: Props) => {
  return (
    <header className='mt-14 text-center'>
      <h1 className='mb-2 text-lg sm:text-xl md:text-2xl lg:text-3xl'>{post.title}</h1>
      {post.desc && (
        <p className='mb-5 text-sm text-gray-500 dark:text-gray-400 sm:text-base'>
          {post.desc}
        </p>
      )}
      <div className='mb-3 text-base'>
        <Link
          href={`/blog/${post.categoryPath}`}
          className='font-semibold text-pink-600 no-underline underline-offset-4 hover:underline'
        >
          {post.categoryPublicName}
        </Link>
      </div>
      {post.tags.length > 0 && (
        <div className='mb-3 flex flex-wrap justify-center gap-2'>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className='text-xs text-gray-400 dark:text-gray-500'
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className='flex justify-center gap-3 text-sm text-gray-500 dark:text-gray-400'>
        <div className='flex items-center gap-1'>
          <CalendarDays className='w-3.5' />
          <span>{post.dateString}</span>
        </div>
        <div className='flex items-center gap-1'>
          <Clock3 className='w-3.5' />
          <span>{post.readingMinutes}분</span>
        </div>
      </div>
      <hr className='mt-5' />
    </header>
  );
};
