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
