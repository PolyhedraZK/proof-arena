import { Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router';

import Loading from '@/components/base/Loading';

import Footer from './Footer';
import Header from './Header';
import useStyles from './layout.style';

function ProofLayout() {
  const { styles } = useStyles();

  return (
    <div className={styles.layout}>
      <Layout className={styles.layoutMain}>
        <Header />
        <React.Suspense fallback={<Loading />}>
          <Outlet />
        </React.Suspense>
      </Layout>
      <Footer />
    </div>
  );
}
export default ProofLayout;
