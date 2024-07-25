import { createStyles, useResponsive, useThemeMode } from 'antd-style';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import Logo from '@/assets/logo.svg';
import WhiteLogo from '@/assets/white-logo.svg';

import useStyles from './header.style';
import MobileNavBar from './MobileNavBar';
import PcNavBar from './PcNavBar';

const Header = memo(() => {
  const { styles } = useStyles();
  const { themeMode } = useThemeMode();

  const { md: isPc } = useResponsive();

  return (
    <div className={styles.headerWrapper}>
      <Link className={styles.navLogo} to="/problems">
        <img
          className="logo"
          src={themeMode == 'dark' ? Logo : WhiteLogo}
          alt="logo"
        />
      </Link>
      {isPc ? <PcNavBar /> : <MobileNavBar />}
    </div>
  );
});

export default Header;

export const links = [
  { title: 'Problems', to: '/problems', isExternalLink: false },
];
