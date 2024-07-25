import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css }) => {
  return {
    submissionsChartBox: {
      marginBottom: 40,
    },
    boxSpace: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 53,
    },
    title: {
      display: 'inline-block',
      margin: '0px 12px 0px 8px',
      fontSize: 24,
      fontWeight: 500,
    },
    segmentedStyle: css(`
    border: 1px solid rgba(43, 51, 45, 0.10);
    padding: 6px;
    .proof-segmented-item{
        border-radius: 100px;
        height: 30px;
        display: flex;
        align-items: center;
    }
    .proof-segmented-thumb {
      border-radius: 100px;
    }
    `),
  };
});
