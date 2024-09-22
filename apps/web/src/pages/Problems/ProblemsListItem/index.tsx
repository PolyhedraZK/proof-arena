import { useRequest } from 'ahooks';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';

import CopySvg from '@/assets/icons/copy.svg';
import { IProblems } from '@/services/problems/types.ts';
import { IProblemsDetail } from '@/services/problems/types.ts';

import { useStyles } from './index.style.ts';

interface IproblemsListItemProps {
  info: IProblems;
  onClick: () => void;
}

const useSubmissionData = (submissionDataPath: string) => {
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    if (submissionDataPath) {
      fetch(submissionDataPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setTotalSubmissions(data?.length || 0);
        })
        .catch(error => console.log('no submission data'));
    }
  }, [submissionDataPath]);

  return { totalSubmissions };
};

const ProblemsListItem = ({ info, onClick }: IproblemsListItemProps) => {
  const { styles } = useStyles();
  const { Paragraph, Text } = Typography;
  const { data } = useRequest(() =>
    fetch('/problemData.json').then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
  );
  const detaileData: IProblemsDetail = data?.find(
    item => item.problem_id === Number(info.problem_id)
  );

  const submission_data_path = detaileData?.submission_data_path;
  const totalValidSubmissions =
    useSubmissionData(submission_data_path).totalSubmissions;

  return (
    <div
      onClick={onClick}
      className={styles.problemsDetailHeadBox}
      style={{
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text strong style={{ fontSize: '16px' }}>
            ID: <span style={{ color: '#1890ff' }}>{info.problem_id}</span>
          </Text>
          <Paragraph
            className={styles.copyStyle}
            copyable={{
              icon: (
                <img
                  src={CopySvg}
                  className={styles.icon}
                  alt="Copy icon"
                  style={{ width: '16px', height: '16px' }}
                />
              ),
              tooltips: false,
            }}
          >
            {info.problem_id}
          </Paragraph>
        </div>
        <Text
          className={styles.title}
          style={{ margin: '10px 0', fontSize: '20px', fontWeight: 'bold' }}
        >
          {info.title || '--'}
        </Text>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text>
            Total Valid Submissions:{' '}
            <Text strong style={{ color: '#52c41a' }}>
              {totalValidSubmissions}
            </Text>
          </Text>
          <Paragraph
            className={styles.copyStyle}
            copyable={{
              icon: (
                <img
                  src={CopySvg}
                  className={styles.icon}
                  alt="Copy icon"
                  style={{ width: '16px', height: '16px' }}
                />
              ),
              tooltips: false,
            }}
          >
            {totalValidSubmissions}
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default ProblemsListItem;
