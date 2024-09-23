import { Button, Card, Flex, Layout } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import React from 'react';
import { Link } from 'react-router-dom';

import ChatInterface from '@/components/ChatInterface';

const { Content } = Layout;

const useStyles = createStyles(({ responsive, css }) => ({
  container: css`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    width: 100%;
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
  card: {
    width: 'calc(33% - 20px)',
    borderRadius: 16,
    background: '#fff',
    color: 'rgba(43, 51, 45, 0.60)',
    [responsive.mobile]: {
      width: '100%',
    },
  },
  cardTitle: {
    color: '#2B332D',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Poppins',
  },
  titleLevel2: {
    color: '#2B332D',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 500,
    marginBottom: 24,
  },
  desc: {
    color: 'rgba(43, 51, 45, 0.60)',
    fontSize: 16,
    fontWeight: 400,
    fontFamily: 'Poppins',
    marginBottom: 60,
  },
  headerDesc: {
    color: 'rgba(43, 51, 45, 0.60)',
    fontSize: 16,
    fontWeight: 500,
    fontFamily: 'Poppins',
    marginBottom: 60,
  },
  titleStyle: {
    fontSize: 32,
    fontWeight: 600,
    fontFamily: 'Poppins',
    color: '#2B332D',
  },
}));

const HomePage: React.FC = () => {
  const { styles } = useStyles();
  const { mobile } = useResponsive();
  const cardList = [
    {
      title: <span className={styles.cardTitle}>ZK Prover Track</span>,
      text: 'Benchmark various ZK proving systems on standard cryptographic problems.',
    },
    {
      title: <span className={styles.cardTitle}>zkVM Track</span>,
      text: 'Test and compare different Zero-Knowledge Virtual Machines on computational tasks.',
    },
    {
      title: <span className={styles.cardTitle}>Open Contribution</span>,
      text: 'Submit new problems or contribute solutions to existing challenges.',
    },
  ];
  return (
    <Layout>
      <Content className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleStyle}>Welcome to Proof Arena</div>
          <div className={styles.headerDesc}>
            An open platform for benchmarking zero-knowledge (ZK) algorithms
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.titleLevel2}>Our Mission</div>
          <div className={styles.desc}>
            Proof Arena aims to provide a fair, reproducible, and comprehensive
            benchmarking environment for ZK technologies. We invite researchers,
            developers, and enthusiasts to contribute problems and solutions,
            fostering innovation in the ZK space.
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.titleLevel2}>Key Features</div>
          <div className={styles.cardContainer}>
            {cardList.map((item, index) => (
              <Card
                key={index}
                bordered={false}
                title={item.title}
                className={styles.card}
              >
                {item.text}
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.titleLevel2}>Chat with Proof Arena AI</div>
          <ChatInterface />
        </section>
      </Content>
    </Layout>
  );
};

export default HomePage;
