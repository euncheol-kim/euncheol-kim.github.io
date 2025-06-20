'use client';

import { useRouter } from 'next/navigation';

import { CategoryButton } from './CategoryButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryDetail } from '@/config/types';

interface CategoryListProps {
  categoryList: CategoryDetail[];
  allPostCount: number;
  hotPostCount: number;
  currentCategory?: string;
}

const CategoryList = ({
  categoryList,
  allPostCount,
  hotPostCount,
  currentCategory = 'all',
}: CategoryListProps) => {
  const router = useRouter();

  const onCategoryChange = (value: string) => {
    if (value === 'all') {
      router.push('/blog');
    } else {
      router.push(`/blog/${value}`);
    }
  };

  return (
    <>
      <section className='hidden sm:block'>
        <ul className='flex flex-wrap gap-2'>
          <CategoryButton
            href='/blog'
            isCurrent={currentCategory === 'all'}
            displayName='All'
            count={allPostCount}
          />
          <CategoryButton
            href='/blog/hot'
            isCurrent={currentCategory === 'hot'}
            displayName='🔥추천'
            count={hotPostCount}
          />
          {categoryList.map((cg) => (
            <CategoryButton
              key={cg.dirName}
              href={`/blog/${cg.dirName}`}
              displayName={cg.publicName}
              isCurrent={currentCategory === cg.dirName}
              count={cg.count}
            />
          ))}
        </ul>
      </section>
      <section className='sm:hidden'>
        <Select onValueChange={onCategoryChange} defaultValue={currentCategory}>
          <SelectTrigger className='h-auto w-[180px] py-1.5 text-sm'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all' className='text-sm sm:text-base'>
              All ({allPostCount})
            </SelectItem>
            {categoryList.map((cg) => (
              <SelectItem key={cg.dirName} value={cg.dirName} className='text-sm sm:text-base'>
                {cg.publicName} ({cg.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </>
  );
};

export default CategoryList;
