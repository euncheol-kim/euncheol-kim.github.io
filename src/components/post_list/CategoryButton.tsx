import Link from 'next/link';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface Props {
  isCurrent: boolean;
  displayName: string;
  href: string;
  count: number;
}

export const CategoryButton = ({ isCurrent, displayName, href, count }: Props) => {
  return (
    <li>
      <Button asChild size='xs' variant={isCurrent ? 'default' : 'outline'}>
        <Link href={href}>
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
