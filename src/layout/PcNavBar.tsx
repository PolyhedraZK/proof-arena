import classNames from 'clsx';
import { Link } from 'react-router-dom';

import { UserAccount } from '@/components/biz/UserAccount';

import { links } from './Header';
import useStyles from './header.style';

function PcNavBar() {
  const { styles } = useStyles();
  return (
    <div className={styles.navLinks}>
      <div className="links">
        {links.map(({ title, to }, idx) => (
          <Link
            className={classNames('link', { active: idx === 0 })}
            key={title}
            to={to}
          >
            {title}
          </Link>
        ))}
      </div>
      <UserAccount />
    </div>
  );
}

export default PcNavBar;
