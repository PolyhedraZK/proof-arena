import { Flex } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import React, { memo } from 'react';

import { customThemeVariables } from '@/theme';

const useSubTitleStyles = createStyles(({ responsive, isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    tilWrapper: {
      marginBottom: 24,
      color: colors.textColor,
      [responsive.md]: {
        marginBottom: 20,
      },
      '.tit-left': {
        '.icon': {
          fontSize: 24,
          marginTop: 2,
          opacity: 0.5,
          fill: colors.textColor,
          cursor: 'pointer',
          '&.active': {
            opacity: 1,
          },
        },
        '& .sub-tit': {
          fontSize: 24,
        },
      },

      '.tit-right': {},
    },
    createBtn: {
      width: 144,
      height: 44,
      [responsive.md]: {
        width: 120,
      },
    },
  };
});

type LayoutType = 'column' | 'row';
interface IProps {
  layoutType: LayoutType;
  setLayoutType: React.Dispatch<React.SetStateAction<'column' | 'row'>>;
}

const SubTitle = memo(({ layoutType, setLayoutType }: IProps) => {
  const { styles } = useSubTitleStyles();
  const { md } = useResponsive();

  return (
    <Flex className={styles.tilWrapper} justify="space-between" align="center">
      <Flex className="tit-left" align="center" gap={24}>
        <span className="sub-tit">Problems</span>
      </Flex>
    </Flex>
  );
});

export default SubTitle;
