import { Flex } from 'antd';
import React from 'react';

import ProofSpin from './ProofSpin';

function Loading({ height = 500 }: { height?: string | number }) {
  return (
    <Flex
      justify="center"
      align="center"
      style={{
        margin: 'auto',
        height: height,
      }}
    >
      <ProofSpin width={50} />
    </Flex>
  );
}
export default Loading;
