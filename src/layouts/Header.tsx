'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import LanguageSelector from '@/components/about/language-selector';
import ScrollProgressBar from '@/components/common/ScrollProgressBar';
import { Button } from '@/components/ui/button';
import { useSpyElem } from '@/hook/useSpy';
import ThemeSwitch from '@/layouts/theme/Switch';
import { cn } from '@/lib/utils';
import { useSearch } from '@/components/search/SearchProvider';
import { Github, Search } from 'lucide-react';

const navList = [
  { name: 'euncheol-kim', href: '/blog' },
  { name: 'About', href: '/about' },
];

const localePathList = ['/about'];

export const Header = () => {
  const { ref, marginTop } = useSpyElem(65);
  const pathname = usePathname();
  const isLocalePath = localePathList.some((path) => pathname.startsWith(path));
  const { setIsOpen } = useSearch();

  return (
    <nav
      style={{ marginTop }}
      ref={ref}
      className='fixed z-40 flex w-full flex-col items-center justify-center border-b bg-background shadow-sm print:hidden'
    >
      <div className='mt-1 flex h-[40px] w-full max-w-[1200px] items-center justify-between px-4 max-sm:pb-1 sm:h-[64px]'>
        <div className='flex items-center font-medium'>
          {navList.map((navItem) => (
            <Link
              href={navItem.href}
              key={navItem.name}
              className={cn(
                'rounded-full px-4 py-1 text-center text-sm transition-colors hover:text-primary',
                pathname?.startsWith(navItem.href)
                  ? 'bg-muted font-medium text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {navItem.name}
            </Link>
          ))}
        </div>

        {/*About Page의 언어 선택기 숨김*/}
        {/* {isLocalePath && <LanguageSelector className='hidden sm:flex' />} */}

        <div className='flex items-center gap-1 sm:gap-3'>
          <Button
            variant='ghost'
            onClick={() => setIsOpen(true)}
            className='flex items-center gap-1.5 px-2 text-muted-foreground hover:text-primary sm:px-3'
          >
            <Search className='size-[1.1rem]' />
            <span className='hidden text-sm sm:inline'>Search</span>
          </Button>
          <ThemeSwitch />
          <Button asChild variant='ghost' size='icon'>
            <Link href='https://github.com/euncheol-kim' target='_blank'>
              <Github className='size-[1.2rem]' />
            </Link>
          </Button>
        </div>
      </div>
      <ScrollProgressBar />
    </nav>
  );
};
