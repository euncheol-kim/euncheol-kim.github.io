'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    // 기본은 다크 모드다. 기본값을 바꾸기 전에 저장된 선택은 따르지 않도록 저장 키를 새로 쓴다.
    <NextThemesProvider attribute='class' defaultTheme='dark' storageKey='theme-v2' {...props}>
      {children}
    </NextThemesProvider>
  );
}
