import { Flex, Space } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { useNavigate } from 'react-router';

import { IProverItem, ProverStatusEnum } from '@/services/prover/types';
import { customThemeVariables } from '@/theme';
import { ellipsisText, hex2rgba } from '@/utils';

import ProverStatusBtn from '../proverDetail/ProveStatus';

const useOwnerProverCardStyles = createStyles(({ responsive, isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    proofCardWrapper: {
      width: 384,
      padding: '20px 20px 26px',
      borderRadius: 16,
      border: `1px solid ${hex2rgba(colors.borderColor, 5)}`,
      background: colors.cardBgColor,
      backdropFilter: 'blur(25px)',
      position: 'relative',
      '&:hover': {
        cursor: 'pointer',
        border: `1px solid ${hex2rgba(colors.borderColor, 60)}`,
      },
      [responsive.mobile]: {
        width: 344,
      },
      '&.disabled': {
        '&::after': {
          content: '""',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: '0.5',
          zIndex: 2,
          background: colors.bgColor,
          borderRadius: 16,
        },

        '&:hover': {
          cursor: 'not-allowed',
          border: `1px solid ${hex2rgba(colors.borderColor, 60)}`,
        },
      },
    },
    innerWrapper: {
      '.tit': {
        width: '100%',
        marginBottom: 4,
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '140%',
        margin: 0,
        marginTop: '4px',
      },
      '.desc': {
        width: '100%',
        fontSize: 16,
        opacity: 0.6,
        fontWeight: 400,
      },
      [responsive.mobile]: {
        '.tit': {
          width: '100%',
          lineBreak: 'anywhere',
        },
      },
    },
  };
});

interface IProps {
  info: IProverItem;
}

/**
 * 私有的prover - card展示
 */
const OwnerProverCard = memo(({ info }: IProps) => {
  const { styles, cx } = useOwnerProverCardStyles();
  const navigate = useNavigate();
  const { prover_name, description } = info;

  const handleClick = () => {
    if (info.status != ProverStatusEnum.INITIALIZING) {
      navigate(`/prover/${info.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cx(styles.proofCardWrapper, {
        disabled: info.status == ProverStatusEnum.INITIALIZING,
      })}
    >
      <Flex className={styles.innerWrapper} align="start" vertical gap={12}>
        <ProverStatusBtn status={info.status} />
        <span className="tit elp-2">{prover_name}</span>
        <span className="desc elp">{ellipsisText(description, 37)}</span>
      </Flex>
    </div>
  );
});

export default OwnerProverCard;
