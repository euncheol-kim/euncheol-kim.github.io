import Image from 'next/image';
import Link from 'next/link';

import { Post } from '@/config/types';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock3 } from 'lucide-react';

interface Props {
  post: Post;
}

const PostCard = ({ post }: Props) => {
  return (
    <Link href={post.url}>
      <li
        className={cn(
          'flex flex-row gap-0 sm:h-full sm:flex-col sm:gap-3 ',
          'overflow-hidden rounded-md border shadow-md transition hover:shadow-lg dark:border-slate-700  sm:hover:shadow-xl',
          'hover:border-primary dark:hover:border-white'
        )}
      >
        <div className='relative aspect-video w-1/3 rounded-t-md border-b max-[550px]:hidden sm:w-full'>
          {post.isHot && (
            <div className='absolute left-1 top-1 z-10 rounded-sm bg-red-500 px-2 py-1 text-xs font-medium text-stone-50 max-sm:hidden'>
              추천
            </div>
          )}
          <Image
            src={post.thumbnail}
            alt={`thumbnail for ${post.title}`}
            sizes='(max-width: 1000px) 50vw, 450px'
            fill
            priority
            style={{
              objectFit: 'cover',
            }}
          />
        </div>
        <div className='relative flex flex-1 flex-col justify-between px-3 py-2 sm:p-4 sm:pt-1'>
          <div>
            {post.isHot && (
              <div className='absolute right-1 top-1 z-20 rounded-sm bg-red-500 px-1.5 py-0.5 text-xs font-medium text-stone-50 sm:hidden'>
                추천
              </div>
            )}
            <div className='text-xs font-medium text-pink-600 sm:text-sm lg:text-base'>
              {post.categoryPublicName}
            </div>
            <h2 className='my-1 text-sm font-semibold sm:mb-3 sm:text-base sm:font-bold lg:text-lg'>
              {post.title}
            </h2>
          </div>
          <div className='flex justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 sm:text-sm'>
            <div className='flex items-center gap-1'>
              <CalendarDays className='w-3.5' />
              <span>{post.dateString}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock3 className='w-3.5' />
              <span>{post.readingMinutes}분</span>
            </div>
          </div>
        </div>
      </li>
    </Link>
  );
};

export default PostCard;
