import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css }) => ({
  markdownStyle: css`
    font-family: Poppins;
    h1,h2,h3,h4,h5,h6,strong{
      font-weight: 500;
      font-family: Poppins;
      margin: 16px auto;
    }
    p>strong{
      color: #000;
    }
    p{
      font-size: 16px;
      font-weight: 400;
      color: rgba(43, 51, 45, 0.6);
    }
    li{
      line-height: 160%;
    }
  `
}))
const ProblemsDescription = ({ mdFile }: { mdFile: string }) => {
  const { styles } = useStyles()
  return <Markdown
    className={styles.markdownStyle}
    children={mdFile}
    remarkPlugins={[remarkGfm]}
    components={{
      code(props) {
        const { children, className, node, ...rest } = props
        const match = /language-(\w+)/.exec(className || '')
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
        )
      },
    }}
  />
};

export default ProblemsDescription;
