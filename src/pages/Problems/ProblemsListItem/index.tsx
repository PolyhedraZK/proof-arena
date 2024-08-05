import { Avatar, Typography } from 'antd';
import CopySvg from '@/assets/icons/copy.svg';
import { IProblems } from '@/services/problems/types.ts';

import { useStyles } from './index.style.ts';
import isImageByLoading from '@/utils/checkImg.ts';
import { useEffect, useState } from 'react';

const ProblemsListItem = ({ info }: { info: IProblems }) => {
  const { styles } = useStyles();
  const { Paragraph, Text } = Typography;
  const [avatar,setAvatar] = useState<string>('')
  useEffect(() => {
    isImageByLoading(info?.proposer_icon).then(imgUrl => setAvatar(imgUrl))
  },[info])
  return (
    <div className={styles.problemsDetailHeadBox}>
      <div className={styles.boxSpace}>
        <div className={styles.boxSpace}>
          <span className={styles.title}>{info.title || '--'}</span>
          &emsp;
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
        </div>
        <div className={styles.headBoxBtomTitle}>
          <Avatar
            size={24}
            icon={<img src={avatar} />
          }
          />
          <span>{info.proposer}</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemsListItem;
