import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, prefixCls, responsive }) => ({
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    marginTop: 60,
    padding: 16,
    marginBottom: 50,
    [responsive.mobile]: {
      marginTop: 8,
    },
  },
  titleContainer: {
    color: '#2B332D',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: 500,
    padding: '16px 0',
    background: '#fff',
    paddingLeft: 24,
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
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
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    backgroundColor: '#fff',
    borderTop: '1px solid rgba(43, 51, 45, 0.05)',
    [responsive.mobile]: {
      padding: 17,
    },
  },
  tableStyle: css(`
  .${prefixCls}-table-thead{
    .${prefixCls}-table-cell{
      padding: 12px;
    }
  }
  `),
  paginationStyle: { marginTop: 16, textAlign: 'center' },
}));
