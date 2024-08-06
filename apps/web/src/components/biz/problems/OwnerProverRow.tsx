import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import p1Svg from '@/assets/owner/p1.svg';
import p2Svg from '@/assets/owner/p2.svg';
import p3Svg from '@/assets/owner/p3.svg';
import p4Svg from '@/assets/owner/p4.svg';
import { IProverItem, ProverStatusEnum } from '@/services/prover/types';
import { customThemeVariables } from '@/theme';
import { ellipsisText, hex2rgba } from '@/utils';

import ProverStatusBtn from '../proverDetail/ProveStatus';

const useOwnerProverRowStyles = createStyles(({ isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    proverRowWrapper: {
      width: '100%',
      height: 80,
      padding: '25px 20px',
      borderRadius: 16,
      border: `1px solid ${hex2rgba(colors.borderColor, 5)}`,
      background: colors.cardBgColor,
      backdropFilter: 'blur(25px)',
      position: 'relative',
      '&:hover': {
        cursor: 'pointer',
        border: `1px solid ${hex2rgba(colors.borderColor, 60)}`,
      },
      '.tit': {
        fontSize: 18,
      },
      '.desc': {
        fontSize: 16,
        opacity: 0.6,
        fontWeight: 400,
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
  };
});

interface IProps {
  info: IProverItem & { index: number };
}

const SVG_MAP = {
  0: p1Svg,
  1: p2Svg,
  2: p3Svg,
  3: p4Svg,
};

/**
 * 私有的prover - 单行展示
 */
const OwnerProverRow = memo(({ info }: IProps) => {
  const { styles } = useOwnerProverRowStyles();
  const { prover_type, prover_name, description, index } = info;
  const navigate = useNavigate();

  const handleClick = () => {
    if (info.status != ProverStatusEnum.INITIALIZING) {
      navigate(`/prover/${info.id}`);
    }
  };

  return (
    <Flex
      className={clsx([styles.proverRowWrapper], {
        disabled: info.status == ProverStatusEnum.INITIALIZING,
      })}
      onClick={handleClick}
      justify="space-between"
      align="center"
    >
      <Flex align="center" gap={16}>
        <img className="svg" src={SVG_MAP[prover_type]} />
        <span className="tit">{ellipsisText(prover_name, 59)}</span>
      </Flex>
      <Flex align="center" gap={90}>
        <span className="desc">{ellipsisText(description, 37)}</span>
        <ProverStatusBtn status={info.status} />
      </Flex>
    </Flex>
  );
});

export default OwnerProverRow;
