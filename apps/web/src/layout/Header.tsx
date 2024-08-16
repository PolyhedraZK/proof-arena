import { useThemeMode } from 'antd-style';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import Logo from '@/assets/logo.svg';
import WhiteLogo from '@/assets/white-logo.svg';

import useStyles from './header.style';
import NavBar from './NavBar';

const Header = memo(() => {
  const { styles } = useStyles();
  const { themeMode } = useThemeMode();

  return (
    <div className={styles.headerWrapper}>
      <Link className={styles.navLogo} to="/problems">
        <img
          className="logo"
          src={themeMode == 'dark' ? Logo : WhiteLogo}
          alt="logo"
        />
      </Link>
      <NavBar />
    </div>
  );
});

export default Header;

export const links = [
  { to: '/problems', label: 'Problems' },
  { to: '/howToContribute', label: 'HowToContribute' },
  { to: '/judgerSpec', label: 'JudgerSpec' },
];
