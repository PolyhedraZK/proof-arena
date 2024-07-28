import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  return {
    title: {
      display: 'inline-block',
      margin: '0px 12px 0px 8px',
      fontSize: 24,
      fontWeight: 500,
    },
    ProblemsDetailBox: {
      width: 1200,
      margin: '40px auto 24px',
    },
    problemsDetailHeadBox: {
      background: 'white',
      padding: 24,
      border: '1px solid rgba(43, 51, 45, 0.05)',
      backdropFilter: 'blur(25px)',
      borderRadius: 16,
    },
    problemsDetailMainBox: {
      background: 'white',
      padding: '5px 24px 16px',
      border: '1px solid rgba(43, 51, 45, 0.05)',
      backdropFilter: 'blur(25px)',
      borderRadius: 16,
      marginTop: 24,
    },
    secondaryText: {
      linheight: '160%',
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Poppins',
      marginTop: 24,
      marginBottom: 16,
      display: 'block',
      color: 'rgba(43, 51, 45, 0.6)',
      '& a': {
        color: token.colorPrimary,
        '&:hover': {
          color: token.colorPrimary
        }
      }
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
      background: 'rgba(43, 51, 45, 0.03)',
      padding: '12px 24px',
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
    },
    baseBtnLink: {
      color: '#2B332D',
      fontSize: 18,
      fontWeight: 500,
      height: 44,
    },
  };
});
