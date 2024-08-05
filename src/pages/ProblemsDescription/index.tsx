import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ProblemsDescription = ({ mdFile }: { mdFile: string }) => {
  return <Markdown remarkPlugins={[remarkGfm]}>{mdFile}</Markdown>;
};

export default ProblemsDescription;
