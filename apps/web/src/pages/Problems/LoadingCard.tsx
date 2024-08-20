import { Col, Row, Skeleton } from 'antd';

import ProblemsListItem from './ProblemsListItem';

function numberToLengthArray(num: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < num; i++) {
    result.push(1); // 填充数组
  }
  return result;
}
const LoadingCard = ({ num }: { num: number }) => {
  return (
    <Row gutter={[16, 16]}>
      {numberToLengthArray(num)?.map((_, index) => (
        <Col
          key={index}
          xs={{ flex: '100%' }}
          sm={{ flex: '100%' }}
          md={{ flex: '50%' }}
          lg={{ flex: '33.33%' }}
        >
          <div
            style={{
              flex: 1,
              background: 'white',
              padding: '24px 20px 20px 20px',
              border: '1px solid rgba(43, 51, 45, 0.05)',
              backdropFilter: 'blur(25px)',
              borderRadius: 16,
              cursor: 'pointer',
            }}
          >
            <Skeleton />
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default LoadingCard;
