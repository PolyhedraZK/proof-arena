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
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID: string;
  readonly VITE_BASE_URL: string;
}
