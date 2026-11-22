import Image from 'next/image';

import { blogIntro } from '@/config/intro';
import { TechIcon } from '@/config/tech-icons';
import { cn } from '@/lib/utils';
import { ChevronUp, Github, Mail } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const contactClass =
  'flex w-fit items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground';
const sectionTitleClass = 'mb-2.5 border-b pb-1.5 text-[15px] font-bold dark:border-slate-700';

// 배경이 밝은 색(JavaScript의 노랑 등)이면 글자를 어둡게 한다.
const isLightColor = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
};

// GitHub 프로필에서 흔히 쓰는 배지 모양 : 브랜드 색 바탕에 로고와 이름.
const TechBadge = ({ icon }: { icon: TechIcon }) => (
  <li
    style={{ backgroundColor: icon.color }}
    className={cn(
      'flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-bold',
      isLightColor(icon.color) ? 'text-black' : 'text-white'
    )}
  >
    <svg viewBox='0 0 24 24' aria-hidden className='size-3.5 fill-current'>
      <path d={icon.path} />
    </svg>
    {icon.label}
  </li>
);

// 그래프 패널 맨 아래에 깔리는 블로그 소개. 평소에는 한 문장짜리 띠만 보이고,
// 띠를 누르면 본문이 아래에서 올라온다. 띠의 높이(h-10)만큼 패널 쪽에서 아래를 비워 둔다.
export const BlogIntro = ({ isOpen, onToggle }: Props) => (
  <>
    {/* 올라온 동안 그래프를 살짝 가리고, 바깥을 누르면 다시 내려가게 한다. */}
    <div
      onClick={onToggle}
      className={cn(
        'absolute inset-0 z-10 bg-black/20 transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    />
    <section
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 flex h-[61.8%] flex-col border-t bg-card transition-[transform,box-shadow,border-radius] duration-300 dark:border-slate-700',
        isOpen ? 'translate-y-0 rounded-t-xl shadow-[0_-8px_24px_rgba(0,0,0,0.15)]' : 'translate-y-[calc(100%-2.5rem)]'
      )}
    >
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={isOpen}
        className='group flex h-10 w-full shrink-0 items-center gap-2.5 px-4 text-left'
      >
        <span className='shrink-0 text-[13px] font-bold text-pink-600 dark:text-pink-400'>{blogIntro.label}</span>
        <span className='min-w-0 flex-1 truncate text-[13px] font-medium text-muted-foreground transition-colors group-hover:text-foreground'>
          {blogIntro.summary}
        </span>
        <ChevronUp
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-foreground',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div aria-hidden={!isOpen} className='min-h-0 space-y-7 overflow-y-auto px-5 pb-8 pt-3'>
        <div>
          <div className='flex items-center gap-4'>
            <Image
              src={blogIntro.profileImage}
              alt='프로필 사진'
              width={80}
              height={80}
              className='size-20 shrink-0 rounded-full border bg-white dark:border-slate-700'
            />
            <div className='min-w-0'>
              <h2 className='text-xl font-bold'>{blogIntro.greeting}</h2>
              <div className='mt-2 space-y-1'>
                <a href={`mailto:${blogIntro.email}`} className={contactClass}>
                  <Mail className='size-3.5 shrink-0' />
                  <span className='truncate'>{blogIntro.email}</span>
                </a>
                <a href={blogIntro.github} target='_blank' rel='noreferrer' className={contactClass}>
                  <Github className='size-3.5 shrink-0' />
                  <span className='truncate'>{blogIntro.github.replace('https://', '')}</span>
                </a>
              </div>
            </div>
          </div>
          <div className='mt-5 space-y-5 break-keep text-sm leading-relaxed'>
            {blogIntro.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div>
          <h3 className={sectionTitleClass}>{blogIntro.stackTitle}</h3>
          <div className='space-y-3'>
            {blogIntro.stacks.map((stack) => (
              <div key={stack.title}>
                <div className='mb-1.5 text-xs font-semibold text-muted-foreground'>{stack.title}</div>
                <ul className='flex flex-wrap gap-1.5'>
                  {stack.icons.map((icon) => (
                    <TechBadge key={icon.label} icon={icon} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {blogIntro.sections.map((section) => (
          <div key={section.title}>
            <h3 className={sectionTitleClass}>{section.title}</h3>
            <ul className='space-y-2'>
              {section.items.map((item) => (
                <li key={item.name} className='flex gap-2 text-sm leading-relaxed'>
                  <span className='mt-[9px] size-1 shrink-0 rounded-full bg-pink-600 dark:bg-pink-400' />
                  <span>
                    <strong className='font-bold'>{item.name}</strong>
                    <span className='text-muted-foreground'> — {item.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </>
);
