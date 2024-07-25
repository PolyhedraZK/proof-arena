import { Button, type ButtonProps, ConfigProvider, theme } from 'antd';
import { createStyles, useResponsive, useThemeMode } from 'antd-style';
import React, { memo } from 'react';
import tinycolor from 'tinycolor2';

import { customThemeVariables } from '@/theme';

interface IProps extends ButtonProps {}

const useStyles = createStyles(({ token, css, prefixCls, isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    primaryBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.primaryBtnBgColor,
      color: colors.primaryBtnColor,
      '&:hover': {
        background: tinycolor(colors.primaryBtnBgColor).darken(5).toString(),
      },
      span: {
        fontSize: '18px',
      },
    },
  };
});
/**
 * primary
 */
const PrimaryButton = memo(({ children, className, ...rest }: IProps) => {
  const { styles, cx } = useStyles();

  return (
    <Button {...rest} className={cx(styles.primaryBtn, className)}>
      {children}
    </Button>
  );
});

export default PrimaryButton;
