declare module '*.svg?r' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.ComponentProps<'svg'> & { title?: string }>;

  export default ReactComponent;
}

interface IResponse<T = any> {
  code: number;
  data: T;
  error_msg: string;
}

interface ImportMetaEnv {
  readonly VITE_APP_GISCUS_REPO_NAME: string;
  readonly VITE_APP_GISCUS_REPO_ID: string;
  readonly VITE_APP_GISCUS_CATEGORY: string;
  readonly VITE_APP_GISCUS_CATEGORY_ID: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_APP_GITHUB_TOKEN: string;
  readonly VITE_APP_OPENAI_API_KEY: string;
}
