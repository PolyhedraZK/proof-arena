import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router';
import remarkGfm from 'remark-gfm';

// static load
// import { markdown } from '../../../docs/sha256_hash_details.md'
import { useStyles } from './index.style.ts';


const ProblemsDescription = () => {

  const { styles } = useStyles();
  const { mdFile } = useParams();
  const [content, setContent] = useState('');
  console.log(`base_url: ${import.meta.env.VITE_APP_BASE_URL}`);
  console.log(`loading file: docs/${mdFile}`);
  useEffect(() => {
    fetch(`/docs/${mdFile}`)
      .then((res) => res.text())
      .then((text) => { setContent(text); })
      .catch(error => {
        console.log(error);
      });
  }, [mdFile]);

  return (
    <div className={styles.ProblemsDescriptionBox}>
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};

export default ProblemsDescription;