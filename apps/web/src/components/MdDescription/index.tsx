import { createStyles } from 'antd-style';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';

const useStyles = createStyles(({ css }) => ({
  markdownStyle: css`
    font-family: Poppins;
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    strong {
      font-weight: 500;
      font-family: Poppins;
      margin: 16px auto;
    }
    p > strong {
      color: #000;
    }
    p {
      font-size: 16px;
      font-weight: 400;
      color: rgba(43, 51, 45, 0.6);
    }
    li {
      line-height: 160%;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    code {
      word-break: break-all;
      padding: 0.2em 0.4em;
      background-color: #afb8c133;
      border-radius: 6px;
      // font-size: 85%;
    }
    pre {
      overflow: hidden;
      overflow-x: auto;
    }
    pre code {
      background: none;
      display: block;
    }
  `,
}));
const ProblemsDescription = ({ mdFile }: { mdFile: string }) => {
  const { styles } = useStyles();
  return (
    <Markdown
      className={styles.markdownStyle}
      children={mdFile}
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <SyntaxHighlighter
              {...rest}
              PreTag="div"
              children={String(children).replace(/\n$/, '')}
              language={match[1]}
              style={github}
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    />
  );
};

export default ProblemsDescription;
