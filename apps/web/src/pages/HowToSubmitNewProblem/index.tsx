import Giscus from '@giscus/react';
import { useRequest } from 'ahooks';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';

import MdDescription from '@/components/MdDescription';
import { giscusConfig } from '@/config/giscus';
import { customThemeVariables } from '@/theme';
const useStyles = createStyles(({ isDarkMode, css, responsive }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    baseBox: {
      padding: 16,
      marginBottom: 50,
    },
    box: {
      margin: '0 auto',
      marginTop: 24,
      borderRadius: 8,
      background: colors.cardBgColor,
      maxWidth: 1200,
      width: '100%',
      padding: 24,
      [responsive.mobile]: {
        marginTop: 8,
      },
    },
    title: css`
      color: #2b332d;
      font-family: Poppins;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: 130%;
      position: relative;
    `,
    green: css`
      width: 3px;
      height: 20px;
      flex-shrink: 0;
      background: #34a853;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: -24px;
    `,
  };
});
const HowToSubmitNewProblem = () => {
  const { styles } = useStyles();

  const {
    data: howToSubmitNewProblemData,
    error,
    loading,
  } = useRequest(() =>
    fetch('/docs/how_to_submit_new_problem.md').then(res => res.text())
  );

  if (error) {
    return <div>Failed to load How to Contribute content</div>;
  }

  return (
    <div className={styles.baseBox}>
      <div className={styles.box}>
        <div className={styles.title}>
          How to Contribute <div className={styles.green} />
        </div>
        {loading ? (
          <>
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          howToSubmitNewProblemData && (
            <MdDescription mdFile={howToSubmitNewProblemData} />
          )
        )}
        <div style={{ marginTop: '48px' }}>
          <h2>Discussions</h2>
          <Giscus
            {...giscusConfig}
            term="How to Submit New Problem"
            mapping="specific"
          />
        </div>
      </div>
    </div>
  );
};

export default HowToSubmitNewProblem;
