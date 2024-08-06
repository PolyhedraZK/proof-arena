import { Flex, Pagination } from 'antd';
import classNames from 'clsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Empty from '@/components/biz/problems/Empty';
import SubTitle from '@/components/biz/problems/SubTitle';
import { IProblems } from '@/services/problems/types';

import { useProverStyles } from './index.style';
import ProblemsListItem from './ProblemsListItem';

const pageSize = 10;

function ProversPage() {
  const { styles } = useProverStyles();
  const navigate = useNavigate();
  // 横向或者纵向展示
  const [layoutType, setLayoutType] = useState<'column' | 'row'>('column');
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsListData, setProblemsListData] = useState<IProblems[]>([]);

  useEffect(() => {
    fetch('/problemData.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setProblemsListData(data?.filter(item => !item.draft)))
      .catch(error => console.error('Fetch error:', error));
  }, []);

  return (
    <div className={classNames('main-container', styles.proversWrapper)}>
      <div className="my-provers">
        <SubTitle layoutType={layoutType} setLayoutType={setLayoutType} />
        {problemsListData?.length ? (
          <Flex
            vertical
            style={{
              height: 'calc(100vh - 300px)',
              minHeight: 400,
              overflow: 'hidden',
              overflowY: 'auto',
            }}
            gap={12}
            wrap="nowrap"
          >
            {problemsListData
              ?.slice(pageSize * currentPage - pageSize, currentPage * pageSize)
              .map(item => {
                const { problem_id } = item;
                return (
                  <div
                    onClick={() => navigate(`/problemsDetail/${problem_id}`)}
                    key={problem_id}
                  >
                    <ProblemsListItem info={item} />
                  </div>
                );
              })}
          </Flex>
        ) : (
          <Empty />
        )}
      </div>
      {problemsListData &&
      problemsListData.length &&
      problemsListData.length > 0 ? (
        <Pagination
          style={{ marginTop: 30, marginBottom: 20, textAlign: 'center' }}
          showSizeChanger={false}
          onChange={(page: number) => {
            setCurrentPage(page);
          }}
          defaultCurrent={1}
          pageSize={pageSize}
          total={problemsListData?.length}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default ProversPage;
