import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css }) => ({
  markdownStyle: css`
    .hljs {
      display: block;
      overflow-x: auto;
      padding: 16px;
      color: #333;
      background: #f6f8fa;
      border-radius: 0px;
    }

    .hljs-comment,
    .hljs-quote {
      color: #998;
      font-style: italic;
    }

    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-subst {
      color: #333;
      font-weight: bold;
    }

    .hljs-number,
    .hljs-literal,
    .hljs-variable,
    .hljs-template-variable,
    .hljs-tag .hljs-attr {
      color: #008080;
    }

    .hljs-string,
    .hljs-doctag {
      color: #d14;
    }

    .hljs-title,
    .hljs-section,
    .hljs-selector-id {
      color: #900;
      font-weight: bold;
    }

    .hljs-subst {
      font-weight: normal;
    }

    .hljs-type,
    .hljs-class .hljs-title {
      color: #458;
      font-weight: bold;
    }

    .hljs-tag,
    .hljs-name,
    .hljs-attribute {
      color: #000080;
      font-weight: normal;
    }

    .hljs-regexp,
    .hljs-link {
      color: #009926;
    }

    .hljs-symbol,
    .hljs-bullet {
      color: #990073;
    }

    .hljs-built_in,
    .hljs-builtin-name {
      color: #0086b3;
    }

    .hljs-meta {
      color: #999;
      font-weight: bold;
    }

    .hljs-deletion {
      background: #fdd;
    }

    .hljs-addition {
      background: #dfd;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: bold;
    }
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
    code {
      word-break: break-all;
      padding: 0.2em 0.4em;
      background-color: #afb8c133;
      border-radius: 6px;
    }
    pre {
      overflow: hidden;
      overflow-x: auto;
    }
  `,
}));
