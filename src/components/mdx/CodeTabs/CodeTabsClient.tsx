'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  panels: ReactNode[];
}

const STORAGE_KEY = 'code-tabs-language';
const CHANGE_EVENT = 'code-tabs-language-change';

const readStoredLanguage = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const CodeTabsClient = ({ tabs, panels }: Props) => {
  const [selected, setSelected] = useState(tabs[0]?.id);
  const containerRef = useRef<HTMLDivElement>(null);

  // 한 곳에서 언어를 고르면 같은 화면의 다른 코드 탭과 다음 방문에도 같은 언어가 선택된다
  useEffect(() => {
    const apply = (language: string | null) => {
      if (language && tabs.some((tab) => tab.id === language)) setSelected(language);
    };
    apply(readStoredLanguage());

    const onChange = (event: Event) => apply((event as CustomEvent<string>).detail);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [tabs]);

  const select = (language: string) => {
    // 언어를 바꾸면 위쪽에 있는 다른 코드 탭들의 높이도 함께 바뀐다.
    // 누른 탭이 화면에서 제자리에 있도록, 바뀐 높이만큼 스크롤을 맞춘다.
    const container = containerRef.current;
    const topBefore = container?.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      if (!container || topBefore === undefined) return;
      const moved = container.getBoundingClientRect().top - topBefore;
      if (moved !== 0) window.scrollBy({ top: moved, behavior: 'instant' });
    });

    setSelected(language);
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // 저장소를 쓸 수 없어도 현재 화면의 탭 전환은 동작한다
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: language }));
  };

  return (
    <div ref={containerRef} className='code-tabs my-4 overflow-hidden rounded-md border border-border'>
      <div role='tablist' className='not-prose flex gap-1 overflow-x-auto border-b border-border bg-muted/50 px-2'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type='button'
            role='tab'
            aria-selected={tab.id === selected}
            onClick={() => select(tab.id)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab.id === selected
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div key={tabs[index].id} role='tabpanel' hidden={tabs[index].id !== selected}>
          {panel}
        </div>
      ))}
    </div>
  );
};
