import { notFound, redirect } from 'next/navigation';

import { getCategoryList, getCategoryUrl } from '@/lib/post';

type Props = {
  params: { category: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategoryList().map(({ category }) => ({ category }));
}

// 예전 주소(/blog/{category})로 들어오면 새 주소로 보낸다
const LegacyCategoryPage = ({ params }: Props) => {
  const matched = getCategoryList().find(({ category }) => category === params.category);
  if (!matched) notFound();
  redirect(getCategoryUrl(matched.group, matched.category));
};

export default LegacyCategoryPage;
