'use client';

import { useRouter } from 'next/navigation';

import { CategoryButton } from './CategoryButton';
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
  // 설정된 줄 번호대로 상위 카테고리를 줄 단위로 묶는다 (첫 줄은 All, 추천과 함께 노출)
  const categoryRows = categoryGroupList.reduce<CategoryGroupDetail[][]>((rows, group) => {
    while (rows.length <= group.row) rows.push([]);
    rows[group.row].push(group);
    return rows;
  }, [[]]);
  const selectValue = currentGroup ? `${GROUP_VALUE_PREFIX}${currentGroup}` : currentCategory;

  const onCategoryChange = (value: string) => {
    if (value === 'all') {
      router.push('/blog', { scroll: false });
    } else if (value === 'hot') {
      router.push('/blog/hot', { scroll: false });
    } else if (value.startsWith(GROUP_VALUE_PREFIX)) {
      router.push(`/blog/group/${value.replace(GROUP_VALUE_PREFIX, '')}`, { scroll: false });
    } else {
      router.push(`/blog/${value}`, { scroll: false });
    }
  };

  return (
    <>
      <section className='hidden flex-1 grid-cols-[auto_1fr] items-start gap-x-3 gap-y-4 sm:grid'>
        <h2 className='py-1 text-base'>Category</h2>
        <div className='flex flex-col gap-2'>
          {categoryRows.map((row, rowIndex) => (
            <ul key={rowIndex} className='flex flex-wrap gap-2'>
              {rowIndex === 0 && (
                <>
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
                </>
              )}
              {row.map((group) => (
                <CategoryButton
                  key={group.id}
                  href={`/blog/group/${group.id}`}
                  displayName={group.name}
                  isCurrent={group.id === activeGroup?.id}
                  count={group.count}
                />
              ))}
            </ul>
          ))}
        </div>
        {activeGroup && activeGroup.children.length > 0 && (
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
        {/* 모바일은 네이티브 select를 사용한다.
            커스텀 드롭다운은 목록이 상단 추천 게시물 위를 덮고, 터치로 항목을 고르면
            닫힌 직후의 click 이벤트가 아래 게시글 링크로 전달되어 잘못 이동하는 문제가 있었다. */}
        <select
          value={selectValue}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label='카테고리 선택'
          className='h-9 w-[240px] rounded-md border border-input bg-card px-3 text-sm font-medium'
        >
          <option value='all'>All ({allPostCount})</option>
          <option value='hot'>🔥추천 ({hotPostCount})</option>
          {categoryGroupList.map((group) => (
            <optgroup key={group.id} label={group.name}>
              <option value={`${GROUP_VALUE_PREFIX}${group.id}`}>
                {group.name} 전체 ({group.count})
              </option>
              {group.children.map((cg) => (
                <option key={cg.dirName} value={cg.dirName}>
                  {cg.publicName} ({cg.count})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </section>
    </>
  );
};

export default CategoryList;
