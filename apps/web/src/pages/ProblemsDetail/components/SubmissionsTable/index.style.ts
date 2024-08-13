import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, prefixCls }) => ({
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
  tableStyle: css(`
  .${prefixCls}-table-thead{
    .${prefixCls}-table-cell{
      padding: 12px;
    }
  }
  `),
  paginationStyle: { marginTop: 16, textAlign: 'center' },
}));
