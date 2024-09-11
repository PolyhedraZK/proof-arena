import Giscus from '@giscus/react';
import { useRequest } from 'ahooks';
import { Skeleton, Tabs } from 'antd';
import { useState } from 'react';

import MdDescription from '@/components/MdDescription';

// import { giscusConfig } from '@/config/giscus';
import { useStyles } from './styles';

const HowToInteractWithJudge = () => {
  const { TabPane } = Tabs;
  const [activeTrack, setActiveTrack] = useState('zk-prover');

  const { styles } = useStyles();

  const {
    data: HowToInteractWithSPJData,
    error,
    loading,
  } = useRequest(() =>
    fetch('/docs/how_to_interact_with_SPJ.md').then(res => res.text())
  );

  if (error) {
    return <div>Failed to load How to Contribute content</div>;
  }

  return (
    <div className={styles.baseBox}>
      <div className={`main-container ${styles.proversWrapper}`}>
        <Tabs activeKey={activeTrack} onChange={setActiveTrack}>
          <TabPane
            tab={<span className={styles.tabTitle}>Go</span>}
            key="zk-prover"
          >
            <div className={styles.box}>
              <div className={styles.title}>
                How to use SPJ <div className={styles.green} />
              </div>
              {loading ? (
                <>
                  <Skeleton active />
                  <Skeleton active />
                </>
              ) : (
                HowToInteractWithSPJData && (
                  <MdDescription mdFile={HowToInteractWithSPJData} />
                )
              )}
              {/* <div style={{ marginTop: '48px' }}>
          <h2>Discussions</h2>
          <Giscus
            {...giscusConfig}
            term="How to Contribute"
            mapping="specific"
          />
        </div> */}
            </div>
          </TabPane>
          <TabPane
            disabled
            tab={<span className={styles.tabTitle}>Rust</span>}
            key="zkvm"
          />
        </Tabs>
      </div>
    </div>
  );
};

export default HowToInteractWithJudge;
