'use client';

import { PropsWithChildren } from 'react';

import { LinkProps } from 'next/link';

export const ExternalLink = ({ children, href, ...props }: PropsWithChildren<LinkProps>) => {
  const hrefStr = href.toString() || '';
  const isAnchor = hrefStr.startsWith('#');

  if (isAnchor) {
    return (
      <a
        {...props}
        href={hrefStr}
        onClick={(e) => {
          e.preventDefault();
          const id = hrefStr.slice(1);
          const el = document.getElementById(id);
          if (el) {
            const headerOffset = 120;
            const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }}
        className='break-words text-pink-600 no-underline underline-offset-4 hover:underline'
      >
        {children}
      </a>
    );
  }

  return (
    <a
      {...props}
      target='_blank'
      href={hrefStr}
      className='break-words text-pink-600 no-underline underline-offset-4 hover:underline'
    >
      {children}
    </a>
  );
};
