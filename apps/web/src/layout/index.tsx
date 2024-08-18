import React from 'react';
import { Layout as AntLayout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { createStyles } from 'antd-style';

const { Content } = AntLayout;

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    min-height: 100vh;
  `,
  content: css`
    padding-top: 88px;  // 根据你的 Header 高度调整
    @media (max-width: ${token.screenSM}px) {
      padding-top: 72px;  // 移动设备上的 Header 高度
    }
  `,
  homeContent: css`
    padding-top: 0;
  `
}));

const Layout: React.FC = () => {
  const { styles, cx } = useStyles();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <AntLayout className={styles.layout}>
      <Header />
      <Content className={cx(styles.content, isHomePage && styles.homeContent)}>
        <Outlet />
      </Content>
      <Footer />
    </AntLayout>
  );
};

export default Layout;