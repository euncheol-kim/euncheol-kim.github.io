import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        pretendard: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        informative: {
          DEFAULT: 'var(--informative)',
          foreground: 'var(--informative-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            // 본문 가독성: 행간·자간, 한글 줄바꿈(단어 단위)
            // (lifeary 인상에 맞춰 행간은 촘촘히, 자간은 타이트하게)
            lineHeight: '1.65',
            letterSpacing: '-0.02em',
            wordBreak: 'keep-all',

            'h1, h2, h3, h4': {
              letterSpacing: '-0.02em',
              lineHeight: '1.35',
            },
            'h2, h3, h4': {
              scrollMarginTop: '5rem',
            },
            // 헤딩 위 여백은 넉넉히(섹션 구분), 아래는 좁게(본문과 결속)
            h2: {
              marginTop: '3rem',
              marginBottom: '1rem',
            },
            h3: {
              marginTop: '2.25rem',
              marginBottom: '0.75rem',
            },
            h4: {
              marginTop: '1.75rem',
              marginBottom: '0.5rem',
            },
            p: {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              lineHeight: '1.65',
              overflowWrap: 'break-word',
            },
            'ul, ol': {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
            },
            // 리드인 문단 바로 뒤에 오는 목록은 간격을 좁혀 결속
            // (예: "아래와 같은 …" 문장 + 목록)
            'p:has(+ ul), p:has(+ ol)': {
              marginBottom: '0.5rem',
            },
            'p + ul, p + ol': {
              marginTop: '0.5rem',
            },
            li: {
              marginTop: '0.375rem',
              marginBottom: '0.375rem',
            },
            // 코드는 자간·줄바꿈 원복 (등폭 폰트 보존)
            'code, kbd, pre, samp': {
              letterSpacing: 'normal',
              wordBreak: 'normal',
            },
            '.callout-contents > p': {
              margin: 0,
            },

            code: {
              counterReset: 'line',
            },

            // Inline code only
            // 글자색은 본문과 같은 톤으로 두고, 연한 배경과 등폭 글꼴로만 구분한다.
            // (채도 높은 빨간 글자는 한 문단에 여러 번 나오면 읽기 흐름을 끊고 눈을 피로하게 한다)
            ':not(pre) > code': {
              fontWeight: 500,
              fontSize: '0.9em',
              margin: '0 2px',
              color: '#1e293b',
              backgroundColor: 'rgba(100,116,139,0.12)',
              fontFamily:
                '"SFMono-Regular", Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
              borderRadius: 4,
              padding: '0.15em 0.4em',
              overflowWrap: 'break-word',
            },

            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },

            'code[data-line-numbers] > [data-line]::before': {
              counterIncrement: 'line',
              content: 'counter(line)',

              /* Other styling */
              display: 'inline-block',
              width: '1rem',
              marginRight: '1.4rem',
              textAlign: 'right',
              color: 'lightgrey',
              fontSize: '0.75rem',
            },

            'code[data-line-numbers-max-digits="2"] > [data-line]::before': {
              width: '1rem',
            },

            'code[data-line-numbers-max-digits="3"] > [data-line]::before': {
              width: '2rem',
            },

            pre: {
              paddingRight: 0,
              paddingLeft: 0,
              color: 'var(--shiki-light)',
              backgroundColor: 'var(--shiki-light-bg)',
              border: '1px solid #e5e7eb',
            },

            '.dark pre': {
              backgroundColor: 'var(--shiki-dark-bg)',
              color: 'var(--shiki-dark)',
              border: '1px solid #374151',
            },

            'pre > code > span': {
              paddingLeft: '1.1rem',
              paddingRight: '1rem',
            },

            'pre code span': {
              color: 'var(--shiki-light)',
            },
            '.dark pre code span': {
              color: 'var(--shiki-dark)',
            },

            '[data-highlighted-line]': {
              backgroundColor: 'rgba(253, 224, 71, 0.2)',
            },

            '.project img': {
              marginTop: '0px !important',
            },

            '.project p,ul,li': {
              fontSize: 15,
            },

            u: {
              textUnderlineOffset: '4px',
              textDecorationThickness: 1,
              fontWeight: 600,
            },
          },
        },
      },
      // 그래프 패널 폭. 화면의 38.2%(황금비의 작은 쪽)로 잡되 440~640px 사이로 제한한다.
      // graph-handle은 손잡이가 차지하는 폭, graph-open은 패널이 열렸을 때 본문이 비켜나는 폭이다.
      spacing: {
        graph: 'clamp(440px, 38.2vw, 640px)',
        'graph-handle': '2.75rem',
        'graph-open': 'calc(clamp(440px, 38.2vw, 640px) + 2.75rem)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    // 그래프 패널이 열려 있을 때/접혀 있을 때만 적용되는 variant. 패널은 lg부터 보이므로 같은 조건을 건다.
    plugin(({ addVariant }) => {
      addVariant('graph-open', '@media (min-width: 1024px) { :root[data-graph=open] & }');
      addVariant('graph-closed', '@media (min-width: 1024px) { :root[data-graph=closed] & }');
    }),
  ],
} satisfies Config;

export default config;
