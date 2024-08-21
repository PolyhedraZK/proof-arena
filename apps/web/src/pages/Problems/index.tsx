// apps/web/src/pages/Problems/index.tsx

import { useRequest } from 'ahooks';
import { Col, Row, Tabs } from 'antd';
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router';

import Empty from '@/components/biz/problems/Empty';
import { IProblems } from '@/services/problems/types';

import { useProverStyles } from './index.style';
import LoadingCard from './LoadingCard';
import ProblemsListItem from './ProblemsListItem';

const { TabPane } = Tabs;

function ProversPage() {
  const { styles } = useProverStyles();
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState('zk-prover');

  const { data: problemData, loading } = useRequest(() =>
    fetch('/problemData.json').then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
  );

  const problemsListData: IProblems[] =
    problemData?.filter(item => !item.draft && item.problem_id > 0) || [];
  const zkProverProblems = problemsListData.filter(
    item => item.track !== 'zkVM'
  );
  const zkVMProblems = problemsListData.filter(item => item.track === 'zkVM');

  const renderProblems = (problems: IProblems[]) => (
    <Row gutter={[16, 16]}>
      {problems.map(item => {
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
              onClick={() => navigate(`/problems/${problem_id}`)}
              info={item}
            />
          </Col>
        );
      })}
    </Row>
  );

  return (
    <div className={`main-container ${styles.proversWrapper}`}>
      <Tabs activeKey={activeTrack} onChange={setActiveTrack}>
        <TabPane
          tab={<span className={styles.tabTitle}>ZK Prover Track</span>}
          key="zk-prover"
        >
          <div className="my-provers">
            {loading ? (
              <LoadingCard num={8} />
            ) : (
              <Fragment>
                {zkProverProblems.length > 0 ? (
                  renderProblems(zkProverProblems)
                ) : (
                  <Empty />
                )}
              </Fragment>
            )}
          </div>
        </TabPane>
        <TabPane
          tab={<span className={styles.tabTitle}>zkVM Track</span>}
          key="zkvm"
        >
          <div className="my-provers">
            {loading ? (
              <LoadingCard num={8} />
            ) : (
              <Fragment>
                {zkVMProblems.length > 0 ? (
                  renderProblems(zkVMProblems)
                ) : (
                  <Empty />
                )}
              </Fragment>
            )}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default ProversPage;
