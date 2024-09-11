import { ConfigProvider, Pagination, Table } from 'antd';
import { useState } from 'react';

import BaseEmpty from '@/components/base/BaseEmpty.tsx';
import { IPSubmissionsTableItem } from '@/services/problems/types.ts';
import { formatNumber } from '@/utils/formatNumber';

import { useStyles } from './index.style.ts';
const SubmissionsTable = ({
  dataSource,
}: {
  dataSource: IPSubmissionsTableItem[] | undefined;
}) => {
  const pageSize = 8;
  const { styles } = useStyles();
  const [page, setPage] = useState(1);
  const createTableHead = (title: string) => (
    <div className={styles.titleSpanStyle}>{title}</div>
  );
  const columns = [
    {
      title: createTableHead('Prover Name'),
      dataIndex: 'prover_name',
      key: 'prover_name',
    },
    {
      title: createTableHead('Proof System'),
      dataIndex: 'proof_system',
      key: 'proof_system',
    },
    {
      title: createTableHead('Algorithm'),
      dataIndex: 'algorithm',
      key: 'algorithm',
    },
    {
      title: createTableHead('Setup time（seconds）'),
      width: 200,
      dataIndex: 'setup_time',
      key: 'setup_time',
      render: function (text) {
        return formatNumber(text);
      },
    },
    {
      title: (
        <div className={styles.TableTitle}>
          <div>Witness generation</div>
          <div>time（seconds）</div>
        </div>
      ),
      width: 180,
      dataIndex: 'witness_generation_time',
      key: 'witness_generation_time',
      render: function (text) {
        return formatNumber(text);
      },
    },
    {
      title: (
        <div className={styles.TableTitle}>
          <div>Proof generation</div>
          <div>time（seconds）</div>
        </div>
      ),
      width: 200,
      dataIndex: 'proof_generation_time',
      key: 'proof_generation_time',
      render: function (text) {
        return formatNumber(text);
      },
    },
    {
      title: (
        <div className={styles.TableTitle}>
          <div>Verification</div>
          <div>time（seconds）</div>
        </div>
      ),
      width: 200,
      dataIndex: 'verify_time',
      key: 'verify_time',
      render: function (text) {
        return formatNumber(text);
      },
    },
    {
      title: createTableHead('Peak memory（KB）'),
      width: 180,
      dataIndex: 'peak_memory',
      key: 'peak_memory',
    },
    {
      title: createTableHead('Proof size（Byte）'),
      width: 150,
      dataIndex: 'proof_size',
      key: 'proof_size',
    },
    {
      title: createTableHead('Instance Number'),
      dataIndex: 'n',
      key: 'n',
    },
  ];

  return (
    <>
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
            pagination={false}
            locale={{
              emptyText: (
                <BaseEmpty
                  style={{ margin: '76px auto 126px auto' }}
                  description={'No Submissions'}
                />
              ),
            }}
            rowKey={'prover_name'}
            className={styles.tableStyle}
            bordered={false}
            scroll={{ x: 1700 }}
            columns={columns}
            dataSource={
              dataSource?.slice(page * pageSize - pageSize, page * pageSize) ||
              []
            }
          />
        </div>
        {dataSource?.length && dataSource?.length > 8 ? (
          <Pagination
            onChange={(page: number) => {
              setPage(page);
            }}
            showSizeChanger={false}
            className={styles.paginationStyle}
            defaultCurrent={1}
            pageSize={pageSize}
            total={dataSource?.length}
          />
        ) : null}
      </ConfigProvider>
    </>
  );
};

export default SubmissionsTable;
