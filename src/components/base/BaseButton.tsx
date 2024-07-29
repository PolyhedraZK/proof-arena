import { Button, type ButtonProps, ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

const useStyles = createStyles(({ token, css, prefixCls, isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    baseBtn: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '18px',
      background: 'transparent',
      border: `1px solid ${hex2rgba(colors.borderColor, 30)}`,
      span: {
        color: token.colorText,
      },
      '&:hover': {
        border: `1px solid ${colors.borderColor}`,
      },
    },
  };
});

const BaseButton = memo(({ children, className, ...rest }: ButtonProps) => {
  const { styles, cx } = useStyles();
  return (
    <Button {...rest} className={cx(styles.baseBtn, className)}>
      {children}
    </Button>
  );
});

export default BaseButton;
