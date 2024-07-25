import { Layout } from 'antd';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useGlobalStore } from '@/store/global';

import Footer from './Footer';
import Header from './Header';
import useStyles from './layout.style';

function ProofLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { update } = useGlobalStore();
  const { styles } = useStyles();
  // useAsyncEffect(async () => {
  //   const accessTokenCookie = Cookies.get('accountId');
  //   if (accessTokenCookie) {
  //     try {
  //       const user: GoogleUserInfoType = await fetchUserInfo(accessTokenCookie);
  //       sessionStorage.setItem('user', JSON.stringify(user));
  //       update('user', user);
  //     } catch (e: any) {
  //       if (e && e.error.code == 401) {
  //         return navigate('/login', { replace: true });
  //       }
  //     }
  //   }
  // }, []);

  // 监听路由变化的时候
  useEffect(() => {
    // const userIdCookie = Cookies.get('accountId');
    // if (!userIdCookie) {
    //   update('user', undefined);
    //   return navigate('/login', { replace: true });
    // } else {
    //   update('user', { id: userIdCookie });
      if (localStorage.getItem('token')=== null) {
        return navigate('/login', { replace: true });
      }else if(location.pathname === '/'){
        return navigate('/problems', { replace: true })
      }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <Layout className={styles.layout}>
      <Header />
      <Outlet />
      <Footer />
    </Layout>
  );
}
export default ProofLayout;
