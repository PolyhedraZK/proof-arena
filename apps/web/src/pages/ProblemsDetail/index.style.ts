import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, responsive }) => {
  return {
    problemsDescriptionBox: {},
    customTitleBox: {
      padding: '11px 0px 16px 0px',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      marginBottom: 20,
      [responsive.mobile]: {
        padding: '0px 0px 16px 0px',
      },
    },
    title: {
      display: 'inline-block',
      margin: '0px 10px 0px 0px',
      fontSize: 24,
      fontWeight: 600,
      position: 'relative',
    },
    titleBlock: {
      width: 3,
      height: 20,
      flexShrink: 0,
      background: '#34A853',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: -16,
    },
    ProblemsDetailBox: {
      maxWidth: 1200,
      width: '100%',
      margin: '24px auto',
      [responsive.mobile]: {
        padding: '24px 16px 16px 16px',
        margin: '0px auto 24px',
      },
    },
    headBox: {
      background: 'white',
      padding: '24px 16px',
      border: '1px solid rgba(43, 51, 45, 0.05)',
      backdropFilter: 'blur(25px)',
      borderRadius: 16,
      marginTop: 24,
      height: 371,
      overflow: 'hidden',
      position: 'relative',
      [responsive.mobile]: {
        marginTop: 20,
        height: 576,
      },
    },
    heightAuto: {
      height: 'auto',
      [responsive.mobile]: {
        height: 'auto',
      },
    },
    headBoxChangeHeight: {
      width: '100%',
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 108,
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 65.11%, #FFF 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'end',
      paddingBottom: 24,
    },
    headBoxChange: {
      position: 'static',
    },
    problemsDetailHeadBox: {
      marginBottom: 40,
      display: 'flex',
      justifyContent: 'space-between',
      [responsive.mobile]: {
        flexDirection: 'column',
        gap: 18,
      },
    },
    problemsDetailMainBox: {
      background: 'white',
      padding: '5px 24px 16px',
      border: '1px solid rgba(43, 51, 45, 0.05)',
      backdropFilter: 'blur(25px)',
      borderRadius: 16,
      marginTop: 24,
      [responsive.mobile]: {
        padding: '16px 16px 16px',
      },
    },
    copyStyle: {
      margin: 0,
      color: '#2B332D',
      display: 'inline-block',
      position: 'relative',
      marginRight: 16,
    },
    icon: {
      width: 16,
      height: 16,
      lineHeight: 1,
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    boxSpace: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headBoxBtom: {
      // 加有time后用
      // borderRadius: '8px',
      // background: 'rgba(43, 51, 45, 0.03)',
      // padding: '12px 24px',
    },
    headBoxBtomItem: {
      display: 'flex',
      gap: 12,
    },
    headBoxBtomTitle: {
      color: '#2B332D',
      fontSize: 16,
      fontWeight: 400,
      display: 'flex',
      alignItems: 'center',
      gap: 8,

      // 加time后去掉
      borderRadius: '8px',
      // background: 'rgba(43, 51, 45, 0.03)',
      // padding: '12px 24px',
    },
    tabsLabel: {
      // color: 'rgba(43, 51, 45, 0.60)',
      fontSize: 20,
      fontWeight: 400,
    },
    badgeStyle: {
      background: 'rgba(43, 51, 45, 0.05)',
      fontSize: 12,
      color: 'rgba(43, 51, 45, 0.60)',
      padding: 6,
      borderRadius: 40,
    },
    baseBtn: {
      height: 38,
      color: '#2B332D',
      fontWeight: 400,
      fontSize: 14,
      gap: 4,
      [responsive.mobile]: {
        height: 30,
      },
    },
    baseBtnLink: {
      color: '#2B332D',
      fontSize: 18,
      fontWeight: 500,
      height: 44,
    },
    baseBtnStyle: { height: 48, background: '#fff', fontSize: 16 },
    loadingPis: {
      fontSize: 54,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%,-50%)',
    },
  };
});
