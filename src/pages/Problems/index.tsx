import { Flex } from 'antd';
import classNames from 'clsx';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import Pagination from '@/components/biz/pagination';
import Empty from '@/components/biz/problems/Empty';
import SubTitle from '@/components/biz/problems/SubTitle';
import { problemsListData } from '@/consts/ProblemsData';

import { useProverStyles } from './index.style';
import ProblemsListItem from './ProblemsListItem';

const pageSize = 9;

function ProversPage() {
  const { styles } = useProverStyles();
  const navigate = useNavigate();
  // 横向或者纵向展示
  const [layoutType, setLayoutType] = useState<'column' | 'row'>('column');
  const [currentPage, setCurrentPage] = useState(1);

  // 当page变化的时候，采取重新请求数据
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={classNames('main-container', styles.proversWrapper)}>
      <div className="my-provers">
        <SubTitle layoutType={layoutType} setLayoutType={setLayoutType} />
        {problemsListData?.data?.length ? (
          <Flex
            vertical
            style={{
              height: 'calc(100vh - 300px)',
              overflow: 'hidden',
              overflowY: 'auto',
            }}
            gap={12}
            wrap="nowrap"
          >
            {problemsListData.data.map(item => {
              const { id } = item;
              return (
                <div onClick={() => navigate(`/problemsDetail/${id}`)} key={id}>
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
      problemsListData.total &&
      problemsListData.total > 0 ? (
        <Pagination
          style={{ marginTop: 30, marginBottom: 20 }}
          onChange={onPageChange}
          defaultPage={1}
          page={currentPage}
          count={Math.ceil(problemsListData.total / pageSize)}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default ProversPage;
