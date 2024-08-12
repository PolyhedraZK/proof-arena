import { Col, Row } from 'antd';
import classNames from 'clsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Empty from '@/components/biz/problems/Empty';
import { IProblems } from '@/services/problems/types';

import { useProverStyles } from './index.style';
import ProblemsListItem from './ProblemsListItem';
import LoadingCard from './LoadingCard';


function ProversPage() {
  const { styles } = useProverStyles();
  const navigate = useNavigate();
  const [problemsListData, setProblemsListData] = useState<IProblems[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true)
    fetch('/problemData.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setProblemsListData(data?.filter(item => !item.draft));
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Fetch error:', error)
        setIsLoading(false)
      });
  }, []);

  return (
    <div className={classNames('main-container', styles.proversWrapper)}>
      <div className="my-provers">
        {problemsListData?.length ? (
          <Row gutter={[16, 16]}>
            {
              problemsListData.map(item => {
                const { problem_id } = item;
                return (
                  <Col
                    key={problem_id}
                    xs={{ flex: '100%' }}
                    sm={{ flex: '100%' }}
                    md={{ flex: '50%' }}
                    lg={{ flex: '33.33%' }}
                  >
                    <ProblemsListItem
                      onClick={() => navigate(`/problemsDetail/${problem_id}`)}
                      info={item} />
                  </Col>);
              })}
          </Row>
        ) : (isLoading ?
          <LoadingCard num={8} /> :
          <Empty />
        )}
      </div>
    </div>
  );
}

export default ProversPage;
