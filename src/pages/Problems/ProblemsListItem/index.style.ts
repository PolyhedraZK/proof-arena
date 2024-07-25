import { createStyles } from 'antd-style';

export const useStyles = createStyles(() => {
  return {
    title:{
      display: 'inline-block',
      fontSize: 24,
      fontWeight: 500,
      lineHeight:1
    },
    problemsDetailHeadBox:{
      width: '100%',
      background: 'white',
      padding: '24px 20px 16px',
      border: '1px solid rgba(43, 51, 45, 0.05)',
      backdropFilter:'blur(25px)',
      borderRadius: 16,
      cursor: 'pointer'
    },
    problemsDetailMainBox:{
      background: 'white',
      padding: '5px 24px 16px',
      border: '1px solid rgba(43, 51, 45, 0.05)',
      backdropFilter:'blur(25px)',
      borderRadius: 16,
      marginTop: 24,
    },
    copyStyle: {
      margin: 0,
      color: '#2B332D',
      display: 'inline-block',
      position: 'relative',
      marginRight: 16,
    },

    boxSpace: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headBoxBtom:{
      borderRadius: '8px',
      background: 'rgba(43, 51, 45, 0.03)',
      padding: '12px 16px'
    },
    headBoxBtomItem:{
      display: 'flex',
      gap: 12
    },
    headBoxBtomTitle:{
      color: '#2B332D',
      fontSize: 16,
      fontWeight: 400,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    },
    mt16:{
      marginTop: 16,
    },
    icon: {
      width: 16,
      height: 16,
      lineHeight: 1,
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    secondary:{
      color: 'rgba(43, 51, 45, .6)'
    }
  };
});
