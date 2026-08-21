'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Post } from '@/config/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { MiniPostCard } from './MiniPostCard';

interface Props {
  posts: Post[]; // 최신순(내림차순)으로 정렬되어 들어온다
}

const PAGE_SIZE = 4; // 한 페이지에 보여줄 추천글 수
const AUTO_MS = 5000; // 자동 전환 간격

export const HotPostCarousel = ({ posts }: Props) => {
  // 최신글이 첫 페이지 맨 위에 오도록 순서 유지한 채 4개씩 페이지로 묶는다
  const pages: Post[][] = [];
  for (let i = 0; i < posts.length; i += PAGE_SIZE) {
    pages.push(posts.slice(i, i + PAGE_SIZE));
  }

  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const single = pages.length <= 1;

  const goTo = useCallback(
    (idx: number) => {
      const track = trackRef.current;
      if (!track || pages.length === 0) return;
      const count = pages.length;
      const next = ((idx % count) + count) % count; // 순환
      track.scrollTo({ left: track.clientWidth * next, behavior: 'smooth' });
    },
    [pages.length]
  );

  // 스와이프/드래그로 스크롤되면 현재 페이지 인디케이터를 동기화
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }, []);

  // 자동 전환 (마우스/포커스 중에는 멈춤)
  useEffect(() => {
    if (single || paused) return;
    const id = setInterval(() => goTo(active + 1), AUTO_MS);
    return () => clearInterval(id);
  }, [active, paused, single, goTo]);

  if (posts.length === 0) return null;

  return (
    <div
      className='group relative flex flex-1 flex-col'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* 슬라이드 트랙: CSS scroll-snap 으로 트랙패드/터치 스와이프가 바로 반영된다 */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className={cn(
          'flex flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth',
          'touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        )}
      >
        {pages.map((page, pi) => (
          <div
            key={pi}
            className='flex min-w-full shrink-0 snap-start flex-col gap-3'
          >
            {page.map((post) => (
              <MiniPostCard key={post.slug} post={post} />
            ))}
          </div>
        ))}
      </div>

      {!single && (
        <>
          {/* 좌우 화살표: 데스크톱에서 hover 시 노출 */}
          <button
            type='button'
            aria-label='이전 추천글'
            onClick={() => goTo(active - 1)}
            className={cn(
              'absolute left-0 top-[calc(50%-1rem)] hidden -translate-x-1/2 sm:flex',
              'h-8 w-8 items-center justify-center rounded-full border bg-white/90 shadow-md',
              'opacity-0 transition group-hover:opacity-100 hover:bg-white',
              'dark:border-slate-700 dark:bg-slate-800/90 dark:hover:bg-slate-800'
            )}
          >
            <ChevronLeft className='w-4' />
          </button>
          <button
            type='button'
            aria-label='다음 추천글'
            onClick={() => goTo(active + 1)}
            className={cn(
              'absolute right-0 top-[calc(50%-1rem)] hidden translate-x-1/2 sm:flex',
              'h-8 w-8 items-center justify-center rounded-full border bg-white/90 shadow-md',
              'opacity-0 transition group-hover:opacity-100 hover:bg-white',
              'dark:border-slate-700 dark:bg-slate-800/90 dark:hover:bg-slate-800'
            )}
          >
            <ChevronRight className='w-4' />
          </button>

          {/* 점 인디케이터 (클릭으로 이동) */}
          <div className='mt-3 flex items-center justify-center gap-1.5'>
            {pages.map((_, di) => (
              <button
                key={di}
                type='button'
                aria-label={`추천글 ${di + 1}페이지로 이동`}
                aria-current={di === active}
                onClick={() => goTo(di)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  di === active
                    ? 'w-5 bg-pink-600'
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
