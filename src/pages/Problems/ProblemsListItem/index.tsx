import { Avatar, Typography } from "antd"
import { useStyles } from "./index.style.ts"
import CopySvg from '@/assets/icons/copy.svg';
import { IProblems } from "@/services/problems/types.ts";

const ProblemsListItem = ({ info }: { info: IProblems }) => {
  const { Paragraph, Text } = Typography
  const { styles, cx } = useStyles()

  return <div className={styles.problemsDetailHeadBox}>
    <div className={styles.boxSpace}>
      <div className={styles.boxSpace}>
        <span className={styles.title}>{info.problem_name || '--'}</span>
        &emsp;
        <Text>
          <span className={styles.secondary}>ID: </span>
          <Paragraph className={styles.copyStyle}
            copyable={{
              icon: <img src={CopySvg} className={styles.icon} />, tooltips: false
            }}>
            {info.id}
          </Paragraph>
        </Text>
      </div>
      <div className={styles.headBoxBtomTitle}>
        <Avatar size={24} icon={<img src={info.user_avatar} />} />
        <span>{info.user_name}</span>
      </div>
    </div>
    {/* <div className={cx(styles.boxSpace, styles.headBoxBtom, styles.mt16)}>
      <div className={styles.headBoxBtomTitle}>
        <Avatar size={24} icon={<img src={info.user_avatar} />} />
        <span>{info.user_name}</span>
      </div>
      <div className={styles.headBoxBtomItem}>
        <span className={styles.secondary}>Number of Execution:</span>
        <span>{info.execution_number || '--'}</span>
      </div>
      <div className={styles.headBoxBtomItem}>
        <span className={styles.secondary}>CreateTime:</span>
        <span>{info.create_time || '--'}</span>
      </div>
    </div> */}
  </div>
}

export default ProblemsListItem