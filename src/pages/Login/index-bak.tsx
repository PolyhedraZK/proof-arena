import { Image } from 'antd';
import BaseButton from '@/components/base/BaseButton';
import GoogleIcon from '@/assets/icons/google.svg';
import LoginLogo from '@/assets/login/login-logo.svg';

import useStyles from './login.style';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleUserInfoType, fetchUserInfo } from '@/services/user';
import { useGlobalStore } from '@/store/global';

function LoginPage() {
  const { styles } = useStyles();

  const navigate = useNavigate();

  const { update } = useGlobalStore();

  const login = useGoogleLogin({
    onSuccess: async codeResponse => {
      Cookies.set('token', codeResponse.access_token);
      Cookies.set('token_expires_in', codeResponse.expires_in + '');
      const user: GoogleUserInfoType = await fetchUserInfo(
        codeResponse.access_token
      );
      Cookies.set('user_id', user.id);
      sessionStorage.setItem('user', JSON.stringify(user));
      update('user', user);
      navigate('/');
    },
    onError: error => console.log('Login Failed:', error),
  });

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBg}></div>
      <div className={styles.loginMain}>
        <div className={styles.loginPanel}>
          <Image
            src={LoginLogo}
            alt=""
            className={styles.loginPanelLogo}
            preview={false}
          />
          <p className={styles.loginPanelText}>
            Full-stack ZK Proof services with the most
            <br />
            efficient ZK protocols
          </p>
          <BaseButton className={styles.loginBtn} onClick={() => login()}>
            <img src={GoogleIcon} alt="" />
            Sign in with Google
          </BaseButton>
          <p className={styles.loginProtocol}>
            I agree to Proof Cloud's <a>Terms of Service</a> and
            <a> Privacy Policy.</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
