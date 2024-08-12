import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, responsive }) => {
  return {
    submissionsChartBox: {
      marginBottom: 40,
    },
    boxSpace: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 33,
    },
    title: {
      display: 'inline-block',
      margin: '0px 12px 0px 8px',
      fontSize: 24,
      fontWeight: 500,
      [responsive.mobile]: {
        margin: 0,
      },
    },
    drawerTitleBox: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'PingFang SC',
      fontSize: 20,
      fontWeight: 500,
    },
    drawerList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 18,
    },
    drawerListItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '18px 28px 18px 20px',
      background: 'rgba(43, 51, 45, 0.03)',
      borderRadius: 8,
      fontSize: 16,
      fontFamily: 'PingFang SC',
      fontWeight: 400,
      lineHeight: 1,
      position: 'relative',
    },
    checkMarkIcon: {
      position: 'absolute',
      right: 24,
      top: '50%',
      transform: 'translateY(-50%)',
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
