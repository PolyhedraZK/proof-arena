import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

export default createStyles(({ responsive, isDarkMode }) => {
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
      '& .logo': {
        width: 203,
        height: 'auto',
      },
      [responsive.sm]: {
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
        display: 'flex',
        justifyContent: 'right',
        gap: '48px',
        '.link': {
          color: hex2rgba(colors.textColor, 60),
          fontSize: '18px',
          [responsive.sm]: {
            padding: '26px 0px',
          },
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
      width: 144,
      height: 44,
      fontWeight: 500,
      cursor: 'pointer',
      [responsive.tablet]: {
        marginLeft: '0px',
      },
      [responsive.laptop]: {
        marginLeft: '0px',
      },
    },
    btnBox: {
      width: 203,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    mdGithubBtn: {
      width: 140,
      height: 44,
      marginTop: 32,
      fontWeight: 500,
      cursor: 'pointer',
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
      padding: '24px 0px',
      borderBottom: '1px solid #f0f0f0',
      background: '#fff',
    },
    dropdownSubItem: {
      fontSize: 16,
      fontFamily: 'PingFang SC',
      padding: '16px 0px 16px 24px',
      borderBottom: '1px solid #f0f0f0',
      background: '#f9f9f9',
    },
    checkMarkIcon: {
      position: 'absolute',
      right: 26,
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

    antMenuStyle: {
      justifyContent: 'center',
      border: 'none',
      width: '150px',
      flex: 1,
      '.proof-menu-item': {
        height: 88,
        lineHeight: '88px',
        fontSize: 18,
        color: 'rgba(43, 51, 45, 0.6)',
        [responsive.sm]: {
          height: 72,
          lineHeight: '72px',
        },
      },
      '.proof-menu-item-selected': {
        color: '#2B332D',
        fontWeight: 500,
      },
      '.proof-menu-submenu-title': {
        height: 88,
        lineHeight: '88px',
        [responsive.sm]: {
          height: 72,
          lineHeight: '72px',
        },
      },
    },
  };
});
