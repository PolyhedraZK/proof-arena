import React from 'react';
import { Table } from 'antd';
import { createStyles } from 'antd-style';
import { useRequest } from 'ahooks';

const useStyles = createStyles(({ token }) => ({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
}));

interface ProverInfo {
  name: string;
  status: string;
  inventor: string;
  type: string;
}

const SupportedProversPage: React.FC = () => {
  const { styles } = useStyles();

  const { data: provers, loading } = useRequest<ProverInfo[]>(() => 
    fetch('/supportedProvers.json').then(res => res.json())
  );

  const columns = [
    {
      title: 'Prover Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Integration Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Inventor',
      dataIndex: 'inventor',
      key: 'inventor',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Supported Provers</h1>
      <Table 
        dataSource={provers} 
        columns={columns} 
        loading={loading}
        rowKey="name"
      />
    </div>
  );
};

export default SupportedProversPage;