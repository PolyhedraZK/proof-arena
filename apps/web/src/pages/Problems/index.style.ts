import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';

export const useProverStyles = createStyles(({ responsive, isDarkMode }) => {
  const colors = isDarkMode ? customThemeVariables.dark : customThemeVariables.light;

  return {
    proversWrapper: {
      background: colors.bgColor,
      [responsive.md]: {
        width: '100%',
        padding: '0 16px',
        margin: '30px auto 0',
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
  };
});
