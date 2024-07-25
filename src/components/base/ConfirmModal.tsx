import NiceModal from '@ebay/nice-modal-react';
import { Flex, Modal } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import clsx from 'clsx';

import WarningIcon from '@/assets/icons/warning.svg?r';
import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

import BaseButton from './BaseButton';
import PrimaryButton from './PrimaryButton';

const useConfirmModalStyles = createStyles(
  ({ token, responsive, prefixCls, isDarkMode }) => {
    const colors = isDarkMode
      ? customThemeVariables.dark
      : customThemeVariables.light;

    return {
      confirmModal: {
        [`.${prefixCls}-modal`]: {
          width: 'calc(100vw - 16px) !important',
        },
        [`.${prefixCls}-modal-content`]: {
          borderRadius: '16px',
          border: `1px solid ${hex2rgba(colors.borderColor, 10)}`,
          width: '504px',
          height: '372px',
          display: 'flex',
          alignitems: 'center',
          justifycontent: 'center',
          padding: '52px 47px 48px',
          [responsive.md]: {
            width: '335px',
            height: '340px',
            padding: '52px 27px',
          },
        },

        '.confirming-flex': {
          color: token.colorPrimary,
        },

        '.confirm-text': {
          fontSize: '32px',
          textAlign: 'center',
          marginTop: '24px',
          color: colors.textColor,
          [responsive.md]: {
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: '130%',
          },
        },
      },

      btns: {
        display: 'flex',
        gap: '40px',
        marginTop: '60px',
        [responsive.md]: {
          gap: '11px',
          marginTop: '46px',
        },
      },
      button: {
        display: 'flex',
        width: '160px',
        height: '50px',
        padding: '16px 51px',
        justifyContent: 'center',
        alignItems: 'center',
        [responsive.md]: {
          width: '135px',
        },
        '&.cancel-btn': {
          border: `1px solid ${hex2rgba(colors.borderColor, 30)}`,
          '&:hover': {
            borderColor: colors.borderColor,
          },
        },
      },
    };
  }
);

interface IConfirmModalProps {
  title: string;
  onOK: () => void;
  onCancel: () => void;
}

const ConfirmModal = NiceModal.create((props: IConfirmModalProps) => {
  const { styles } = useConfirmModalStyles();
  const { md } = useResponsive();
  const action = NiceModal.useModal();

  const onCancel = () => {
    action.reject();
    action.hide();
  };

  const onConfirm = () => {
    action.resolve();
    action.hide();
  };

  return (
    <Modal
      className={styles.confirmModal}
      open={action.visible}
      closeIcon={null}
      onCancel={onCancel}
      maskClosable={false}
      width="auto"
      centered
      footer={false}
    >
      <Flex
        className="confirming-flex"
        vertical
        justify="center"
        align="center"
      >
        <WarningIcon />
        <p className="confirm-text">{props.title}</p>
        <div className={styles.btns}>
          <BaseButton
            className={clsx({
              'cancel-btn': true,
              [styles.button]: true,
            })}
            onClick={onCancel}
            ghost
          >
            Cancel
          </BaseButton>
          <PrimaryButton
            onClick={onConfirm}
            className={clsx({
              [styles.button]: true,
            })}
          >
            Confirm
          </PrimaryButton>
        </div>
      </Flex>
    </Modal>
  );
});

export const ConfirmModalId = 'proof-confirming-modal';

export default ConfirmModal;
