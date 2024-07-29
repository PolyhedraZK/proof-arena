import { theme } from 'antd';
import { memo } from 'react';

import SpinSvg from '@/assets/spin.svg?r';

interface IProps {
  width?: number;
}
const { useToken } = theme;

const ProofSpin = memo(({ width = 54 }: IProps) => {
  const { token } = useToken();
  return (
    <SpinSvg
      className="spin"
      style={{
        width,
        animation: 'spin 1.5s linear infinite',
        color: token.colorPrimary,
      }}
    />
  );
});

export default ProofSpin;
