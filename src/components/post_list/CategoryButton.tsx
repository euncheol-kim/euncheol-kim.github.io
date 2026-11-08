import Link from 'next/link';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface Props {
  isCurrent: boolean;
  displayName: string;
  href: string;
  count: number;
  variant?: 'outline' | 'secondary';
}

export const CategoryButton = ({ isCurrent, displayName, href, count, variant = 'outline' }: Props) => {
  return (
    <li>
      <Button asChild size='xs' variant={isCurrent ? 'default' : variant}>
        {/* 카테고리 이동 시 맨 위로 스크롤되면 상단 추천 게시물이 클릭 위치로 올라와 잘못 눌리므로 스크롤을 유지한다 */}
        <Link href={href} scroll={false}>
          {displayName}{' '}
          <span
            className={cn('ml-1 text-xs', isCurrent ? 'text-background' : 'text-muted-foreground')}
          >
            ({count})
          </span>
        </Link>
      </Button>
    </li>
  );
};
