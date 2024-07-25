import { Table, ConfigProvider, Pagination } from 'antd'
import { useStyles } from './index.style.ts'
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { IProblemsDetail } from '@/services/problems/types.ts'
const SubmissionsTable = ({ dataSource }: { dataSource: IProblemsDetail['submissionsTableData'] | undefined }) => {
  const { styles } = useStyles()
  const createTableHead = (title: string) => (<div className={styles.titleSpanStyle}>{title}</div>)
  const createStatus = (status: string) => {
    const statusItem = {
      pending: {
        icon: <LoadingOutlined style={{ color: '#F09C1D' }} />,
        name: 'Pending'
      },
      running: {
        icon: <LoadingOutlined style={{ color: '#34A853' }} />,
        name: 'Running'
      },
      completed: {
        icon: <CheckCircleOutlined style={{ color: '#34A853' }} />,
        name: 'Completed'
      }
    }
    return <span>
      {statusItem[status].icon}&nbsp;&nbsp;
      <span>{statusItem[status].name}</span>
    </span>
  }
  const columns = [
    {
      title: createTableHead('Task ID'),
      dataIndex: 'id',
      key: 'id',
    },
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
      title: createTableHead('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (createStatus(status))
    },
    {
      title: createTableHead('Setup time'),
      dataIndex: 'setup_time',
      key: 'setup_time',
      render: (text: string) => (`${text}s`)
    },
    {
      title: <div className={styles.TableTitle}>
        <div>Witness</div>
        <div>generation time</div>
      </div>,
      dataIndex: 'witness_generation_time',
      key: 'witness_generation_time',
      render: (text: string) => (`${text}s`)
    },
    {
      title: <div className={styles.TableTitle}>
        <div>Proof</div>
        <div>generation time</div>
      </div>,
      dataIndex: 'proof_generation_time',
      key: 'proof_generation_time',
      render: (text: string) => (`${text}s`)
    },
    {
      title: <div className={styles.TableTitle}>
        <div>Verification</div>
        <div>time</div>
      </div>,
      dataIndex: 'verify_time',
      key: 'verify_time',
      render: (text: string) => (`${text}s`)
    },
    {
      title: createTableHead('Peak memory'),
      dataIndex: 'peak_memory',
      key: 'peak_memory',
      render: (text: string) => (`${text}MB`)
    },
    {
      title: createTableHead('Proof size'),
      dataIndex: 'proof_size',
      key: 'proof_size',
      render: (text: string) => (`${text}KB`)
    },
  ]

  return <div className={styles.submissionsTableBox}>
    <ConfigProvider theme={{
      components: {
        Table: {
          headerBg: '#fff',
          colorBgContainer: 'linear-gradient(0deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.50) 100%), #F8F9FA',
          headerSplitColor: 'none',
          cellPaddingBlockMD: 20,
          cellPaddingInlineMD: 12,
          colorText: '#2B332D',
        }
      }
    }}>
      <Table
        size='middle'
        rowKey={(record) => record.id}
        pagination={false}
        className={styles.tableStyle}
        bordered={false}
        scroll={{ x: 'calc(100% + 50%)' }} columns={columns} dataSource={dataSource || []} />
      <Pagination
        className={styles.paginationStyle}
        defaultCurrent={1} total={3} />
    </ConfigProvider>
  </div>
}

export default SubmissionsTable