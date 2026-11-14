'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { PostGraph as PostGraphData } from '@/config/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, Waypoints, X } from 'lucide-react';

// 그래프는 canvas와 window에 의존하고 처음 열 때만 필요하므로, 그때 브라우저에서 불러온다.
const PostGraph = dynamic(() => import('@/components/graph/PostGraph'), { ssr: false });

// 패널 폭은 화면의 38.2%(황금비의 작은 쪽)로 잡아 본문이 더 넓게 남게 한다.
// 너무 좁거나 넓어지지 않도록 440~640px 사이로 제한한다. 손잡이는 열린 패널의 오른쪽 끝에 붙는다.
const DRAWER_WIDTH_CLASS = 'w-[clamp(440px,38.2vw,640px)]';
const HANDLE_OPEN_CLASS = 'left-[clamp(440px,38.2vw,640px)]';

// 블로그 화면 왼쪽 가장자리의 손잡이를 누르면 열리는 그래프 패널.
// 좁은 화면에서는 그래프를 다루기 어려워 손잡이와 패널을 모두 숨긴다.
export const GraphDrawer = ({ graph }: { graph: PostGraphData }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  // 글 본문에서 열면 읽고 있는 글을 선택해 둔다.
  const currentPostId = graph.nodes.find(
    (node) => node.type === 'post' && node.id === decodeURIComponent(pathname)
  )?.id;

  // 패널 안에서 글로 이동하면 패널을 닫는다.
  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!pathname.startsWith('/blog')) return null;

  const toggle = () => {
    setHasOpened(true);
    setIsOpen(!isOpen);
  };

  return (
    <div className='hidden lg:block print:hidden'>
      <button
        type='button'
        onClick={toggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close graph' : 'Open graph'}
        className={cn(
          'group fixed top-[34%] z-50 flex -translate-y-1/2 flex-col items-center gap-2.5 rounded-r-xl bg-primary py-5 pl-2 pr-2.5 text-primary-foreground shadow-lg transition-[left,padding] duration-300 hover:pl-3.5',
          isOpen ? HANDLE_OPEN_CLASS : 'left-0'
        )}
      >
        {isOpen ? <ChevronLeft className='size-5' /> : <Waypoints className='size-5' />}
        <span className='text-sm font-bold tracking-wide [writing-mode:vertical-rl]'>Graph</span>
      </button>

      <aside
        aria-hidden={!isOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 border-r bg-card shadow-2xl transition-[transform,visibility] duration-300 dark:border-slate-700',
          DRAWER_WIDTH_CLASS,
          isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        )}
      >
        {hasOpened && (
          <PostGraph graph={graph} focusId={currentPostId} isActive={isOpen} className='size-full' />
        )}
        <button
          type='button'
          aria-label='Close graph'
          onClick={() => setIsOpen(false)}
          className='absolute right-3 top-3 flex size-8 items-center justify-center rounded-md border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:border-slate-700'
        >
          <X className='size-4' />
        </button>
      </aside>
    </div>
  );
};
