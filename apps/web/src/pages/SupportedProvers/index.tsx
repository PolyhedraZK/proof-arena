import { useRequest } from 'ahooks';
import { ConfigProvider, Pagination, Table } from 'antd';
import React, { useState } from 'react';

import BaseEmpty from '@/components/base/BaseEmpty';

import { useStyles } from './index.style.ts';

interface ProverInfo {
  name: string;
  status: string;
  inventor: string;
  type: string;
}
interface requestType {
  data?: ProverInfo[];
  loading: boolean;
}

const SupportedProversPage: React.FC = () => {
  const pageSize = 8;
  const { styles } = useStyles();
  const [page, setPage] = useState(1);
  const { data: provers, loading }: requestType = useRequest(() =>
    fetch('/supportedProvers.json').then(res => res.json())
  );
  const provers_sort = provers?.sort((a, b) => a.name.localeCompare(b.name));
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
      <div className={styles.titleContainer}>
        Supported Provers <div className={styles.green} />
      </div>
      <div className={styles.backBox}>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: 'rgba(43, 51, 45, 0.03)',
                headerSplitColor: 'none',
                cellPaddingBlockMD: 20,
                cellPaddingInlineMD: 12,
                colorText: '#2B332D',
              },
            },
          }}
        >
          <div className={styles.tableBox}>
            <Table
              size="middle"
              loading={loading}
              pagination={false}
              scroll={{ x: 600 }}
              locale={{
                emptyText: (
                  <BaseEmpty
                    style={{ margin: '76px auto 126px auto' }}
                    description={'No Data'}
                  />
                ),
              }}
              rowKey={'name'}
              className={styles.tableStyle}
              bordered={false}
              columns={columns}
              dataSource={
                provers_sort?.slice(
                  page * pageSize - pageSize,
                  page * pageSize
                ) || []
              }
            />
          </div>
          {provers_sort?.length && provers_sort?.length > 8 ? (
            <Pagination
              onChange={(page: number) => {
                setPage(page);
              }}
              showSizeChanger={false}
              className={styles.paginationStyle}
              defaultCurrent={1}
              pageSize={pageSize}
              total={provers_sort?.length}
            />
          ) : null}
        </ConfigProvider>
      </div>
    </div>
  );
};

export default SupportedProversPage;
