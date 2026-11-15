import { Callout } from './Callout';
import { CodeFigure, CodeTabs } from './CodeTabs';
import { Image } from './Image';
import { ExternalLink } from './Link';
import { MDXComponents } from 'mdx/types';

export const MdxComponents: MDXComponents = {
  a: ExternalLink as any,
  img: Image as any,
  blockquote: Callout,
  figure: CodeFigure as any,
  Callout,
  CodeTabs,
};
