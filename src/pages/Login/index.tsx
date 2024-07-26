import { Button, Form, Image, Input } from 'antd';
import { useThemeMode } from 'antd-style';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';

// import GoogleIcon from '@/assets/icons/google.svg';
import LoginLogo from '@/assets/images/login/login-logo.svg';
import WhiteLoginLogo from '@/assets/images/login/white-login-logo.svg';
// import BaseButton from '@/components/base/BaseButton';
import { get, post } from '@/services/Request';
// import { useGlobalStore } from '@/store/global';

import useStyles from './login.style';

function LoginPage() {
  const { styles } = useStyles();
  const { themeMode } = useThemeMode();
  const [form] = Form.useForm();
  const FormItem = Form.Item
  const navigate = useNavigate();
  // const { update } = useGlobalStore();

  // const login = useGoogleLogin({
  //   onSuccess: async codeResponse => {
  //     Cookies.set('token', codeResponse.access_token);
  //     Cookies.set('token_expires_in', codeResponse.expires_in + '');
  //     const user: GoogleUserInfoType = await fetchUserInfo(
  //       codeResponse.access_token
  //     );
  //     Cookies.set('user_id', user.id);
  //     sessionStorage.setItem('user', JSON.stringify(user));
  //     update('user', user);
  //     navigate('/');
  //   },
  //   onError: error => console.log('Login Failed:', error),
  // });

  const login = async () => {
    const value = await form.validateFields()
    console.log(value)
    // if (import.meta.env.DEV) {
    //   const user = {
    //     userId: 'test-account-1',
    //     name: 'mock',
    //   };
    //   const ret = await post('/mock/login', user);
    //   if (ret?.code == 200) {
      localStorage.setItem('token', value.password)
        navigate('/');
      // }
    // } else {
    //   const redirectUrl = `${window.location.origin}/`;
    //   const encodedUrl = encodeURIComponent(redirectUrl);
    //   window.location.href =
    //     import.meta.env.VITE_BASE_URL +
    //     `/google/login?redirect_uri=${encodedUrl}`;
    // }
  };


  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBg}></div>
      <div className={styles.loginMain}>
        <div className={styles.loginPanel}>
          <Image
            src={themeMode == 'dark' ? LoginLogo : WhiteLoginLogo}
            alt=""
            className={styles.loginPanelLogo}
            preview={false}
          />
          {/* <p className={styles.loginPanelText}>
            Full-stack ZK Proof services with the most
            <br />
            efficient ZK protocols
          </p>
          <BaseButton className={styles.loginBtn} onClick={login}>
            <img src={GoogleIcon} alt="" />
            Sign in with Google
          </BaseButton>
          <p className={styles.loginProtocol}>
            I agree to Proof Cloud's <a>Terms of Service</a> and
            <a> Privacy Policy.</a>
          </p> */}

          <Form className={styles.formBox} layout="vertical" form={form} >
            <FormItem name={'userName'} label={<span className={styles.formItemText}>Username :</span>} rules={[{ required: true, message: '' }]}>
              <Input className={styles.inputStyle} placeholder='Please enter username' />
            </FormItem>
            <FormItem name={'password'} label={<span className={styles.formItemText}>Password :</span>} rules={[{ required: true, message: '' }]}>
              <Input className={styles.inputStyle} placeholder='Please enter password' type='password' />
            </FormItem>
          </Form>
          <Button className={styles.submitBtn} onClick={login}>Sign in</Button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
