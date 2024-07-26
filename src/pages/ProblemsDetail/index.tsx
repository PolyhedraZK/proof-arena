import { useStyles } from './index.style.ts'
import CopySvg from '@/assets/icons/copy.svg';
import analysisCharts from '@/assets/icons/analysis-charts.svg'
import analysisChartsAction from '@/assets/icons/analysis-charts-action.svg'
import { Typography, Tabs, Avatar } from "antd";
import { LeftOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import SubmissionsTable from './components/SubmissionsTable'
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import BaseButton from '@/components/base/BaseButton.tsx';
import { problemsDetailData } from '@/consts/ProblemsData.ts'
import { IProblemsDetail } from '@/services/problems/types.ts';
import SubmissionsChart from './components/SubmissionsChart';
import Giscus from '@giscus/react';

const ProblemsDetail = () => {
  const navigate = useNavigate()
  const { detailId } = useParams()
  const { Paragraph, Text } = Typography
  const { styles, cx } = useStyles()
  const [checkedUI, setCheckedUI] = useState(true)
  const [tabKey, setTabKey] = useState(localStorage.getItem('tabKey') || '1')
  const [iconUrl, setIconUrl] = useState(analysisCharts)
  const [detaileData, setDetaileData] = useState<IProblemsDetail>()
  useEffect(() => {
    setDetaileData(problemsDetailData.find(item => item.id === Number(detailId)))
  }, [])
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: <span className={styles.tabsLabel}>Solutions</span>,
      children: checkedUI ? <SubmissionsTable dataSource={detaileData?.submissionsTableData} /> : <div><SubmissionsChart chartData={detaileData?.submissionsTableData || []} goBack={setCheckedUI} /></div>,
    },
    {
      // disabled: true,
      key: '2',
      label: <span className={styles.tabsLabel}>Discussions
        {/* <span className={styles.badgeStyle}>{detaileData?.execution_number}</span> */}
      </span>,
      children: <Giscus
        repo="zkbridge-testnet/proof-arena"
        repoId="R_kgDOMY9PxQ"
        category="General"
        categoryId="DIC_kwDOMY9Pxc4ChCf4"
        mapping="url"
        term="Welcome to Proof Arena"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="1"
        inputPosition="top"
        lang="en"
        loading="lazy"
      />,
    },
    // {
    //   disabled: true,
    //   key: '3',
    //   label: <span className={styles.tabsLabel}>Solution Submit</span>,
    //   children: 'Content of Tab Pane 3',
    // },
  ];
  const onGoBack = () => {
    navigate('/problems');
    localStorage.removeItem('tabKey')
  }
  return <div className={styles.ProblemsDetailBox}>
    <div className={styles.problemsDetailHeadBox}>
      <div className={styles.boxSpace}>
        <div className={styles.boxSpace}>
          <LeftOutlined onClick={onGoBack} />
          <span className={styles.title}>{detaileData?.problem_name}</span>
          <Text>
            <Text type='secondary'>ID: </Text>
            <Paragraph className={styles.copyStyle}
              copyable={{
                icon: <img src={CopySvg} className={styles.icon} />
                , tooltips: false
              }}>
              {detaileData?.id}
            </Paragraph>
          </Text>
        </div>
        <BaseButton onClick={() => window.open('https://github.com/niconiconi/ProofArena/blob/main/SHA256.md')} className={styles.baseBtnLink}>
          Details Link
        </BaseButton>
      </div>

      <Text className={styles.secondaryText} type='secondary'>
        {detaileData?.desc}
      </Text>

      <div className={cx(styles.boxSpace, styles.headBoxBtom)}>
        <div className={styles.headBoxBtomTitle}>
          <Avatar size={24} icon={<img src={detaileData?.user_avatar} />} />
          <span>{detaileData?.user_name}</span>
        </div>
        {/* <div className={styles.headBoxBtomItem}>
          <Text type='secondary'>Number of Execution:</Text>
          <span>{detaileData?.execution_number}</span>
        </div> */}
        {/* <div className={styles.headBoxBtomItem}>
          <Text type='secondary'>CreateTime:</Text>
          <span>{detaileData?.create_time}</span>
        </div> */}
      </div>
    </div>
    <div className={styles.problemsDetailMainBox}>
      <Tabs
        tabBarExtraContent={checkedUI && tabKey === '1' &&
          <BaseButton
            className={styles.baseBtn}
            onClick={() => setCheckedUI(false)}
            onMouseOver={() => setIconUrl(analysisChartsAction)}
            onMouseOut={() => setIconUrl(analysisCharts)}
            style={{ display: 'flex' }}>
            {/* analysisCharts  */}
            <img src={iconUrl} style={{ width: 20, height: 20 }} />
            Analysis Charts
          </BaseButton>
        }

        activeKey={tabKey}
        items={items}
        onChange={(key) => {
          setTabKey(key)
          localStorage.setItem('tabKey', key)
        }}
      />
    </div>
  </div>;
};

export default ProblemsDetail;