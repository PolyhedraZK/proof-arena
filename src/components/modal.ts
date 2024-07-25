import NiceModal from '@ebay/nice-modal-react';

import ConfirmModal, { ConfirmModalId } from './base/ConfirmModal';
import LoadingModal, { LoadingModalId } from './base/LoadingModal';
import CreateProverModal, { CreateProverModalId } from './biz/problems/CreateProverModal';
import EditProverModal, { EditProverModalId } from './biz/problems/EditProverModal';
NiceModal.register(LoadingModalId, LoadingModal);
NiceModal.register(ConfirmModalId, ConfirmModal);

// 业务上的
NiceModal.register(CreateProverModalId, CreateProverModal);
NiceModal.register(EditProverModalId, EditProverModal);
