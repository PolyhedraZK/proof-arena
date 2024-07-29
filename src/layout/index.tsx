import { Layout } from 'antd';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import Header from './Header';
import useStyles from './layout.style';

function ProofLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { styles } = useStyles();

  // 监听路由变化的时候
  useEffect(() => {
    if (location.pathname === '/') {
      return navigate('/problems', { replace: true });
    }
  }, [location]);

  return (
    <Layout className={styles.layout}>
      <Header />
      <Outlet />
    </Layout>
  );
}
export default ProofLayout;
