'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import CopyLinkButton from '../common/CopyLinkButton';
import { ScrollToComment, ScrollTop } from '../common/TocButtons';
import { HeadingItem } from '@/config/types';
import { useHeadingsObserver } from '@/hook/useHeadingsObserver';
import { cn } from '@/lib/utils';

interface Props {
  toc: HeadingItem[];
}

const TableOfContent = ({ toc }: Props) => {
  const activeIdList = useHeadingsObserver('h1, h2, h3');
  const listRef = useRef<HTMLUListElement>(null);
  const activeId = activeIdList.find((id) => toc.some((item) => item.link === id));

  // 목차가 길어 스크롤되는 경우, 현재 읽는 항목이 목차 영역 안에 보이도록 이동
  useEffect(() => {
    const list = listRef.current;
    if (!list || !activeId) return;
    const activeItem = list.querySelector<HTMLElement>(`[data-link="${CSS.escape(activeId)}"]`);
    if (!activeItem) return;
    const { offsetTop, offsetHeight } = activeItem;
    if (offsetTop < list.scrollTop || offsetTop + offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: offsetTop - list.clientHeight / 2, behavior: 'smooth' });
    }
  }, [activeId]);

  return (
    <aside className='not-prose absolute -top-[200px] left-full -mb-[100px] hidden h-[calc(100%+150px)] xl:block '>
      <div className='sticky bottom-0 top-[80px] z-10 ml-[5rem] mt-[200px] w-[320px] 2xl:w-[440px]'>
        <div className='mb-4 border-l px-4 py-2'>
          <div className='mb-1 font-bold'>On this page</div>
          <ul ref={listRef} className='relative max-h-[calc(100vh-200px)] overflow-y-auto pr-2 text-xs'>
            {toc.map((item) => {
              const isIntersecting = activeIdList.includes(item.link);
              return (
                <li
                  key={item.link}
                  data-link={item.link}
                  className={cn(
                    item.indent === 1 && 'ml-4',
                    item.indent >= 2 && 'ml-8',
                    isIntersecting && 'font-medium text-pink-600',
                    'py-0.5 transition'
                  )}
                >
                  <Link href={item.link}>{item.text}</Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className='flex gap-2'>
          <ScrollTop />
          <ScrollToComment />
          <CopyLinkButton />
        </div>
      </div>
    </aside>
  );
};

export default TableOfContent;
