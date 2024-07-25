import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useRequest } from 'ahooks';
import { Form } from 'antd';
import { useEffect, useState } from 'react';

import ProofForm, {
  IFormType,
  IFormValidate,
} from '@/components/base/ProofForm';
import ProofModal from '@/components/base/ProofModal';
import { editProver, fetchProverDetail } from '@/services/prover';
import { IProverItem, ProverTypeNameMap } from '@/services/prover/types';
import { useGlobalStore } from '@/store/global';
import { useProverDetailStore } from '@/store/proverDetail';

interface IEditProverModalProps {
  data: IProverItem;
}

const ReadOnlyInput = (props: { children?: React.ReactNode }) => {
  return <span style={{ wordBreak: 'break-all' }}>{props.children}</span>;
};

const formList: IFormType[] = [
  // {
  //   type: 'custom',
  //   children: <ReadOnlyInput />,
  //   label: 'vCPU *',
  //   name: 'prover_type_name',
  // },
  // {
  //   type: 'custom',
  //   children: <ReadOnlyInput />,
  //   label: 'Memory size *',
  //   name: 'prover_type_name',
  // },
  {
    type: 'custom',
    children: <ReadOnlyInput />,
    label: 'Type *',
    name: 'prover_type_name',
  },
  {
    type: 'custom',
    children: <ReadOnlyInput />,
    label: 'Name *',
    name: 'prover_name',
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
    type: 'custom',
    children: <ReadOnlyInput />,
    label: 'Code *',
    name: 'binary_path',
  },
  {
    type: 'custom',
    children: <ReadOnlyInput />,
    label: (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ lineHeight: '20px' }}>Data</span>
        <span style={{ lineHeight: '20px' }}>Directory *</span>
      </div>
    ),
    name: 'data_directory_path',
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
const EditProverModal = NiceModal.create((props: IEditProverModalProps) => {
  const actions = useModal();
  const [form] = Form.useForm();
  const { user } = useGlobalStore();
  const { data } = props;
  const { prover, update } = useProverDetailStore();
  const [initialValues, setInitialValues] = useState<IProverItem>();

  // 监听data属性的变化，然后设置form的初始值
  useEffect(() => {
    if (prover) {
      setInitialValues({
        ...prover,
        prover_type_name: prover
          ? ProverTypeNameMap[prover.prover_type]
          : 'Undefined',
      });
    }
  }, [prover]);

  const { runAsync: postProverAsync, loading } = useRequest(editProver, {
    manual: true,
  });
  const { runAsync: fetchProverDetailAsync, loading: l2 } = useRequest(
    fetchProverDetail,
    {
      manual: true,
    }
  );

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
      id: data.id,
    });
    if (res.data === 'success') {
      await fetchProverDetailAsync(data.id).then(ret => {
        update('prover', ret);
        actions.resolve('success'); // 通知modal的调用层，操作完成；
        actions.hide();
        setErrors({});
      });
    } else {
      const { error_msg, code } = res;
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
      destroyOnClose
      open={actions.visible}
      title="Edit"
      loading={loading || l2}
    >
      <ProofForm
        formList={formList}
        onCancel={onCancel}
        onFinish={onFinish}
        initialValues={initialValues}
        form={form}
        submitText="Edit"
        errors={errors}
      />
    </ProofModal>
  );
});

export default EditProverModal;
export const EditProverModalId = 'EditProverModalId';
