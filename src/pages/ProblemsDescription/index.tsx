import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ProblemsDescription = ({ mdFile }: { mdFile: string }) => {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch(`/docs/${mdFile}`)
      .then(res => res.text())
      .then(text => {
        setContent(text);
      })
      .catch(error => {
        console.log(error);
      });
  }, [mdFile]);

  return <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>;
};

export default ProblemsDescription;
