import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';

export default createStyles(({ responsive, isDarkMode }) => {
  const colors = isDarkMode ? customThemeVariables.dark : customThemeVariables.light;
  return {
    layoutMain: {
      minHeight: 'calc(100vh - 90px)',
      [responsive.mobile]: {
        minHeight: 'auto',
      },
    },
    layout: {
      background: colors.bgColor,
    },
  };
});
