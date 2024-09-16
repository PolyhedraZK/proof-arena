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
    data: HowToInteractWithSPJDataGolang,
    error: errorGolang,
    loading: loadingGolang,
  } = useRequest(() =>
    fetch('/docs/how_to_interact_with_SPJ.md').then(res => res.text())
  );

  const {
    data: HowToInteractWithSPJDataRust,
    error: errorRust,
    loading: loadingRust,
  } = useRequest(() =>
    fetch('/docs/how_to_interact_with_SPJ_Rust.md').then(res => res.text())
  );

  if (errorGolang || errorRust) {
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
              {loadingGolang ? (
                <>
                  <Skeleton active />
                  <Skeleton active />
                </>
              ) : (
                HowToInteractWithSPJDataGolang && (
                  <MdDescription mdFile={HowToInteractWithSPJDataGolang} />
                )
              )}
            </div>
          </TabPane>
          <TabPane
            tab={<span className={styles.tabTitle}>Rust</span>}
            key="zkvm"
          >
            <div className={styles.box}>
              <div className={styles.title}>
                How to use SPJ <div className={styles.green} />
              </div>
              {loadingRust ? (
                <>
                  <Skeleton active />
                  <Skeleton active />
                </>
              ) : (
                HowToInteractWithSPJDataRust && (
                  <MdDescription mdFile={HowToInteractWithSPJDataRust} />
                )
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default HowToInteractWithJudge;
