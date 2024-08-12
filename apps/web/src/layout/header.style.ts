import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

export default createStyles(({ responsive, isDarkMode, prefixCls }) => {
  const colors = isDarkMode ? customThemeVariables.dark : customThemeVariables.light;

  return {
    headerWrapper: {
      width: '100%',
      height: '88px',
      position: 'sticky',
      top: 0,
      zIndex: 9,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${hex2rgba(colors.borderColor, 5)}`,
      padding: '0 32px',
      lineHeight: '88px',
      background: colors.headerBgColor,
      backdropFilter: 'blur(25px)',
      [responsive.sm]: {
        height: 72,
        lineHeight: 1,
        padding: '0 20px',
      },
    },
    navLogo: {
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      left: 32,
      '& .logo': {
        width: 203,
        height: 'auto',
      },
      [responsive.sm]: {
        left: 22,
        '& .logo': {
          width: '162px',
          height: 'auto',
        },
      },
    },
    navLinks: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      '.links': {
        flex: 1,
        minWidth: '500px',
        display: 'flex',
        justifyContent: 'right',
        gap: '48px',
        height: '87px',
        '.link': {
          color: hex2rgba(colors.textColor, 60),
          fontSize: '18px',
          '&.active': {
            color: colors.textColor,
            borderBottom: '2px solid #34A853',
          },
          '&:hover': {
            color: colors.textColor,
          },
        },
      },
    },
    githubBtn: {
      marginLeft: '80px',
    },
    mdGithubBtn: {
      marginTop: 32,
    },
    mobileNav: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    mobileNavIcon: {
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
    },
    dropdownBox: {
      position: 'fixed',
      height: '100vh',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      background: '#fff',
      overflow: 'hidden',
      pointerEvents: 'none',
    },
    dropdownItem: {
      fontSize: 18,
      fontFamily: 'PingFang SC',
      padding: '24px 16px',
      borderBottom: '1px solid #f0f0f0',
      background: '#fff',
    },
    logo: {
      width: 162,
      height: 'auto',
    },
    closeHeadBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottom: '1px solid #f0f0f0',
    },
    menuList: { padding: '0px 16px' },
  };
});
