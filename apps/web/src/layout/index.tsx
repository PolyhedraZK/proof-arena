import { Layout } from 'antd';
import { Outlet } from 'react-router';

import Footer from './Footer';
import Header from './Header';
import useStyles from './layout.style';

function ProofLayout() {
  const { styles } = useStyles();

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
