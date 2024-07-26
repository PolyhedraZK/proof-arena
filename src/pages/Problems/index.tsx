import NiceModal from '@ebay/nice-modal-react';
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
  // const [isSlienceLoad, setIsSlienceLoad] = useState(false);
  // 获取我的provers
  // const {
  //   data: problemsListData,
  //   runAsync: fetchProvers,
  //   refreshAsync: refreshPageList,
  //   loading: l1,
  // } = useRequest(getProvers, {
  //   manual: true,
  // });

  // // todo 方便调试modal样式，完成时注释掉
  // useEffect(() => {
  //   showCreateProverModal();
  // }, []);

  // 静默轮询
  // useInterval(async () => {
  //   setIsSlienceLoad(true);
  //   await refreshPageList();
  //   setIsSlienceLoad(false);
  // }, 30 * 1000);

  // 当page变化的时候，采取重新请求数据
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  // useEffect(() => {
  //   fetchProvers({
  //     visibility: 1,
  //     offset: currentPage,
  //     limit: pageSize,
  //     account: import.meta.env.DEV ? 'test-account-1' : undefined,
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentPage]);

  // const { data, refresh, loading: l1 } = useRequest(getProvers);

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
