import { Empty, type EmptyProps } from "antd"
import { createStyles } from "antd-style"

interface IEmptyProps extends EmptyProps {
  desClassName?: string;
}

const useStyles = createStyles({
  descStyle: {
    color: 'rgba(0, 0, 0, 0.45)'
  }
})
const BaseEmpty = ({ ...props }: IEmptyProps) => {
  const { styles, cx } = useStyles()
  const { image = Empty.PRESENTED_IMAGE_SIMPLE, description = 'No data', desClassName } = props
  return <Empty {...props} image={image} description={<span className={cx(styles.descStyle, desClassName)}>{description}</span>} />
}

export default BaseEmpty