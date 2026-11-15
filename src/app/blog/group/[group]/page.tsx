import { redirect } from 'next/navigation';

import { getCategoryGroupList, getGroupUrl } from '@/lib/post';

type Props = {
  params: { group: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategoryGroupList().map((group) => ({ group }));
}

// 예전 주소(/blog/group/{group})로 들어오면 새 주소로 보낸다
const LegacyGroupPage = ({ params: { group } }: Props) => redirect(getGroupUrl(group));

export default LegacyGroupPage;
