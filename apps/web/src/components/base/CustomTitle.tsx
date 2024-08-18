import { createStyles } from 'antd-style';
import { ReactNode } from 'react';
import { CSSProperties } from 'react';

type ICustomType = {
  title: string;
  className?: CSSProperties;
  suffix?: ReactNode | string | number;
};
const useStyles = createStyles(() => ({
  baseTitleBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  baseTitle: {
    color: '#2B332D',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Poppins',
  },
}));

const CustomTitle = ({ title, suffix, className }: ICustomType) => {
  const { styles, cx } = useStyles();
  return (
    <div className={styles.baseTitleBox}>
      <span className={cx(styles.baseTitle, className)}>{title}</span>
      {suffix}
    </div>
  );
};

export default CustomTitle;
