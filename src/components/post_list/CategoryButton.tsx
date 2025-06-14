import Link from 'next/link';

import { Button } from '../ui/button';

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
          {displayName} ({count})
        </Link>
      </Button>
    </li>
  );
};
