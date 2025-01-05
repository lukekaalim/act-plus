import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkDirective from 'remark-directive';

import { useMemo } from '@lukekaalim/act';

export const parser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkMdx)

export const useRemarkParser = (markdownText: string) => {
  return useMemo(() => {
    return parser.parse(markdownText)
  }, [markdownText]);
};