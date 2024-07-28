import { LeftOutlined } from '@ant-design/icons';
import Giscus from '@giscus/react';
import type { TabsProps } from 'antd';
import { Avatar, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import analysisCharts from '@/assets/icons/analysis-charts.svg';
import analysisChartsAction from '@/assets/icons/analysis-charts-action.svg';
import CopySvg from '@/assets/icons/copy.svg';
import BaseButton from '@/components/base/BaseButton.tsx';
import { problemsDetailData } from '@/consts/ProblemsData.ts';
import { IProblemsDetail } from '@/services/problems/types.ts';

import SubmissionsChart from './components/SubmissionsChart';
import SubmissionsTable from './components/SubmissionsTable';
import { useStyles } from './index.style.ts';

const giscusConfig = {
  repo:import.meta.env.VITE_BASE_URLVITE_APP_GISCUS_REPO_NAME,
  repoId:import.meta.env.VITE_APP_GISCUS_REPO_ID,
  category:import.meta.env.VITE_APP_GISCUS_REPO_NAME,
  categoryId:import.meta.env.VITE_APP_GISCUS_REPO_NAME,
};
const ProblemsDetail = () => {
  const navigate = useNavigate();
  const { detailId } = useParams();
  const { Paragraph, Text } = Typography;
  const { styles, cx } = useStyles();
  const [checkedUI, setCheckedUI] = useState(true);
  const [tabKey, setTabKey] = useState(localStorage.getItem('tabKey') || '1');
  const [iconUrl, setIconUrl] = useState(analysisCharts);
  const [detaileData, setDetaileData] = useState<IProblemsDetail>();

  useEffect(() => {
    setDetaileData(
      problemsDetailData.find(item => item.id === Number(detailId))
    );
  }, [detailId]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: <span className={styles.tabsLabel}>Solutions</span>,
      children: checkedUI ? (
        <SubmissionsTable dataSource={detaileData?.submissionsTableData} />
      ) : (
        <div>
          <SubmissionsChart
            chartData={detaileData?.submissionsTableData || []}
            goBack={setCheckedUI}
          />
        </div>
      ),
    },
    {
      // disabled: true,
      key: '2',
      label: (
        <span className={styles.tabsLabel}>
          Discussions
          {/* <span className={styles.badgeStyle}>{detaileData?.execution_number}</span> */}
        </span>
      ),
      children: (
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
      ),
    },
  ];
  const onGoBack = () => {
    navigate('/problems');
    localStorage.removeItem('tabKey');
  };
  const onGoToDetail = () => {
if (detaileData && detaileData.detail_link) {
   window.open(detaileData?.detail_link, '_target');
}
  };
  return (
    <div className={styles.ProblemsDetailBox}>
      <div className={styles.problemsDetailHeadBox}>
        <div className={styles.boxSpace}>
          <div className={styles.boxSpace}>
            <LeftOutlined onClick={onGoBack} />
            <span className={styles.title}>{detaileData?.problem_name}</span>
            <Text>
              <Text type="secondary">ID: </Text>
              <Paragraph
                className={styles.copyStyle}
                copyable={{
                  icon: <img src={CopySvg} className={styles.icon} />,
                  tooltips: false,
                }}
              >
                {detaileData?.id}
              </Paragraph>
            </Text>
          </div>
          <BaseButton
            onClick={onGoToDetail}
            className={styles.baseBtnLink}
          >
            Details Link
          </BaseButton>
        </div>

        <Text className={styles.secondaryText} type="secondary">
          {detaileData?.desc}
        </Text>

        <div className={cx(styles.boxSpace, styles.headBoxBtom)}>
          <div className={styles.headBoxBtomTitle}>
            <Avatar size={24} icon={<img src={detaileData?.user_avatar} />} />
            <span>{detaileData?.user_name}</span>
          </div>
        </div>
      </div>
      <div className={styles.problemsDetailMainBox}>
        <Tabs
          tabBarExtraContent={
            checkedUI &&
            tabKey === '1' && (
              <BaseButton
                className={styles.baseBtn}
                onClick={() => setCheckedUI(false)}
                onMouseOver={() => setIconUrl(analysisChartsAction)}
                onMouseOut={() => setIconUrl(analysisCharts)}
                style={{ display: 'flex' }}
              >
                {/* analysisCharts  */}
                <img src={iconUrl} style={{ width: 20, height: 20 }} />
                Analysis Charts
              </BaseButton>
            )
          }
          activeKey={tabKey}
          items={items}
          onChange={key => {
            setTabKey(key);
            localStorage.setItem('tabKey', key);
          }}
        />
      </div>
    </div>
  );
};

export default ProblemsDetail;
