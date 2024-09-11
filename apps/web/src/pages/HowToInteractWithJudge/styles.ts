import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';
export const useStyles = createStyles(({ isDarkMode, css, responsive }) => {
  const colors = isDarkMode ? customThemeVariables.dark : customThemeVariables.light;
  return {
    baseBox: {
      // padding: 16,
      marginBottom: 50,
    },
    box: {
      margin: '0 auto',
      // marginTop: 24,
      borderRadius: 8,
      background: colors.cardBgColor,
      maxWidth: 1200,
      width: '100%',
      padding: 24,
      [responsive.mobile]: {
        marginTop: 8,
      },
    },
    title: css`
      color: #2b332d;
      font-family: Poppins;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: 130%;
      position: relative;
    `,
    green: css`
      width: 3px;
      height: 20px;
      flex-shrink: 0;
      background: #34a853;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: -24px;
    `,
    proversWrapper: {
      background: colors.bgColor,
      [responsive.md]: {
        width: '100%',
        padding: '0 16px',
        margin: '12px auto 0',
      },
      '.my-provers': {
        overflow: 'hidden',
        overflowY: 'auto',
        [responsive.md]: {
          marginBottom: 24,
        },
      },
      '.public-provers': {
        minHeight: 200,
        marginBottom: 60,
        '.sub-tit': {},
      },
    },
    tabTitle: {
      fontSize: 20,
      fontWeight: 500,
    },
  };
});
