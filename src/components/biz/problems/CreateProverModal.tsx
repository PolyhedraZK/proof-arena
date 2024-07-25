import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useRequest } from 'ahooks';
import { App, Form, message } from 'antd';
import { useResponsive } from 'antd-style';
import { useState } from 'react';

import ProofForm, {
  IFormType,
  IFormValidate,
} from '@/components/base/ProofForm';
import ProofModal from '@/components/base/ProofModal';
import { createProver } from '@/services/prover';
import { useGlobalStore } from '@/store/global';

const formList: IFormType[] = [
  // todo 这里需要从后台读取
  // {
  //   type: 'lightRadio',
  //   label: 'vCPU',
  //   name: 'vcpu',
  //   rules: [{ required: true, message: 'required' }],
  //   options: [
  //     {
  //       label: '4vCPU',
  //       value: 1,
  //       isDefault: true,
  //       desc: '',
  //     },
  //     {
  //       label: '8vCPU',
  //       value: 2,
  //       desc: '',
  //     },
  //     {
  //       label: '16vCPU',
  //       value: 3,
  //       desc: '',
  //     },
  //     {
  //       label: '32vCPU',
  //       value: 4,
  //       desc: '',
  //     },
  //   ],
  // },
  // {
  //   type: 'lightRadio',
  //   label: 'Memory size',
  //   name: 'memory',
  //   rules: [{ required: true, message: 'required' }],
  //   options: [
  //     {
  //       label: '8GB',
  //       value: 1,
  //       desc: '',
  //       isDefault: true,
  //     },
  //     {
  //       label: '16GB',
  //       value: 2,
  //       desc: '',
  //     },
  //     {
  //       label: '32GB',
  //       value: 3,
  //       desc: '',
  //     },
  //     {
  //       label: '64GB',
  //       value: 4,
  //       desc: '',
  //     },
  //     {
  //       label: '128GB',
  //       value: 5,
  //       desc: '',
  //     },
  //     {
  //       label: '256GB',
  //       value: 6,
  //       isDefault: false,
  //       disabled: true,
  //       desc: '',
  //     },
  //   ],
  // },
  {
    type: 'radio',
    label: 'Type',
    name: 'prover_type',
    rules: [{ required: true, message: 'required' }],
    options: [
      {
        label: 'Gnark',
        value: 1,
        isDefault: true,
        desc: '',
      },
      {
        label: 'Expander',
        value: 2,
        desc: '',
      },
    ],
  },
  {
    type: 'input',
    label: 'Name',
    name: 'prover_name',
    rules: [
      { required: true, message: 'Please enter Name' },
      {
        pattern: /^[a-zA-Z0-9\s]+$/,
        message: 'Prover name can only contain numbers, letters, and spaces',
      },
    ],
    placeholder: 'Enter the name',
    showCount: true,
    maxLength: 32,
  },
  {
    type: 'textArea',
    label: 'Description',
    name: 'description',
    rules: [{ required: true, message: 'Please enter Description' }],
    placeholder: 'Enter the description',
    showCount: true,
    maxLength: 128,
  },
  {
    type: 'input',
    label: 'Code',
    name: 'binary_path',
    rules: [{ required: true, message: 'Please enter Code Link' }],
    placeholder: 'Google Cloud Storage Link',
  },
  {
    type: 'input',
    label: (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ lineHeight: '20px' }}>Data</span>
        <span style={{ lineHeight: '20px' }}>Directory</span>
      </div>
    ),
    name: 'data_directory_path',
    rules: [{ required: true, message: 'Please enter DataDirectory' }],
    placeholder: 'Google Cloud Storage Link',
  },
  // {
  //   type: 'radio',
  //   label: 'Visibility',
  //   name: 'visibility',
  //   rules: [{ required: true, message: 'required' }],
  //   options: [
  //     {
  //       label: 'Public',
  //       value: 0,
  //       desc: 'Anyone can view this prover. You choose who can run it.',
  //     },
  //     {
  //       label: 'Private',
  //       isDefault: true,
  //       value: 1,
  //       desc: 'You choose who can view and run this prover.',
  //     },
  //   ],
  // },
];
const CreateProverModal = NiceModal.create(() => {
  const actions = useModal();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { user } = useGlobalStore();

  const { runAsync: postProverAsync, loading } = useRequest(createProver, {
    manual: true,
  });

  const [errors, setErrors] = useState<
    Record<string, IFormValidate | undefined>
  >({});

  const onCancel = async () => {
    form.resetFields();
    actions.hide();
    setErrors({});
  };

  const onFinish = async formData => {
    const res = await postProverAsync({
      ...formData,
      account: user?.id,
      visibility: 1,
      machine_type_id: 1,
    });
    if (res.data === 'success') {
      form.resetFields();
      actions.resolve('success'); // 通知modal的调用层，操作完成；
      actions.hide();
      setErrors({});
    } else {
      // todo 提示错误信息
      const { error_msg, code } = res;
      message.error(error_msg);
      if (code > 2000 && code < 3000) {
        // name错误
        setErrors({
          prover_name: {
            validateStatus: 'error',
            help: error_msg,
          },
        });
      } else if (code > 3000 && code < 4000) {
        if (code == 3002) {
          setErrors({
            binary_path: {
              validateStatus: 'error',
              help: error_msg,
            },
          });
        } else if (code == 3003) {
          setErrors({
            data_directory_path: {
              validateStatus: 'error',
              help: error_msg,
            },
          });
        }
      }
    }
  };

  return (
    <ProofModal
      onCancel={onCancel}
      open={actions.visible}
      width={660}
      title="Create"
      loading={loading}
    >
      <ProofForm
        formList={formList}
        onCancel={onCancel}
        onFinish={onFinish}
        form={form}
        submitText="Deploy"
        errors={errors}
      />
    </ProofModal>
  );
});

export default CreateProverModal;
export const CreateProverModalId = 'CreateProverModalId';
