import { useRequest } from 'ahooks';
import { Col, Row } from 'antd';
import classNames from 'clsx';
import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Empty from '@/components/biz/problems/Empty';
import { IProblems } from '@/services/problems/types';

import { useProverStyles } from './index.style';
import LoadingCard from './LoadingCard';
import ProblemsListItem from './ProblemsListItem';

function ProversPage() {
  const { styles } = useProverStyles();
  const navigate = useNavigate();
  const { data, loading } = useRequest(() =>
    fetch('/problemData.json').then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
  );
  const problemsListData: IProblems[] = data?.filter(item => !item.draft) || [];

  return (
    <div className={classNames('main-container', styles.proversWrapper)}>
      <div className="my-provers">
        {loading ? (
          <LoadingCard num={8} />
        ) : (
          <Fragment>
            {problemsListData?.length > 0 ? (
              <Row gutter={[16, 16]}>
                {problemsListData.map(item => {
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
                        onClick={() =>
                          navigate(`/problemsDetail/${problem_id}`)
                        }
                        info={item}
                      />
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <Empty />
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
}

export default ProversPage;
