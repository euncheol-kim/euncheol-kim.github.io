'use client';

import { useRouter } from 'next/navigation';

import { CategoryButton } from './CategoryButton';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryGroupDetail } from '@/config/types';

interface CategoryListProps {
  categoryGroupList: CategoryGroupDetail[];
  allPostCount: number;
  hotPostCount: number;
  currentCategory?: string;
  currentGroup?: string;
}

const GROUP_VALUE_PREFIX = 'group:';

const CategoryList = ({
  categoryGroupList,
  allPostCount,
  hotPostCount,
  currentCategory = 'all',
  currentGroup,
}: CategoryListProps) => {
  const router = useRouter();

  // 하위 카테고리 페이지에서도 소속된 상위 카테고리가 펼쳐지도록 처리
  const activeGroup = categoryGroupList.find((group) =>
    currentGroup
      ? group.id === currentGroup
      : group.children.some((cg) => cg.dirName === currentCategory)
  );
  const selectValue = currentGroup ? `${GROUP_VALUE_PREFIX}${currentGroup}` : currentCategory;

  const onCategoryChange = (value: string) => {
    if (value === 'all') {
      router.push('/blog');
    } else if (value.startsWith(GROUP_VALUE_PREFIX)) {
      router.push(`/blog/group/${value.replace(GROUP_VALUE_PREFIX, '')}`);
    } else {
      router.push(`/blog/${value}`);
    }
  };

  return (
    <>
      <section className='hidden flex-1 grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 sm:grid'>
        <h2 className='py-1 text-base'>Category</h2>
        <ul className='flex flex-wrap gap-2'>
          <CategoryButton
            href='/blog'
            isCurrent={currentCategory === 'all' && !currentGroup}
            displayName='All'
            count={allPostCount}
          />
          <CategoryButton
            href='/blog/hot'
            isCurrent={currentCategory === 'hot'}
            displayName='🔥추천'
            count={hotPostCount}
          />
          {categoryGroupList.map((group) => (
            <CategoryButton
              key={group.id}
              href={`/blog/group/${group.id}`}
              displayName={group.name}
              isCurrent={group.id === activeGroup?.id}
              count={group.count}
            />
          ))}
        </ul>
        {activeGroup && (
          <>
            <h3 className='py-1 text-base'>Sub Category</h3>
            <ul className='flex flex-wrap gap-2'>
              {activeGroup.children.map((cg) => (
                <CategoryButton
                  key={cg.dirName}
                  href={`/blog/${cg.dirName}`}
                  displayName={cg.publicName}
                  isCurrent={currentCategory === cg.dirName}
                  count={cg.count}
                  variant='secondary'
                />
              ))}
            </ul>
          </>
        )}
      </section>
      <section className='sm:hidden'>
        <Select onValueChange={onCategoryChange} defaultValue={selectValue}>
          <SelectTrigger className='h-auto w-[220px] py-1.5 text-sm'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all' className='text-sm sm:text-base'>
              All ({allPostCount})
            </SelectItem>
            {categoryGroupList.map((group) => (
              <SelectGroup key={group.id}>
                <SelectLabel className='text-xs text-muted-foreground'>{group.name}</SelectLabel>
                <SelectItem value={`${GROUP_VALUE_PREFIX}${group.id}`} className='text-sm'>
                  {group.name} 전체 ({group.count})
                </SelectItem>
                {group.children.map((cg) => (
                  <SelectItem key={cg.dirName} value={cg.dirName} className='pl-12 text-sm'>
                    {cg.publicName} ({cg.count})
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </section>
    </>
  );
};

export default CategoryList;
