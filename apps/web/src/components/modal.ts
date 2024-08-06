import NiceModal from '@ebay/nice-modal-react';

import ConfirmModal, { ConfirmModalId } from './base/ConfirmModal';
import LoadingModal, { LoadingModalId } from './base/LoadingModal';

NiceModal.register(LoadingModalId, LoadingModal);
NiceModal.register(ConfirmModalId, ConfirmModal);
