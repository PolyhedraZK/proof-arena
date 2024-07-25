import { useNavigate } from 'react-router';
import Cookies from 'js-cookie';
import { googleLogout } from '@react-oauth/google';
import { useGlobalStore } from '@/store/global';
export function useLogout() {
  const { update } = useGlobalStore(s => s);
  const navigate = useNavigate();
  const logout = async () => {
    try {
      googleLogout();
      Cookies.remove('token');
      Cookies.remove('user_id');
      sessionStorage.removeItem('user');
      update('isLogin', false);
      update('user', undefined);
      navigate('/login');
    } catch (e) {
      console.warn('disconnect error', e);
    }
  };
  return logout;
}
