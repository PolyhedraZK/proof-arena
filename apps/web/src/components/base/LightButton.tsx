import { Button, type ButtonProps, ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';

import { customThemeVariables } from '@/theme';

interface IProps extends ButtonProps {
  theme?: 'dark' | 'light';
}

const useStyles = createStyles(({ isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;

  return {
    lightBtn: {
      display: 'flex',
      alignItems: 'center',
      height: '40px',
      padding: '0 23px',
      fontSize: '18px',
      transition: 'unset',
      background: colors.lightBtnBgColor,
      span: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.lightBtnColor,
      },
      '&:hover': {
        background: colors.primaryBtnBgColor,
        span: {
          color: colors.primaryBtnColor,
        },
      },
    },
  };
});

const LightButton = memo(({ children, className, ...rest }: IProps) => {
  const { styles, cx } = useStyles();
  return (
    <Button {...rest} className={cx(styles.lightBtn, className)}>
      {children}
    </Button>
  );
});

export default LightButton;
