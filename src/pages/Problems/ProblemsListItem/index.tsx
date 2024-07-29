import { Avatar, Typography } from 'antd';
import user_avatar from '@/assets/user_avatar.svg'
import CopySvg from '@/assets/icons/copy.svg';
import { IProblems } from '@/services/problems/types.ts';

import { useStyles } from './index.style.ts';

const ProblemsListItem = ({ info }: { info: IProblems }) => {
  const { Paragraph, Text } = Typography;
  const { styles } = useStyles();
  return (
    <div className={styles.problemsDetailHeadBox}>
      <div className={styles.boxSpace}>
        <div className={styles.boxSpace}>
          <span className={styles.title}>{info.problem_name || '--'}</span>
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
              {info.id}
            </Paragraph>
          </Text>
        </div>
        <div className={styles.headBoxBtomTitle}>
        {/* info.user_avatar */}
          <Avatar size={24} icon={<img src={user_avatar} />} />
          <span>{info.user_name}</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemsListItem;
