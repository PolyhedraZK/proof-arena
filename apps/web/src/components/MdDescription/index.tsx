import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

import { useStyles } from './index.style';

const ProblemsDescription = ({ mdFile }: { mdFile: string }) => {
  const { styles } = useStyles();
  return (
    <Markdown
      className={styles.markdownStyle}
      children={mdFile}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    />
  );
};

export default ProblemsDescription;
