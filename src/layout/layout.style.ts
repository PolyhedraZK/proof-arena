import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

export default createStyles(({ responsive, isDarkMode }) => {
  const colors = isDarkMode ? customThemeVariables.dark : customThemeVariables.light;
  return {
    layout: {
      background: colors.bgColor,
      minHeight: '100vh',
    },
  };
});
