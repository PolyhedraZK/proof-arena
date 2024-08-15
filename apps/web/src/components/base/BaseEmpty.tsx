import { Empty, type EmptyProps } from 'antd';
import { createStyles } from 'antd-style';

import EmptySvg from '@/assets/arena-empty.svg';

interface IEmptyProps extends EmptyProps {
  desClassName?: string;
}

const useStyles = createStyles({
  descStyle: {
    color: '#2B332D',
    fontSize: 18,
    fontWeight: 500,
    fontFamily: 'Poppins',
  },
});
const BaseEmpty = ({ ...props }: IEmptyProps) => {
  const { styles, cx } = useStyles();
  const { image = EmptySvg, description = 'No data', desClassName } = props;
  return (
    <Empty
      {...props}
      image={image}
      description={
        <span className={cx(styles.descStyle, desClassName)}>
          {description}
        </span>
      }
    />
  );
};

export default BaseEmpty;
