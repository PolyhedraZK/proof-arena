import NiceModal from '@ebay/nice-modal-react';
import { Flex } from 'antd';
import classNames from 'clsx';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {problemsListData} from '@/consts/ProblemsData'
import Pagination from '@/components/biz/pagination';
import { CreateProverModalId } from '@/components/biz/problems/CreateProverModal';
import Empty from '@/components/biz/problems/Empty';
import SubTitle from '@/components/biz/problems/SubTitle';
import { useProverStyles } from './index.style';
import ProblemsListItem from './ProblemsListItem';
// import { getProvers } from '@/services/prover';
// import ProofSpin from '@/components/base/ProofSpin';
// import { useInterval, useRequest } from 'ahooks';

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

  // 展示create prover modal
  const showCreateProverModal = () => {
    NiceModal.show(CreateProverModalId).then(ret => {
      if (ret == 'success') {
        console.log('show 完成了...');
        // refreshPageList();
      } else {
        console.log('show failed...');
      }
    });
  };
  return (
    <div className={classNames('main-container', styles.proversWrapper)}>
      <div className="my-provers">
        <SubTitle
          layoutType={layoutType}
          setLayoutType={setLayoutType}
          handleCreate={showCreateProverModal}
        />
        { 
        // l1 && !isSlienceLoad ? (
        //   <Flex
        //     justify="center"
        //     align="center"
        //     style={{
        //       margin: 'auto',
        //       height: '500px',
        //     }}
        //   >
        //     <ProofSpin width={50} />
        //   </Flex>
        // ) :
          problemsListData?.data?.length ? (
            <Flex vertical style={{ height: 680, overflow: 'hidden', overflowY: 'auto' }} gap={12} wrap="wrap">
              {problemsListData.data.map((item) => {
                const { id } = item;
                return (
                  <div onClick={() => navigate(`/problemsDetail/${id}`)} key={id}>
                    <ProblemsListItem info={item} />
                  </div>
                );
              })}
            </Flex>
          ) : (
            <Empty handleCreate={showCreateProverModal} />
          )}
      </div>
      {problemsListData && problemsListData.total && problemsListData.total > 0 ? (
        <Pagination
          onChange={onPageChange}
          defaultPage={1}
          style={{ margin: -40 }}
          page={currentPage}
          count={Math.ceil(problemsListData.total / pageSize)}
        />
      ) : (
        <></>
      )}
      {/* <div className="public-provers">
          <p className="sub-tit" style={{ marginBottom: 24 }}>
            Public Provers
          </p>
          <Flex gap={24} wrap="wrap" justify="center">
            {l1 ? (
              <ProofSpin width={50} />
            ) : (
              publicProvers.map(item => {
                return (
                  <PublicProverCard
                    key={item.id}
                    handleBtnClick={() => {}}
                    handleClick={() => {}}
                    info={item}
                  />
                );
              })
            )}
          </Flex>
        </div> */}
    </div>
  );
}

export default ProversPage;
