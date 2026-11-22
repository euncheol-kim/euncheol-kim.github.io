import { techIcons } from '@/config/tech-icons';

// 블로그의 지향점을 소개하는 글. 그래프 패널 맨 아래의 띠와, 띠를 누르면 올라오는 시트에 쓰인다.
// GitHub 프로필 소개처럼 프로필(사진·연락처), 항목별 목록, 기술 스택 배지 순으로 보인다.
export const blogIntro = {
  // 띠에 항상 보이는 이름과 한 문장. 문장이 길면 한 줄에서 잘린다.
  label: 'About me',
  summary: '프로젝트를 구현하며 치열하게 고민한 흔적들',
  greeting: '안녕하세요 👋',
  profileImage: '/profile.webp',
  email: 'kimeuncheol@kakao.com',
  github: 'https://github.com/euncheol-kim',
  // 항목 하나가 한 문단이다.
  about: [
    '프로젝트를 구현하며 치열하게 고민한 흔적을 글로 남깁니다.',
    '막히는 지점마다 멈춰서 기록합니다. 모르는 것을 모르는 채로 넘기지 않고, 여러 선택지를 견주어 보며 지금 상황에 가장 알맞은 방향을 찾으려 합니다.',
    'AI가 코드를 대신 써 주는 시대입니다. 그럴수록 무엇을 만들지, 왜 그렇게 만드는지 판단하는 힘이 개발자의 역량이라고 믿습니다.',
  ],
  // 항목은 굵은 이름(name)과 설명(desc)으로 이루어진다.
  sections: [
    {
      title: '✍️ 이런 글을 씁니다',
      items: [
        { name: '막힌 지점의 기록', desc: '프로젝트를 만들다 몰랐던 것과 그것을 이해해 간 과정' },
        { name: '설계 결정과 이유', desc: '무엇을 골랐는지보다 왜 그렇게 골랐는지' },
        { name: '개념 정리', desc: '특정 기술에 묶이지 않도록 원리부터 다시 이해한 내용' },
        { name: '다시 꺼내 볼 요약', desc: '자주 찾아보는 내용을 한곳에 모은 정리' },
      ],
    },
    {
      title: '🔭 요즘 관심사',
      items: [
        { name: '애플리케이션 설계', desc: 'Bounded Context, 이벤트 기반 아키텍처처럼 구조와 경계를 정하는 일' },
        { name: '데이터베이스 설계', desc: 'MSA의 데이터베이스 소유권처럼 데이터의 주인을 정하는 일' },
        { name: 'Code Slop 줄이기', desc: 'AI가 쉽게 만들어 내는 불필요한 코드를 덜어 내는 방법' },
      ],
    },
  ],
  stackTitle: '🛠 Tech Stack',
  stacks: [
    { title: 'Language', icons: [techIcons.java, techIcons.kotlin, techIcons.python, techIcons.javascript] },
    {
      title: 'Backend',
      icons: [techIcons.springBoot, techIcons.jpa, techIcons.gradle, techIcons.fastApi, techIcons.sqlAlchemy],
    },
    { title: 'Frontend', icons: [techIcons.react, techIcons.css] },
  ],
};
