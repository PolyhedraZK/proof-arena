import NiceModal from '@ebay/nice-modal-react';
import { ConfigProvider, Flex, Modal, Space } from 'antd';
import { createStyles } from 'antd-style';
import { useContext, useEffect } from 'react';

import ProofSpin from './ProofSpin';

const useLoadingModalStyles = () => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const modalPrefixCls = getPrefixCls('modal');
  return createStyles(({ css }) => {
    return {
      proofLoadingModalWrapper: css`
        .${modalPrefixCls}-content {
          border-radius: 24px;
          padding: 64px;
          height: 660px;
          width: 660px;
          display: flex;
          alignitems: center;
          justifycontent: center;
          .content-box {
            position: absolute;
            border-radius: 24px;
            z-index: 3;
            top: 35%;
            left: 0;
            right: 0;
            margin: auto;
          }
        }
      `,
    };
  })();
};

const LoadingModal = NiceModal.create((props: { text: string }) => {
  const { styles } = useLoadingModalStyles();

  const { visible, hide } = NiceModal.useModal();

  return (
    <Modal
      className={styles.proofLoadingModalWrapper}
      open={visible}
      closeIcon={null}
      onCancel={() => hide()}
      maskClosable={false}
      footer={false}
      width={660}
      height={660}
      style={{ top: window.innerHeight > 900 ? 100 : 50 }}
    >
      <Flex className="content-box" vertical justify="center" align="center">
        <ProofSpin />
        <span style={{ fontSize: 32, marginTop: 24 }}>{props.text}</span>
      </Flex>
    </Modal>
  );
});

export const LoadingModalId = 'proof-loading-modal';

export default LoadingModal;
