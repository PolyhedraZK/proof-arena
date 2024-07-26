import Icon, { PlusOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import React, { memo } from 'react';

import EmptySvg from '@/assets/images/provers/empty-list-white.svg?r';
import PrimaryButton from '@/components/base/PrimaryButton';
import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

interface IProps {
  handleCreate?: () => void;
}

const useStyles = createStyles(({ responsive, isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;

  return {
    emptyWrapper: {
      margin: '33px 0 57px',
      color: colors.textColor,
      '& .sub-tit': {
        fontSize: '20px',
        fontWeight: '500',
        lineHeight: '20px',
        textAlign: 'left',
      },
      '& .second-tit': {
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '21px',
        color: hex2rgba(colors.textColor, 80),
      },
    },
    createBtn: {
      width: 141,
      height: 44,
      marginTop: 30,
      span: {
        fontSize: 18,
      },
      [responsive.mobile]: {
        marginTop: 23,
      },
    },
  };
});

const Empty = memo(({ handleCreate }: IProps) => {
  const { mobile } = useResponsive();
  const { styles } = useStyles();
  return (
    <Flex vertical align="center" gap={22} className={styles.emptyWrapper}>
      <EmptySvg />
      <p className="sub-tit">You don't have any Problems.</p>
      <p className="second-tit">
        Create your first Problems to start using our Proof Cloud.
      </p>
      <PrimaryButton
        className={styles.createBtn}
        icon={<PlusOutlined />}
        onClick={handleCreate}
      >
        Create
      </PrimaryButton>
    </Flex>
  );
});

export default Empty;
