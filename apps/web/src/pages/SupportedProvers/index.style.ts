import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, prefixCls, responsive }) => ({
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    marginTop: 24,
    padding: 16,
    marginBottom: 50,
    [responsive.mobile]: {
      marginTop: 8,
    },
  },
  titleContainer: {
    color: '#2B332D',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 600,
    lineHeight: '130%',
    background: '#fff',
    padding: 24,
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    position: 'relative',
    [responsive.mobile]: {
      paddingLeft: 17,
    },
  },
  TableTitle: {
    color: 'rgba(43, 51, 45, .5)',
    fontSize: 14,
    fontWeight: 400,
    display: 'flex',
    flexDirection: 'column',
  },
  titleSpanStyle: {
    color: 'rgba(43, 51, 45, .5)',
    fontSize: 14,
    fontWeight: 400,
  },
  tableBox: {
    borderBottom: 'none',
    borderRadius: 16,
    border: '1px solid rgba(43, 51, 45, 0.05)',
    overflow: 'hidden',
  },
  backBox: {
    padding: 24,
    paddingTop: 0,
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    backgroundColor: '#fff',
    [responsive.mobile]: {
      padding: 17,
    },
  },
  tableStyle: css(`
  .${prefixCls}-table-thead{
    .${prefixCls}-table-cell{
      padding: 25px 20px;
      color: rgba(0,0,0,.5);
      font-family: Poppins;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 14px */
    }
  }
  .${prefixCls}-table-cell{
      padding: 25px 20px;
    }
  `),
  paginationStyle: { marginTop: 16, textAlign: 'center' },
  green: css`
    width: 3px;
    height: 20px;
    flex-shrink: 0;
    background: #34a853;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0px;
  `,
}));
