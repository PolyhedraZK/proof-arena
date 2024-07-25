import { Button, ConfigProvider, Flex } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';

import { IProverItem } from '@/services/prover/types';

const usePublicProverCardStyles = createStyles(token => {
  return {
    'public-prover-card-wrapper': {
      '.tit': {
        lineHeight: '28px',
        marginBottom: 4,
        fontSize: 20,
      },
      '.use-btn': {
        width: 82,
        height: 32,
        border: '1px solid #3c8476',
        borderRadius: 16,
      },
    },
  };
});

interface IProps {
  handleClick: () => void;
  handleBtnClick: () => void;
  info: IProverItem;
}

/**
 * public的prover - 单行展示
 */
const PublicProverCard = memo(
  ({ info, handleBtnClick, handleClick }: IProps) => {
    const { styles } = usePublicProverCardStyles();

    return (
      <div onClick={handleClick}>
        <Flex
          className={styles['public-prover-card-wrapper']}
          align="start"
          vertical
          gap={12}
        >
          <span className="tit elp-2">{info.prover_name}</span>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultBorderColor: 'none',
                },
              },
            }}
          >
            <Button className="use-btn" onClick={handleBtnClick}>
              Use
            </Button>
          </ConfigProvider>
        </Flex>
      </div>
    );
  }
);

export default PublicProverCard;
