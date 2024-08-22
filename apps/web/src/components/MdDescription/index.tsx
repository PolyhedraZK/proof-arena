import 'katex/dist/katex.min.css';

import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { useStyles } from './index.style';

const ProblemsDescription = ({ mdFile }: { mdFile: string }) => {
  const { styles } = useStyles();
  return (
    <Markdown
      className={styles.markdownStyle}
      children={mdFile}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
    />
  );
};

export default ProblemsDescription;
