import { Avatar, Typography } from 'antd';
import CopySvg from '@/assets/icons/copy.svg';
import { IProblems } from '@/services/problems/types.ts';

import { useStyles } from './index.style.ts';
import isImageByLoading from '@/utils/checkImg.ts';
import { useEffect, useState } from 'react';

interface IproblemsListItemProps {
  info: IProblems;
  onClick: () => void;
}
const ProblemsListItem = ({ info, onClick }: IproblemsListItemProps) => {
  const { styles } = useStyles();
  const { Paragraph, Text } = Typography;
  const [avatar, setAvatar] = useState<string>('');
  useEffect(() => {
    isImageByLoading(info?.proposer_icon).then(imgUrl => setAvatar(imgUrl));
  }, [info]);
  return (
    <div onClick={onClick} className={styles.problemsDetailHeadBox}>
      <div className={styles.boxSpace}>
        <div className={styles.boxSpace}>
          <Text>
            <span className={styles.secondary}>ID: </span>
            <Paragraph
              className={styles.copyStyle}
              copyable={{
                icon: <img src={CopySvg} className={styles.icon} />,
                tooltips: false,
              }}
            >
              {info.problem_id}
            </Paragraph>
          </Text>
          <span className={styles.title}>{info.title || '--'}</span>
        </div>
        <div className={styles.headBoxBtomTitle}>
          <Avatar size={24} icon={<img src={avatar} />} />
          <span>{info.proposer}</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemsListItem;
