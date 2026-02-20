'use client';

import { SearchablePost } from '@/config/types';
import { createContext, useContext, useState } from 'react';

interface SearchContextValue {
  posts: SearchablePost[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextValue>({
  posts: [],
  isOpen: false,
  setIsOpen: () => {},
});

export const useSearch = () => useContext(SearchContext);

interface Props {
  posts: SearchablePost[];
  children: React.ReactNode;
}

export const SearchProviderClient = ({ posts, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SearchContext.Provider value={{ posts, isOpen, setIsOpen }}>
      {children}
    </SearchContext.Provider>
  );
};
