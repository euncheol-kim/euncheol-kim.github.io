import IconGithub from '@/components/icon/Github';
import IconLinkedin from '@/components/icon/LinkedIn';

export const RESUME_DATA_EN = {
  name: 'Doh Kim',
  initials: 'DH',
  location: 'Seoul, South Korea, KST',
  locationLink: 'https://www.google.com/maps/place/seoul',
  about: 'Detail-oriented Front-end Developer',
  summary:
    'I believe that web development is the most powerful means to quickly bring ideas to life as services.\nWith a mindset of creating a work of art, I pay attention to detail and simplicity.\nI am diligently studying JavaScript, which is used across various platforms.',
  avatarUrl: 'https://avatars.githubusercontent.com/u/40906871?v=4',
  contact: {
    email: 'ehgud456456@naver.com',
    social: [
      {
        name: 'GitHub',
        url: 'https://github.com/d5br5',
        icon: IconGithub,
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/dohkim777/',
        icon: IconLinkedin,
      },
    ],
  },
  education: [
    {
      school: 'Seoul National University',
      degree: "Bachelor's Degree in Mechanical Engineering and Business Administration",
      start: '2015',
      end: '2022',
    },
  ],
  work: [
    {
      company: 'Toss Bank',
      link: 'https://www.tossbank.com/',
      title: 'Front-end Desktop Developer',
      start: '2025. 07.',
      end: null,
      description: 'The third internet-only bank in South Korea, established by Toss (Viva Republica)',
      points: ['Expected to join in July 2025'],
    },
    {
      company: 'Adena Software',
      link: 'https://www.adenasoft.com/',
      title: 'Web Front-end Developer',
      start: '2023. 03.',
      end: '2025. 07.',
      description:
        'A B2B forex/payment fintech company operating a white-label cryptocurrency exchange',
      points: [
        'Development of cryptocurrency spot, futures exchanges, and admin pages.',
        'Implementation of dark/light mode and design system.',
        'Improvement of trading chart usability and code structure.',
        'Integration of third-party payment services and fee calculation logic.',
        'Search Engine Optimization (SEO)',
        'Visualization of trading and user statistics.',
      ],
    },
    {
      company: 'Tmax Fintech',
      link: 'https://www.tmax.co.kr/tmaxfintech',
      title: 'Web Front-end Developer',
      start: '2022. 02.',
      end: '2023. 02.',
      description:
        'A Fintech B2B/C BaaS specialized company providing core banking and robo-advisors',
      points: [
        'Frontend development of asset allocation and trading simulator.',
        'Code migration from Vue.js to React.js.',
        'Optimization of frontend rendering performance.',
        'Organization of git commit and branch rules.', 
      ],
    },
  ],
  skills: ['Javascript', 'Typescript', 'React.js', 'Next.js'],
} as const;

export type RESUME = typeof RESUME_DATA_EN;
