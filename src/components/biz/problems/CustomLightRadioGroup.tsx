import { useMount } from 'ahooks';
import { ConfigProvider, Flex, Radio } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

export interface ICustomLightRadio {
  value?: any;
  onChange?: (val: any) => void;
  options?: {
    label: string;
    value: any;
    desc: string;
    isDefault?: boolean;
    disabled?: boolean;
  }[];
}

const useCustomRadioGroupStyles = () => {
  const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);
  const radioPrefixCls = getPrefixCls('radio-button');

  return createStyles(({ css, isDarkMode }) => {
    const colors = isDarkMode
      ? customThemeVariables.dark
      : customThemeVariables.light;
    return {
      radioGroupWrapper: css`
        gap: 16px;
        .${radioPrefixCls}-wrapper {
          position: relative;
          height: 44px;
          width: fit-content;
          padding: 9px 14px;
          background: ${colors.lightBtnBgColor};
          border: 1px solid ${hex2rgba(colors.borderColor, 10)};
          color: ${colors.textColor};
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          ::before,
          ::after {
            display: none;
          }
        }
        .${radioPrefixCls}-wrapper-checked {
          border: 1px solid ${colors.primaryBtnBgColor};
          background: ${hex2rgba(colors.primaryBtnBgColor, 10)};
          color: ${colors.primaryBtnBgColor};
        }
        .${radioPrefixCls}-wrapper-disabled {
          border: 1px solid ${hex2rgba(colors.textColor, 10)};
          color: ${hex2rgba(colors.textColor, 30)};
        }
      `,
      radio: css`
        span {
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 160%;
        }
      `,
    };
  })();
};

const CustomRadioGroup = memo(
  ({ onChange, value, options = [] }: ICustomLightRadio) => {
    const { styles } = useCustomRadioGroupStyles();

    const defaultValue = options.find(o => o.isDefault)?.value;

    useMount(() => {
      onChange!(defaultValue);
    });

    return (
      <Radio.Group
        optionType="button"
        className={styles.radioGroupWrapper}
        defaultValue={defaultValue}
        value={value}
        buttonStyle="solid"
        style={{ display: 'flex', gap: 10 }}
        onChange={e => onChange!(e.target.value)}
      >
        {options.map(({ label, value: v, disabled }) => {
          return (
            <Radio
              key={label}
              value={v}
              disabled={disabled}
              className={styles.radio}
            >
              {label}
            </Radio>
          );
        })}
      </Radio.Group>
    );
  }
);

export default CustomRadioGroup;
