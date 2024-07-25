import { useMount } from 'ahooks';
import { ConfigProvider, Flex, Radio } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

export interface ICustomRadio {
  value?: any;
  onChange?: (val: any) => void;
  options?: { label: string; value: any; desc: string; isDefault?: boolean }[];
}

const useCustomRadioGroupStyles = () => {
  const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);
  const radioPrefixCls = getPrefixCls('radio');

  return createStyles(({ css, isDarkMode }) => {
    const colors = isDarkMode
      ? customThemeVariables.dark
      : customThemeVariables.light;
    return {
      radioGroupWrapper: css`
        gap: 16px;
        .${radioPrefixCls}-wrapper {
          position: relative;
          height: auto !important;
          padding: 12px 12px 12px 16px !important;
          margin-right: 0;
          flex: 1;
          border: 1px solid ${hex2rgba(colors.borderColor, 10)};
          color: ${colors.textColor};
          border-radius: 12px !important;
          .${radioPrefixCls} {
            position: absolute;
            top: 0;
            right: 12px;
            bottom: 0;
            margin: auto;
          }
          .${radioPrefixCls}-checked {
            .${radioPrefixCls}-inner {
              border: 2px solid ${colors.primaryBtnBgColor};
              background-color: transparent;
              &::after {
                background: ${colors.primaryBtnBgColor};
              }
            }
          }
          .${radioPrefixCls}-inner {
            border: 2px solid #8a8b8a;
          }
          .tit {
            font-size: 16px;
            line-height: 26px;
          }
          .desc {
            font-size: 12px;
            opacity: 0.3;
          }
        }
        .${radioPrefixCls}-wrapper-checked {
        }
      `,
    };
  })();
};

const CustomRadioGroup = memo(
  ({ onChange, value, options = [] }: ICustomRadio) => {
    const { styles } = useCustomRadioGroupStyles();

    const defaultValue = options.find(o => o.isDefault)?.value;

    useMount(() => {
      onChange!(defaultValue);
    });

    return (
      <Radio.Group
        className={styles.radioGroupWrapper}
        defaultValue={defaultValue}
        value={value}
        style={{ display: 'flex', gap: 10 }}
        onChange={e => onChange!(e.target.value)}
      >
        {options.map(({ label, value: v, desc }) => {
          return (
            <Radio
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 30,
                padding: 8,
                borderRadius: 4,
              }}
              value={v}
            >
              <Flex vertical>
                <span className="tit">{label}</span>
                <span className="desc">{desc}</span>
              </Flex>
            </Radio>
          );
        })}
      </Radio.Group>
    );
  }
);

export default CustomRadioGroup;
