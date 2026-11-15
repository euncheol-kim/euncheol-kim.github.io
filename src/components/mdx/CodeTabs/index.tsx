import { Children, ComponentProps, isValidElement, PropsWithChildren, ReactElement, ReactNode } from 'react';

import { CodeTabsClient } from './CodeTabsClient';

const LANGUAGE_NAMES: Record<string, string> = {
  java: 'Java',
  kotlin: 'Kotlin',
  python: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  bash: 'Bash',
  shell: 'Shell',
  cmd: 'CMD',
  toml: 'TOML',
  json: 'JSON',
  yaml: 'YAML',
};

// 언어가 아닌 블록(디렉터리 구조, 실행 결과 등)에는 탭을 붙이지 않는다
const PLAIN_LANGUAGES = ['text', 'plaintext', 'txt'];

const getLanguageName = (language: string) => LANGUAGE_NAMES[language] ?? language;

// rehype-pretty-code가 만든 figure > pre[data-language]에서 언어 이름을 찾는다
const findLanguage = (node: ReactNode): string | undefined => {
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (typeof props['data-language'] === 'string') return props['data-language'];
  for (const child of Children.toArray(props.children as ReactNode)) {
    const language = findLanguage(child);
    if (language) return language;
  }
  return undefined;
};

// 여러 언어의 코드 블록을 탭으로 묶는다. 자식은 코드 블록(```)만 둔다.
export const CodeTabs = ({ children }: PropsWithChildren) => {
  const blocks = Children.toArray(children).filter(isValidElement) as ReactElement<ComponentProps<'figure'>>[];
  const tabs = blocks.map((block, index) => {
    const language = findLanguage(block) ?? `code-${index + 1}`;
    return { id: language, label: getLanguageName(language) };
  });
  // 자식은 CodeFigure로 그려질 요소이므로, 탭이 겹치지 않도록 원래의 figure로 다시 그린다
  const panels = blocks.map((block, index) => <figure key={tabs[index].id} {...block.props} />);

  return <CodeTabsClient tabs={tabs} panels={panels} />;
};

// 단독 코드 블록. 언어가 하나여도 어떤 언어인지 탭으로 보여 준다.
export const CodeFigure = (props: ComponentProps<'figure'>) => {
  const isCodeBlock = 'data-rehype-pretty-code-figure' in props;
  const language = isCodeBlock ? findLanguage(props.children) : undefined;
  if (!language || PLAIN_LANGUAGES.includes(language)) return <figure {...props} />;

  return (
    <div className='code-tabs my-4 overflow-hidden rounded-md border border-border'>
      <div className='not-prose flex border-b border-border bg-muted/50 px-2'>
        <span className='-mb-px border-b-2 border-primary px-3 py-2 text-sm font-medium text-foreground'>
          {getLanguageName(language)}
        </span>
      </div>
      <figure {...props} />
    </div>
  );
};
