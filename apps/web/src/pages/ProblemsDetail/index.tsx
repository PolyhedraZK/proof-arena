import Icon, { UnorderedListOutlined } from '@ant-design/icons';
import Giscus from '@giscus/react';
import { useRequest } from 'ahooks';
import { Avatar, Breadcrumb, Flex, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import analysisCharts from '@/assets/icons/analysis-charts.svg';
import analysisChartsAction from '@/assets/icons/analysis-charts-action.svg';
import ArrowDonw from '@/assets/icons/arrow-donw.svg?r';
import ArrowUpper from '@/assets/icons/arrow-upper.svg?r';
import CopySvg from '@/assets/icons/copy.svg';
import Loading from '@/assets/icons/loading.svg?r';
import BaseButton from '@/components/base/BaseButton.tsx';
import CustomTitle from '@/components/base/CustomTitle.tsx';
import MdDescription from '@/components/MdDescription/index.tsx';
import { giscusConfig } from '@/config/giscus';
import {
  IProblemsDetail,
  IPSubmissionsTableItem,
} from '@/services/problems/types.ts';
import isImageByLoading from '@/utils/checkImg.ts';

import SubmissionsChart from './components/SubmissionsChart';
import SubmissionsTable from './components/SubmissionsTable';
import { useStyles } from './index.style.ts';

const ProblemsDetail = () => {
  const navigate = useNavigate();
  const { detailId } = useParams();
  const { Paragraph, Text } = Typography;
  const [checkedUI, setCheckedUI] = useState(true);
  const [iconUrl, setIconUrl] = useState(true);
  const [avatar, setAvatar] = useState<string>('');
  const [more, setMore] = useState(false);
  const { styles, cx } = useStyles();
  const [dataSource, setDataSource] = useState<IPSubmissionsTableItem[]>([]);

  const { data, loading } = useRequest(() =>
    fetch('/problemData.json').then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
  );
  const detaileData: IProblemsDetail = data?.find(
    item => item.problem_id === Number(detailId)
  );
  const autoHeightDesMd =
    detaileData?.details && detaileData?.details?.length > 1000;
  useEffect(() => {
    isImageByLoading(detaileData?.proposer_icon).then(imgUrl =>
      setAvatar(imgUrl)
    );
    detaileData &&
      fetch(detaileData?.submission_data_path)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          data?.sort((a, b) => a.prover_name.localeCompare(b.prover_name));
          setDataSource(data || []);
        })
        .catch(error => console.log('no submission data'));
  }, [detaileData]);

  const onGoBack = () => {
    navigate('/problems');
    localStorage.removeItem('tabKey');
  };
  return (
    <div className={styles.ProblemsDetailBox}>
      <Breadcrumb
        items={[
          {
            title: <a onClick={onGoBack}>Problems</a>,
          },
          {
            title: detaileData?.title,
          },
        ]}
      />
      <Spin
        spinning={loading}
        indicator={<Icon className={styles.loadingPis} component={Loading} />}
      >
        <div
          className={cx(
            styles.headBox,
            more && styles.heightAuto,
            !autoHeightDesMd && styles.heightAuto
          )}
        >
          <div className={styles.problemsDetailHeadBox}>
            <div className={styles.boxSpace}>
              <div className={styles.boxSpace}>
                <span className={styles.title}>
                  <div className={styles.titleBlock} />
                  {detaileData?.title}
                </span>
                <Text>
                  <Text>ID: </Text>
                  <Paragraph
                    className={styles.copyStyle}
                    copyable={{
                      icon: <img src={CopySvg} className={styles.icon} />,
                      tooltips: false,
                    }}
                  >
                    {detaileData?.problem_id}
                  </Paragraph>
                </Text>
              </div>
            </div>
            <div className={cx(styles.boxSpace, styles.headBoxBtom)}>
              <div className={styles.headBoxBtomTitle}>
                <Avatar
                  style={{ border: 'none' }}
                  size={24}
                  icon={<img src={avatar} />}
                />
                <span>{detaileData?.proposer}</span>
              </div>
            </div>
          </div>
          {detaileData?.details && (
            <div className={styles.problemsDescriptionBox}>
              <MdDescription mdFile={detaileData?.details || ''} />
            </div>
          )}
          {autoHeightDesMd && (
            <div
              className={cx(
                styles.headBoxChangeHeight,
                more && styles.headBoxChange
              )}
            >
              <BaseButton
                className={styles.baseBtnStyle}
                onClick={() => setMore(!more)}
              >
                {!more ? (
                  <Flex gap={6} align="center">
                    <span>View more</span> <ArrowDonw />
                  </Flex>
                ) : (
                  <Flex gap={6} align="center">
                    <span>View less</span> <ArrowUpper />
                  </Flex>
                )}
              </BaseButton>
            </div>
          )}
        </div>
        <div className={styles.problemsDetailMainBox}>
          <div className={styles.customTitleBox}>
            <CustomTitle
              title={'Submissions'}
              suffix={
                <BaseButton
                  className={styles.baseBtn}
                  onClick={() => setCheckedUI(!checkedUI)}
                  onMouseOver={() => setIconUrl(true)}
                  onMouseOut={() => setIconUrl(false)}
                  style={{ display: 'flex' }}
                >
                  {checkedUI ? (
                    <img
                      src={iconUrl ? analysisChartsAction : analysisCharts}
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <UnorderedListOutlined
                      style={{
                        color: iconUrl ? '#2B332D' : '#999',
                        fontSize: 20,
                      }}
                    />
                  )}
                  {checkedUI ? 'Analysis Charts' : 'List View'}
                </BaseButton>
              }
            />
          </div>

          {checkedUI ? (
            <SubmissionsTable dataSource={dataSource} />
          ) : (
            <SubmissionsChart chartData={dataSource || []} />
          )}
        </div>
        <div className={styles.problemsDetailMainBox}>
          <div className={styles.customTitleBox}>
            <CustomTitle title={'Discussions'} />
          </div>
          {detaileData?.enable_comments && (
            <Giscus
              {...giscusConfig}
              term={`Problem ${detaileData.problem_id}: ${detaileData.title}`}
            />
          )}
        </div>
      </Spin>
    </div>
  );
};

export default ProblemsDetail;
