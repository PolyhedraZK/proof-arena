import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';

export default createStyles(({ responsive, isDarkMode }) => {
  const colors = isDarkMode ? customThemeVariables.dark : customThemeVariables.light;

  return {
    footerBox: {
      width: '100%',
    },
    footerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 'auto',
      padding: '28px 0',
      maxWidth: 1200,
      margin: '0 auto',
      [responsive.mobile]: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 32,
        padding: '48px 24px',
        width: '100%',
      },
    },
    logo: {
      width: 203,
      height: 'auto',
    },
    copyright: {
      flex: 1,
      textAlign: 'center',
      marginLeft: -62,
      color: 'rgba(0,0,0,.5)',
      [responsive.mobile]: {
        marginLeft: 0,
      },
    },
    footerIconStyle: {
      cursor: 'pointer',
    },
  };
});
