import React from 'react';
import { Typography, Layout, Space, Card, Button } from 'antd';
import { Link } from 'react-router-dom';
import { createStyles } from 'antd-style';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  `,
  header: css`
    text-align: center;
    margin-bottom: 40px;
  `,
  section: css`
    margin-bottom: 40px;
  `,
  cardContainer: css`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  `,
  card: css`
    width: calc(33% - 20px);
    @media (max-width: 768px) {
      width: 100%;
    }
  `,
}));

const HomePage: React.FC = () => {
  const { styles } = useStyles();

  return (
    <Layout>
      <Content className={styles.container}>
        <header className={styles.header}>
          <Title>Welcome to Proof Arena</Title>
          <Paragraph>
            An open platform for benchmarking zero-knowledge (ZK) algorithms
          </Paragraph>
        </header>

        <section className={styles.section}>
          <Title level={2}>Our Mission</Title>
          <Paragraph>
            Proof Arena aims to provide a fair, reproducible, and comprehensive benchmarking 
            environment for ZK technologies. We invite researchers, developers, and enthusiasts 
            to contribute problems and solutions, fostering innovation in the ZK space.
          </Paragraph>
        </section>

        <section className={styles.section}>
          <Title level={2}>Key Features</Title>
          <div className={styles.cardContainer}>
            <Card title="ZK Prover Track" className={styles.card}>
              Benchmark various ZK proving systems on standard cryptographic problems.
            </Card>
            <Card title="zkVM Track" className={styles.card}>
              Test and compare different Zero-Knowledge Virtual Machines on computational tasks.
            </Card>
            <Card title="Open Contribution" className={styles.card}>
              Submit new problems or contribute solutions to existing challenges.
            </Card>
          </div>
        </section>

        <section className={styles.section}>
          <Title level={2}>Get Started</Title>
          <Space>
            <Button type="primary" size="large">
              <Link to="/problems">Explore Problems</Link>
            </Button>
            <Button size="large">
              <Link to="/how-to-contribute">How to Contribute</Link>
            </Button>
          </Space>
        </section>
      </Content>
    </Layout>
  );
};

export default HomePage;