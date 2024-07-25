/**
 * 个性化东西多的form尽量少用这个，不然为了支持要改很多东西；
 *
 */
import {
  Button,
  ConfigProvider,
  Form,
  FormInstance,
  type FormItemProps,
  type FormProps,
  type GetProp,
  Input,
  InputNumber,
} from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import React, { Fragment, memo, type ReactNode, useEffect } from 'react';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

import CustomLightRadioGroup from '../biz/problems/CustomLightRadioGroup';
import CustomRadio from '../biz/problems/CustomRadioGroup';
import PrimaryButton from './PrimaryButton';

type FormItemType =
  | 'input'
  | 'textArea'
  | 'custom'
  | 'inputNumber'
  | 'radio'
  | 'lightRadio';
export interface IFormType {
  type: FormItemType;
  label: string | ReactNode;
  name: string;
  rules?: GetProp<FormItemProps, 'rules'>;
  options?: {
    label: string;
    value: any;
    desc: string;
    isDefault?: boolean;
    disabled?: boolean;
  }[];
  placeholder?: string;
  showCount?: boolean;
  maxLength?: number;
  children?: ReactNode;
  readOnly?: boolean;
  disable?: boolean;
}
export interface IFormValidate {
  validateStatus: 'success' | 'warning' | 'error' | 'validating';
  help: string;
}
interface IProps extends FormProps {
  form: FormInstance;
  formList: IFormType[];
  initialValues?: Record<string, any>;
  errors?: Record<string, IFormValidate | undefined>;
  loading?: boolean;
  onFinish: (v) => void;
  onCancel: () => void;
  submitText?: string;
}

const useProofFormStyles = createStyles(
  ({ prefixCls, responsive, isDarkMode }) => {
    const colors = isDarkMode
      ? customThemeVariables.dark
      : customThemeVariables.light;

    const formPrefixCls = `${prefixCls}-form`;
    const inputPrefixCls = `${prefixCls}-input`;

    return {
      ProofFormWrapper: {
        [`& .${formPrefixCls}-item`]: {},
        [`& .${formPrefixCls}-item-label label`]: {
          color: hex2rgba(colors.textColor, 60),
          '&::after': {
            display: 'none',
          },
        },
        [`& .${formPrefixCls}-item-required`]: {
          '&::before': {
            display: 'none !important',
          },
          '&::after': {
            marginLeft: '5px',
            content: '"*"',
            display: 'block !important',
          },
        },
        [`&.${formPrefixCls}-item.readonly .${inputPrefixCls}-outlined`]: {
          border: 'none',
        },
        [`& .${formPrefixCls}-item-control`]: {
          justifyContent: 'center',
        },
        [`& .${inputPrefixCls}-outlined`]: {
          boxShadow: 'none',
        },
        [`& .${inputPrefixCls}`]: {
          paddingRight: '20px',
        },
        [`& .${inputPrefixCls}-data-count`]: {
          color: hex2rgba(colors.textColor, 30),
          right: '17px',
          top: '13px',
        },
        [`& .${inputPrefixCls}-show-count-suffix`]: {
          color: hex2rgba(colors.textColor, 30),
        },
      },
      btnGroups: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        ' .form-btn': {
          width: '232px',
          height: '52px',
          span: {
            fontSize: 18,
          },
        },
        '.submit-btn': {},
        '.cancel-btn': {
          borderColor: hex2rgba(colors.textColor, 30),
          color: colors.textColor,
          '&:hover': {
            borderColor: colors.textColor,
          },
        },
        [responsive.mobile]: {
          ' .form-btn': {
            width: '162px',
          },
        },
      },
    };
  }
);

const ProofForm = memo(
  ({
    form,
    formList,
    loading,
    onCancel,
    onFinish,
    submitText,
    initialValues,
    errors,
    ...reset
  }: IProps) => {
    const { styles } = useProofFormStyles();

    const widgetMap: Record<Exclude<FormItemType, 'custom'>, ReactNode> = {
      input: <Input />,
      inputNumber: <InputNumber min={0} style={{ width: '100%' }} />,
      textArea: <Input.TextArea rows={4} style={{ resize: 'none' }} />,
      radio: <CustomRadio />,
      lightRadio: <CustomLightRadioGroup />,
    };

    useEffect(() => {
      form?.resetFields();
    }, [initialValues]);

    return (
      <Form
        form={form}
        className={styles.ProofFormWrapper}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        style={{ maxWidth: 592 }}
        initialValues={initialValues}
        onFinish={onFinish}
        onFinishFailed={e => console.error(e)}
        autoComplete="off"
        labelAlign="left"
        {...reset}
      >
        {formList.map(item => {
          const { type, label, name, rules, children, ...rest } = item;
          const Widget: React.ReactNode = widgetMap[type];
          let CloneWidget;
          if (React.isValidElement(Widget)) {
            CloneWidget = React.cloneElement(Widget ?? '', rest);
          } else if (
            type == 'custom' &&
            children &&
            React.isValidElement(children)
          ) {
            const value = initialValues ? initialValues[item.name] : '';
            CloneWidget = React.cloneElement(children, rest, value);
          }
          return (
            <Fragment key={name}>
              <Form.Item
                label={label}
                name={name}
                rules={rules}
                validateStatus={errors?.[name]?.validateStatus}
                help={errors?.[name]?.help}
                className={clsx({ readonly: item.readOnly })}
              >
                {CloneWidget}
                {/* {type === 'custom' ? children : CloneWidget} */}
              </Form.Item>
            </Fragment>
          );
        })}
        <Form.Item
          wrapperCol={{ flex: 1 }}
          style={{
            margin: '36px 0 0 0',
          }}
        >
          <div className={styles.btnGroups}>
            <Button className="form-btn cancel-btn" onClick={onCancel} ghost>
              Cancel
            </Button>
            <PrimaryButton
              htmlType="submit"
              loading={loading}
              className="form-btn submit-btn"
            >
              {submitText ? submitText : 'Deploy'}
            </PrimaryButton>
          </div>
        </Form.Item>
      </Form>
    );
  }
);

export default ProofForm;
