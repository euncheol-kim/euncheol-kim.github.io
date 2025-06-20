import Image from 'next/image';
import Link from 'next/link';

import { Post } from '@/config/types';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock3 } from 'lucide-react';

interface Props {
  post: Post;
}

export const MiniPostCard = ({ post }: Props) => {
  return (
    <Link href={post.url}>
      <li
        className={cn(
          'flex flex-row gap-0 flex-1 px-3 py-2',
          'overflow-hidden rounded-md border shadow-md transition hover:shadow-lg dark:border-slate-700',
          'hover:border-primary dark:hover:border-white'
        )}
      >
        <div className='relative flex flex-1 flex-col justify-between'>
          <div>
            <div className='text-xs font-medium text-pink-600 sm:text-sm lg:text-base'>
              {post.categoryPublicName}
            </div>
            <h2 className='my-1 text-sm font-semibold sm:text-base sm:font-bold lg:text-lg'>
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