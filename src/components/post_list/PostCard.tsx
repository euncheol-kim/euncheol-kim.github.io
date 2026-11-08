import Image from 'next/image';
import Link from 'next/link';

import { Post } from '@/config/types';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock3 } from 'lucide-react';

interface Props {
  post: Post;
  compact?: boolean; // 썸네일을 낮은 비율로 보여줘 카드 높이를 줄인다
}

const PostCard = ({ post, compact = false }: Props) => {
  return (
    // sm 이상에서는 Link와 내용 래퍼를 contents로 풀고, 카드(li)가 부모 grid의 행 5개를 subgrid로 공유한다.
    // 썸네일 / 카테고리·제목 / 설명 / 태그 / 날짜가 각각 한 행이 되어,
    // 같은 줄 카드들의 설명·태그 시작 위치가 가장 긴 카드에 맞춰 정렬된다.
    <Link href={post.url} className='h-full sm:contents'>
      <li
        className={cn(
          'flex h-full flex-row gap-0 sm:row-span-5 sm:grid sm:grid-rows-subgrid sm:gap-y-0',
          'overflow-hidden rounded-md border shadow-md transition hover:shadow-lg dark:border-slate-700  sm:hover:shadow-xl',
          'hover:border-primary dark:hover:border-white'
        )}
      >
        <div
          className={cn(
            'relative w-1/3 rounded-t-md sm:border-b max-[550px]:hidden sm:w-full',
            compact ? 'aspect-video sm:aspect-[3/1]' : 'aspect-video'
          )}
        >
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
        <div className='relative flex flex-1 flex-col px-3 py-2 sm:contents'>
          <div className='sm:px-4 sm:pt-4'>
            {post.isHot && (
              <div className='absolute right-1 top-1 z-20 rounded-sm bg-red-500 px-1.5 py-0.5 text-xs font-medium text-stone-50 sm:hidden'>
                추천
              </div>
            )}
            <div className='text-xs font-medium text-pink-600 lg:text-[13px]'>
              {post.categoryPublicName}
            </div>
            <h2 className='my-1 text-sm font-semibold leading-snug sm:mb-2 sm:font-bold lg:text-[15px]'>
              {post.title}
            </h2>
          </div>
          {/* subgrid 행 순서가 어긋나지 않도록 설명·태그는 내용이 없어도 항상 렌더링한다 */}
          <div className='hidden sm:block sm:px-4'>
            <p className='mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
              {post.desc}
            </p>
          </div>
          <div className='mb-1 mt-auto flex flex-wrap content-start gap-x-2 gap-y-0.5 sm:mb-3 sm:mt-0 sm:px-4'>
            {post.tags.map((tag) => (
              <span key={tag} className='text-[11px] font-medium text-sky-700 dark:text-sky-400'>
                #{tag}
              </span>
            ))}
          </div>
          <div className='flex items-end justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 sm:px-4 sm:pb-4 sm:text-sm'>
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
