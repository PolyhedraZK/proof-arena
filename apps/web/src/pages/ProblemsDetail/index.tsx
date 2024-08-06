import { LeftOutlined, UnorderedListOutlined } from '@ant-design/icons';
import Giscus from '@giscus/react';
import { Avatar, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import analysisCharts from '@/assets/icons/analysis-charts.svg';
import analysisChartsAction from '@/assets/icons/analysis-charts-action.svg';
import CopySvg from '@/assets/icons/copy.svg';
import user_avatar from '@/assets/user_avatar.svg';
import BaseButton from '@/components/base/BaseButton.tsx';
import CustomTitle from '@/components/base/CustomTitle.tsx';
import {
  IProblemsDetail,
  IPSubmissionsTableItem,
} from '@/services/problems/types.ts';
import isImageByLoading from '@/utils/checkImg.ts';

import ProblemsDescription from '../ProblemsDescription/index.tsx';
import SubmissionsChart from './components/SubmissionsChart';
import SubmissionsTable from './components/SubmissionsTable';
import { useStyles } from './index.style.ts';

type BaseGiscusConfig = {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
};
const giscusConfig: BaseGiscusConfig = {
  repo: import.meta.env.VITE_APP_GISCUS_REPO_NAME as `${string}/${string}`,
  repoId: import.meta.env.VITE_APP_GISCUS_REPO_ID,
  category: import.meta.env.VITE_APP_GISCUS_CATEGORY,
  categoryId: import.meta.env.VITE_APP_GISCUS_CATEGORY_ID,
};
const ProblemsDetail = () => {
  const navigate = useNavigate();
  const { detailId } = useParams();
  const { Paragraph, Text } = Typography;
  const { styles, cx } = useStyles();
  const [checkedUI, setCheckedUI] = useState(true);
  const [iconUrl, setIconUrl] = useState(true);
  const [detaileData, setDetaileData] = useState<IProblemsDetail>();
  const [dataSource, setDataSource] = useState<IPSubmissionsTableItem[]>();
  const [avatar, setAvatar] = useState<string>('');

  useEffect(() => {
    fetch('/problemData.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data =>
        setDetaileData(data.find(item => item.problem_id === Number(detailId))),
      )
      .catch(error => console.error('Fetch error:', error));
  }, [detailId]);

  useEffect(() => {
    isImageByLoading(detaileData?.proposer_icon).then(imgUrl =>
      setAvatar(imgUrl),
    );

    detaileData?.submission_data_path &&
      fetch(detaileData?.submission_data_path)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(res => setDataSource(res))
        .catch(error => console.error('Fetch error:', error));
  }, [detaileData]);

  const onGoBack = () => {
    navigate('/problems');
    localStorage.removeItem('tabKey');
  };
  return (
    <div className={styles.ProblemsDetailBox}>
      <div className={styles.problemsDetailHeadBox}>
        <div className={styles.boxSpace}>
          <div className={styles.boxSpace}>
            <LeftOutlined onClick={onGoBack} />
            <span className={styles.title}>{detaileData?.title}</span>
            <Text>
              <Text type="secondary">ID: </Text>
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
            <Avatar size={24} icon={<img src={avatar} />} />
            <span>{detaileData?.proposer}</span>
          </div>
        </div>
      </div>
      {detaileData?.description && (
        <div className={styles.problemsDetailMainBox}>
          <div className={cx(styles.customTitleBox, styles.customTitleBottom)}>
            <CustomTitle title={'Details'} />
          </div>
          <div className={styles.problemsDescriptionBox}>
            <ProblemsDescription mdFile={detaileData?.details || ''} />
          </div>
        </div>
      )}
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
            mapping="url"
            term="Welcome to Proof Arena"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="1"
            inputPosition="top"
            lang="en"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
};

export default ProblemsDetail;
