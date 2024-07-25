import { createStyles } from 'antd-style';

import LoginBg from '@/assets/images/login/bg.png';
import H5LoginBg from '@/assets/images/login/h5-bg.png';
import { hex2rgba } from '@/utils';
const darkColors = {
  borderColor: '#fff',
  textColor: '#fff',
};
const lightColors = {
  borderColor: '#2B332D',
  textColor: '#2B332D',
};

export default createStyles(({ token, css, responsive, appearance, isDarkMode }) => {
  const colors = isDarkMode ? darkColors : lightColors;
  return {
    formBox: {
      width: '100%',
    },
    formItemText: {
      color: 'rgba(43, 51, 45, 0.60)',
      fontFamily: 'Poppins',
      fontWeight: 400,
      fontSize: 16,
    },
    inputStyle: {
      borderRadius: 12,
      padding: '17px 20px',
      fontWeight: 400,
      '&:placeholder': {
        color: 'rgba(43, 51, 45, 0.3) !important',
        fontWeight: 400,
      },
      '&:focus-within': {
        boxShadow: 'none',
      },
    },
    submitBtn: {
      width: '100%',
      height: 56,
      color: '#2B332D',
      // textAlign: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: '1px solid rgba(43, 51, 45, 0.30)',
      '&:hover': {
        color: '#2B332D',
        border: '1px solid #2B332D',
      },
      '&:disabled':{
        color: 'rgba(43, 51, 45, 0.30)',
        border: '1px solid rgba(43, 51, 45, 0.30)',
      }
    },
    loginContainer: {
      width: '100%',
      height: '100vh',
      display: 'flex',
    },
    loginBg: {
      width: '50%',
      height: '100%',
      background: `url(${LoginBg}) lightgray 50% / cover no-repeat`,
      [responsive.sm]: {
        width: '100%',
        background: `url(${H5LoginBg}) lightgray 50% / cover no-repeat`,
      },
    },
    loginMain: {
      width: '50%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [responsive.sm]: {
        width: 'fit-content',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: 'auto',
      },
    },
    loginPanel: {
      width: '460px',
      borderRadius: '20px',
      border: `1px solid ${hex2rgba(colors.borderColor, 15)}`,
      color: hex2rgba(colors.borderColor, 60),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px',
      padding: '64px 63px 58px',
      [responsive.sm]: {
        width: '351px',
        maxWidth: '100%',
        height: '520px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(24px)',
        padding: '64px 20px 58px',
      },
    },
    loginPanelText: {
      textAlign: 'center',
      lineHeight: 1.8,
      fontSize: 16,
    },
    loginPanelLogo: {
      width: '181.365px',
      height: 'auto',
    },

    loginBtn: {
      marginTop: '4.5px',
      padding: '16px 0px',
      borderRadius: 60,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      fontStyle: 'normal',
      fontWeight: '500',
      width: '326px',
      height: 'fit-content',
      lineHeight: '32px',
      fontSize: '16px',
      border: `1px solid ${hex2rgba(colors.borderColor, 30)}`,
      color: colors.textColor,
      span: {
        fontSize: '16px',
      },
      '&:hover': {
        border: `1px solid ${hex2rgba(colors.borderColor)}`,
      },
      [responsive.sm]: {
        width: '250px',
      },
    },

    loginProtocol: {
      paddingTop: '4px',
      color: hex2rgba(colors.textColor, 60),
      textAlign: 'center',
      fontFamily: 'Poppins',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '160%',
      '& a': {
        fontSize: '14px',
        color: hex2rgba(colors.textColor, 100),
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '160%',
        textDecorationLine: 'underline',
      },
    },
  };
});
