import { useRequest } from 'ahooks';
import { ConfigProvider, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';

import { useStyles } from './index.style.ts';

interface PRStatus {
  branch: string;
  status: 'open' | 'closed' | 'merged';
  link: string;
  time: string;
  prNumber: number;
}

const StatusPage: React.FC = () => {
  const { styles } = useStyles();

  const { data: prStatuses, loading } = useRequest<PRStatus[], never>(
    async () => {
      let allPRs = [];
      let page = 1;
      const perPage = 100; // GitHub API maximum per page

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await fetch(
          `https://api.github.com/repos/PolyhedraZK/proof-arena/pulls?state=all&per_page=${perPage}&page=${page}`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );

        if (!response.ok) {
          console.error(
            'GitHub API request failed:',
            response.status,
            response.statusText
          );
          throw new Error(
            `GitHub API request failed: ${response.status} ${response.statusText}`
          );
        }

        const prs = await response.json();
        if (prs.length === 0) {
          break; // No more PRs to fetch
        }

        allPRs = allPRs.concat(prs);
        page++;

        // Check if we've reached the last page
        const linkHeader = response.headers.get('Link');
        if (!linkHeader || !linkHeader.includes('rel="next"')) {
          break;
        }
      }

      console.log(`Total PRs fetched: ${allPRs.length}`);

      return allPRs
        .filter(
          pr =>
            pr.title.startsWith('Auto-submission: Problem ID:') ||
            pr.title.startsWith('Auto-update:')
        )
        .map(pr => {
          let branch, titleTime, problemId, proverName;

          if (pr.title.startsWith('Auto-submission: Problem ID:')) {
            const match = pr.title.match(
              /Auto-submission: Problem ID: (\d+), PROVER: ([^,]+), Branch: \[(.+?) \((.+?)\)\]/
            );
            if (match) {
              problemId = parseInt(match[1]);
              proverName = match[2];
              branch = match[3];
              titleTime = match[4];
            }
          }

          return {
            problemId: problemId || null,
            proverName: proverName || null,
            branch: branch || pr.head.ref,
            status: pr.merged_at ? 'merged' : pr.state,
            link: pr.html_url,
            time: titleTime || pr.created_at,
            prNumber: pr.number,
          };
        });
    }
  );
  const columns: ColumnsType<PRStatus> = [
    {
      title: 'Problem ID',
      dataIndex: 'problemId',
      key: 'problemId',
      render: (problemId: number | null) =>
        problemId ? (
          <a
            href={`https://proofarena.org/problems/${problemId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {problemId}
          </a>
        ) : (
          'Initial Submission'
        ),
    },
    {
      title: 'PROVER',
      dataIndex: 'proverName',
      key: 'proverName',
      render: (proverName: string | null) =>
        proverName ? <span>{proverName}</span> : 'Initial Submission',
    },
    {
      title: 'PR Branch',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'closed') {
          color = 'red';
        } else if (status === 'merged') {
          color = 'green';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'PR Link',
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          View PR
        </a>
      ),
    },
    {
      title: 'UTC Time',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      sortDirections: ['descend', 'ascend'],
    },
  ];

  return (
    <div className="main-container">
      <h1>Auto-submission PR Status</h1>
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
            columns={columns}
            dataSource={prStatuses}
            loading={loading}
            rowKey="prNumber"
            pagination={{
              pageSize: 50,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            className={styles.tableStyle}
          />
        </div>
      </ConfigProvider>
    </div>
  );
};

export default StatusPage;
