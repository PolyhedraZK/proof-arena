import { Button, type ButtonProps, ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';

import ArrowLink from '@/assets/icons/arrow-link.svg?r';
import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

interface IProps extends ButtonProps {}

const useStyles = createStyles(({ token, css, prefixCls, isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    linkBtn: {
      display: 'flex',
      alignItems: 'center',
      height: '40px',
      padding: '0 20px',
      fontSize: '18px',
      color: token.colorPrimary,
      border: `1px solid ${hex2rgba(colors.borderColor, 5)}`,
      background: 'transparent',
      '&:hover': {
        border: `1px solid ${token.colorPrimary}`,
      },
    },
  };
});

const LinkButton = memo(({ children, className, ...rest }: IProps) => {
  const { styles, cx } = useStyles();
  return (
    <Button {...rest} className={cx(styles.linkBtn, className)}>
      {children}
      <ArrowLink />
    </Button>
  );
});

export default LinkButton;
