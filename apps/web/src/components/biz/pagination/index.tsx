import LeftOutlined from '@ant-design/icons/LeftOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import { Button } from 'antd';
import { useResponsive } from 'antd-style';
import clsx from 'clsx';
import {
  ClassAttributes,
  CSSProperties,
  Fragment,
  HTMLProps,
  useEffect,
  useState,
} from 'react';

import useStyles from './pagination.style';

interface IPaginationProps {
  style?: CSSProperties;
  onChange: (page: number) => void;
  defaultPage: number;
  page: number;
  count?: number; // 总页数
}
function Pagination(props: IPaginationProps) {
  const { count = 1 } = props;
  const { styles } = useStyles();

  // 滑动窗口
  const [slidingWindow, setWindow] = useState([1, 5]);
  const [pages, setPages] = useState([1]);

  useEffect(() => {
    const result: number[] = [];
    for (let i = slidingWindow[0]; i <= slidingWindow[1] && i <= count; i++) {
      result.push(i);
    }
    setPages(result);
  }, [slidingWindow, count]);

  const [currentPage, setCurrentPage] = useState(1);

  const switchNextPage = () => {
    if (currentPage >= count) {
      return;
    }
    const page = currentPage + 1;
    if (slidingWindow[1] < page) {
      setWindow([slidingWindow[0] + 1, page]);
    }
    onPageChange(page);
  };

  const switchPrevPage = () => {
    if (currentPage <= 1) {
      return;
    }
    const page = currentPage - 1;
    if (slidingWindow[0] > page) {
      setWindow([page, slidingWindow[1] - 1]);
    }
    onPageChange(page);
  };

  // 内部的callback
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    props.onChange(page);
  };

  return (
    <Fragment>
      <div className={styles.paginationWrapper} style={props.style}>
        <Button
          onClick={switchPrevPage}
          disabled={currentPage <= 1}
          className={clsx(styles.paginationItem, styles.pcPaginationNav)}
        >
          <LeftOutlined style={{ color: '#fff' }} />
        </Button>
        {pages.map(item => (
          <Button
            key={item}
            onClick={() => onPageChange(item)}
            className={clsx(styles.paginationItem, {
              active: item == currentPage,
            })}
          >
            {item}
          </Button>
        ))}
        {currentPage < count && count > 5 && (
          <div className={styles.paginationItem}>...</div>
        )}
        <Button
          disabled={currentPage >= count}
          className={clsx(styles.paginationItem, styles.pcPaginationNav)}
          onClick={switchNextPage}
        >
          <RightOutlined style={{ color: '#fff' }} />
        </Button>
      </div>
    </Fragment>
  );
}

export default Pagination;
