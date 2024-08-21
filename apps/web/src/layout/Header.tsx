import { useResponsive, useThemeMode } from 'antd-style';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import ArrowRightTop from '@/assets/icons/arrow-right-top.svg?r';
import GithubIcon from '@/assets/icons/githubIcon.svg?r';
import Logo from '@/assets/logo.svg';
import WhiteLogo from '@/assets/white-logo.svg';
import BaseButton from '@/components/base/BaseButton';

import useStyles from './header.style';
import NavBar from './NavBar';

const Header = memo(() => {
  const { styles } = useStyles();
  const { themeMode } = useThemeMode();
  const { mobile } = useResponsive();

  return (
    <div className={styles.headerWrapper}>
      <Link className={styles.navLogo} to="/">
        <img
          className="logo"
          src={themeMode == 'dark' ? Logo : WhiteLogo}
          alt="logo"
        />
      </Link>
      <NavBar />
      {!mobile && (
        <div className={styles.btnBox}>
          <BaseButton
            className={styles.githubBtn}
            onClick={() =>
              window.open('https://github.com/PolyhedraZK/proof-arena')
            }
          >
            <GithubIcon /> &nbsp;Github
            <ArrowRightTop />
          </BaseButton>
        </div>
      )}
    </div>
  );
});

export default Header;
