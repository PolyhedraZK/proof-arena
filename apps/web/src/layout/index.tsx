import { Layout } from 'antd';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import Footer from './Footer';
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
    <div className={styles.layout}>
      <Layout className={styles.layoutMain}>
        <Header />
        <Outlet />
      </Layout>
      <Footer />
    </div>
  );
}
export default ProofLayout;
