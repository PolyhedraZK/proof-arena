import './global.css';

import { StyleProvider } from '@ant-design/cssinjs';
import NiceModal from '@ebay/nice-modal-react';
import { App, ConfigProvider } from 'antd';
import { ThemeProvider } from 'antd-style';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';

import MyApp from './App.tsx';
import theme from './theme';

//@ts-ignore
window.__build_version = __buildVersion;
// const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider appearance={'light'} theme={theme} prefixCls="proof">
      {/* <ConfigProvider prefixCls="proof"> */}
      <StyleProvider layer>
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
          }}
        >
          <App>
            <NiceModal.Provider>
              <MyApp />
            </NiceModal.Provider>
          </App>
        </SWRConfig>
      </StyleProvider>
      {/* </ConfigProvider> */}
    </ThemeProvider>
  </React.StrictMode>
);
