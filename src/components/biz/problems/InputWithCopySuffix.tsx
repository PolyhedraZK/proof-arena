import { useHover } from 'ahooks';
import { App, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import copy from 'copy-to-clipboard';
import { InputHTMLAttributes, useEffect, useRef, useState } from 'react';

import CopySvg from '@/assets/icons/copy.svg';
import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

const useStyles = createStyles(({ prefixCls, responsive, isDarkMode }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    inputWrapper: {
      borderRadius: '12px',
      border: `1px solid ${hex2rgba(colors.borderColor, 5)}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px 0 20px',
      height: '60px',
      '& input': {
        lineHeight: '160%',
        padding: 0,
        outline: 'none',
        border: 'none',
        flex: 1,
        fontSize: 16,
        width: '425px',
        maxWidth: '425px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '&.readonly': {
          opacity: '0.7',
        },
      },
    },
    icon: {
      cursor: 'pointer',
    },
    tooltip: {
      '& .proof-tooltip-inner': {
        padding: '16px',
      },
    },
  };
});

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (e: React.ChangeEvent<HTMLInputElement>, v: string) => void;
}
function InputWithCopySuffix(props: IProps) {
  const { styles, cx } = useStyles();
  const { message } = App.useApp();
  const ref = useRef(null);
  const [value, setValue] = useState<string>(props.defaultValue || '');

  useEffect(() => {
    if (props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  const onChange = e => {
    const v = e.target.value;
    props.onValueChange && props.onValueChange(e, v);
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      copy(value);
      message.success('Copied');
    }
  };
  const isHover = useHover(ref.current);

  useEffect(() => {
    if (!isHover) {
      setCopied(false);
    }
  }, [isHover]);

  return (
    <div className={cx(styles.inputWrapper, {})} ref={ref}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className={cx({
          readonly: props.readOnly,
        })}
      />
      <Tooltip
        placement="top"
        arrow
        title={copied ? 'Copied!' : 'Click to copy'}
        trigger="hover"
        overlayInnerStyle={{
          padding: '16px',
        }}
      >
        <img className={props.className} src={CopySvg} onClick={handleCopy} />
      </Tooltip>
    </div>
  );
}

export default InputWithCopySuffix;
