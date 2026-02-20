'use client';

import { useSearch } from '@/components/search/SearchProvider';
import { SearchablePost } from '@/config/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const MAX_RESULTS = 8;

const searchPosts = (posts: SearchablePost[], query: string): SearchablePost[] => {
  const lowerQuery = query.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      post.desc.toLowerCase().includes(lowerQuery)
  );
};

export const SearchDialog = () => {
  const { posts, isOpen, setIsOpen } = useSearch();
  const [query, setQuery] = useState('');

  // Cmd+K / Ctrl+K 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // 다이얼로그 닫힐 때 검색어 초기화
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) setQuery('');
    },
    [setIsOpen]
  );

  const results = useMemo(() => {
    if (!query.trim()) return posts.slice(0, MAX_RESULTS);
    return searchPosts(posts, query.trim()).slice(0, MAX_RESULTS);
  }, [posts, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='top-[30%] translate-y-[-30%] gap-0 p-0 sm:max-w-xl [&>button:last-child]:hidden'>
        <DialogTitle className='sr-only'>Search posts</DialogTitle>
        {/* 검색 입력 */}
        <div className='flex items-center gap-3 border-b px-4 py-3'>
          <Search className='size-5 shrink-0 text-muted-foreground' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search posts...'
            className='flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground'
            autoFocus
          />
        </div>

        {/* 결과 리스트 */}
        <div className='max-h-[300px] overflow-y-auto px-2 py-2'>
          <div className='px-2 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            {hasQuery ? 'Results' : 'Recent Posts'}
          </div>
          {results.length > 0 ? (
            <ul>
              {results.map((post) => (
                <li key={post.url}>
                  <Link
                    href={post.url}
                    onClick={() => handleOpenChange(false)}
                    className={cn(
                      'flex flex-col gap-0.5 rounded-md px-3 py-2',
                      'transition-colors hover:bg-accent'
                    )}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-pink-600'>{post.categoryPublicName}</span>
                      {post.tags.length > 0 && (
                        <div className='flex gap-1.5'>
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className='text-[11px] text-muted-foreground'>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className='text-sm font-medium'>{post.title}</span>
                    {post.desc && (
                      <span className='line-clamp-1 text-xs text-muted-foreground'>
                        {post.desc}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className='px-3 py-6 text-center text-sm text-muted-foreground'>
              No results found.
            </div>
          )}
        </div>

        {/* 하단 안내 */}
        <div className='flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground'>
          <span>{hasQuery ? `${results.length} results` : 'Type to search...'}</span>
          <span>
            <kbd className='rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium'>
              ESC
            </kbd>{' '}
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
