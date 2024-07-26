import { PlusOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Flex } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import classNames from 'clsx';
import React, { memo, useState } from 'react';

import GridDisplaySvg from '@/assets/grid.svg';
import RowsDisplaySvg from '@/assets/rows.svg';
import LightButton from '@/components/base/LightButton';
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
  handleCreate: () => void;
}

const SubTitle = memo(({ handleCreate, layoutType, setLayoutType }: IProps) => {
  const { styles } = useSubTitleStyles();
  const { md } = useResponsive();

  return (
    <Flex className={styles.tilWrapper} justify="space-between" align="center">
      <Flex className="tit-left" align="center" gap={24}>
        <span className="sub-tit">Problems</span>
        {/* {md && (
          <Flex gap={12} align="center">
            <img
              className={classNames('icon', {
                active: layoutType === 'column',
              })}
              onClick={() => setLayoutType('column')}
              src={GridDisplaySvg}
            />

            <img
              className={classNames('icon', { active: layoutType === 'row' })}
              onClick={() => setLayoutType('row')}
              src={RowsDisplaySvg}
            />
          </Flex>
        )} */}
      </Flex>
      {/* <div className="tit-right">
        <LightButton
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className={styles.createBtn}>
          Create
        </LightButton>
      </div> */}
    </Flex>
  );
});

export default SubTitle;
