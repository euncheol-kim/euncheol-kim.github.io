'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { BlogIntro } from '@/components/graph/BlogIntro';
import { PostGraph as PostGraphData } from '@/config/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, Waypoints, X } from 'lucide-react';

// 그래프는 canvas와 window에 의존하고 처음 열 때만 필요하므로, 그때 브라우저에서 불러온다.
const PostGraph = dynamic(() => import('@/components/graph/PostGraph'), { ssr: false });

// 패널 폭(graph)은 tailwind.config.ts의 spacing에 정의한다. 손잡이는 열린 패널의 오른쪽 끝에 붙는다.
const DRAWER_WIDTH_CLASS = 'w-graph';
const HANDLE_OPEN_CLASS = 'left-graph';

// 블로그 화면 왼쪽의 그래프 패널. 기본으로 열려 있고 가장자리의 손잡이로 접고 편다.
// 좁은 화면에서는 그래프를 다루기 어려워 손잡이와 패널을 모두 숨긴다.
export const GraphDrawer = ({ graph }: { graph: PostGraphData }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [hasOpened, setHasOpened] = useState(false);
  const isBlog = pathname.startsWith('/blog');

  // 글 본문에서 열면 읽고 있는 글을 선택해 둔다.
  const currentPostId = graph.nodes.find(
    (node) => node.type === 'post' && node.id === decodeURIComponent(pathname)
  )?.id;

  // 소개 글은 목록 화면에 처음 들어왔을 때 올라온 상태로 시작한다.
  // 글 본문에서는 그래프와 글 정보가 가려지지 않도록 접어 둔다.
  const [isIntroOpen, setIsIntroOpen] = useState(!currentPostId);
  useEffect(() => {
    if (currentPostId) setIsIntroOpen(false);
  }, [currentPostId]);

  // 패널이 보이는 화면(lg 이상)에서만 그래프를 불러온다.
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const load = () => media.matches && setHasOpened(true);
    load();
    media.addEventListener('change', load);
    return () => media.removeEventListener('change', load);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    // 소개 글이 올라와 있으면 그것부터 내린다.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isIntroOpen) setIsIntroOpen(false);
      else setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isIntroOpen]);

  // 본문이 패널과 손잡이를 피해 밀려나도록 html에 상태를 남긴다. (graph-open, graph-closed variant)
  // 첫 화면에서 본문이 뒤늦게 밀리지 않도록 layout.tsx의 html에도 같은 표시가 미리 들어 있다.
  useEffect(() => {
    const root = document.documentElement;
    if (isBlog) root.setAttribute('data-graph', isOpen ? 'open' : 'closed');
    else root.removeAttribute('data-graph');
  }, [isOpen, isBlog]);

  if (!isBlog) return null;

  const toggle = () => setIsOpen(!isOpen);

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
          'fixed inset-y-0 left-0 z-50 overflow-hidden border-r bg-card pb-10 shadow-2xl transition-[transform,visibility] duration-300 dark:border-slate-700',
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
        <BlogIntro isOpen={isIntroOpen} onToggle={() => setIsIntroOpen(!isIntroOpen)} />
      </aside>
    </div>
  );
};
