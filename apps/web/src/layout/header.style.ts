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
        padding: '0 20px',
      },
    },
    navLogo: {
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      left: 32,
      '& .logo': {
        width: 193,
        height: 'auto',
      },
      [responsive.sm]: {
        left: 22,
        '& .logo': {
          width: '178.181px',
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
        justifyContent: 'center',
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

    // 下拉抽屉
    drawerWrapper: {
      position: 'absolute',
      height: 'calc(100vh - 72px)',
      width: '100%',
      zIndex: '1',
      padding: 0,
      background: '#000',
      '& .proof-drawer-body': {
        padding: 0,
      },
    },

    menuWrapper: {
      padding: '0 16px',
      '& .dropdown-menu': {
        background: '#000',
        borderRadius: '0',
        opacity: '1',
        '& .dropdown-menu-item': {
          display: 'flex',
          alignItems: 'center',
          gap: '25px',
          padding: '20px 0',
          fontSize: '18px',
          background: 'none',
          fontWeight: '400',
          '&:last-child': {
            borderBottom: 'none',
            padding: '28px 0',
          },
          '.mobile-avatar': {
            width: '44px',
            height: '44px',
          },
          '.mobile-logout': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '109px',
            height: '44px',
            border: '1px solid white',
            color: 'white',
            borderRadius: '40px',
          },
        },
      },
    },
  };
});
