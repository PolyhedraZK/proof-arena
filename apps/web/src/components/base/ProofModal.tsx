import { ConfigProvider, Flex, Modal, ModalProps } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import { memo, type ReactNode, useContext } from 'react';

import Close from '@/assets/close.svg';
import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

import ProofSpin from './ProofSpin';

export interface IProps extends ModalProps {
  title?: string;
  children?: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const useProofModalStyles = () => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const modalPrefixCls = getPrefixCls('modal');
  const formPrefixCls = getPrefixCls('form');

  return createStyles(({ css, isDarkMode }) => {
    const colors = isDarkMode
      ? customThemeVariables.dark
      : customThemeVariables.light;
    return {
      proofModalWrapper: css`
        .${formPrefixCls}-item-explain-error {
          font-size: 14px;
        }
        .${modalPrefixCls}-content {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 16px 24px 18px;
          .${modalPrefixCls}-header {
            padding-bottom: 16px;
            margin: 0;
            &::after {
              position: absolute;
              width: 100%;
              left: 0;
              top: 60px;
              content: '';
              border-bottom: 1px solid ${hex2rgba(colors.borderColor, 10)};
            }
          }
          .${modalPrefixCls}-body {
            padding-top: 24px;
          }
          .${modalPrefixCls}-close {
            position: absolute;
            z-index: 2;
            cursor: pointer;
            top: 14px !important;
            right: 20px !important;
            &:hover {
              .${modalPrefixCls}-close-x {
                img {
                  opacity: 1 !important;
                }
              }
            }
          }
          .${modalPrefixCls}-title {
            font-weight: normal;
          }
        }
      `,
      loadingContent: {
        position: 'absolute',
        borderRadius: '24px',
        background: colors.cardBgColor,
        zIndex: '3',
        width: '100%',
        height: '100%',
        top: 0,
        left: '0',
        right: '0',
        bottom: '0',
      },
    };
  })();
};

const ProofModal = memo(
  ({ title, children, open, onCancel, loading, ...reset }: IProps) => {
    const { styles } = useProofModalStyles();
    const responsive = useResponsive();

    return (
      <Modal
        centered={!responsive.mobile}
        className={styles.proofModalWrapper}
        title={title}
        open={open}
        closeIcon={<img style={{ opacity: 0.5 }} src={Close} />}
        onCancel={onCancel}
        maskClosable={false}
        keyboard={false}
        footer={false}
        style={{ top: 0 }}
        width={responsive.mobile ? 'auto' : 660}
        {...reset}
      >
        {loading && (
          <Flex
            className={styles.loadingContent}
            vertical
            justify="center"
            align="center"
          >
            <ProofSpin />
            <span style={{ fontSize: 32, marginTop: 24 }}>Deploying</span>
          </Flex>
        )}
        {children}
      </Modal>
    );
  }
);

export default ProofModal;
