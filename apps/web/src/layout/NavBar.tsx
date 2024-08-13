import classNames from 'clsx';
import { Link, useNavigate } from 'react-router-dom';

import { links } from './Header';
import useStyles from './header.style';
import { useResponsive, useThemeMode } from 'antd-style'
import GighubButton from '@/assets/footerIcons/githubButton.svg?r'
import GithubIcon from '@/assets/icons/githubIcon.svg?r'
import ArrowRightTop from '@/assets/icons/arrow-right-top.svg?r'
import MenuIcon from '@/assets/menuIcon.svg?r'
import Icon, { CloseOutlined } from '@ant-design/icons';
import Logo from '@/assets/logo.svg';
import WhiteLogo from '@/assets/white-logo.svg';
import { useState } from 'react';
import { Drawer } from 'antd';
import BaseButton from '@/components/base/BaseButton';
function PcNavBar() {
  const { styles } = useStyles();
  const navigate = useNavigate();
  const { mobile } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const { themeMode } = useThemeMode();

  return mobile ? (
    <div className={styles.navLinks}>
      <div className={styles.mobileNav}>
        <Icon
          onClick={() => setIsOpen(!isOpen)}
          component={MenuIcon}
          style={{ fontSize: 28 }}
        />
      </div>
      <Drawer
        styles={{ body: { padding: 0 } }}
        placement={'top'}
        closable={false}
        height={'100%'}
        onClose={() => setIsOpen(!isOpen)}
        open={isOpen}
      >
        <div className={styles.closeHeadBox}>
          <img
            className={styles.logo}
            src={themeMode == 'dark' ? Logo : WhiteLogo}
            alt="logo"
          />
          <CloseOutlined
            onClick={() => setIsOpen(!isOpen)}
            style={{ fontSize: 28 }}
          />
        </div>
        <div className={styles.menuList}>
          {links.map(item => (
            <div
              onClick={() => {
                navigate(item.to);
                setIsOpen(false);
              }}
              key={item.title}
              className={styles.dropdownItem}
            >
              {item.title}
            </div>
          ))}
          <GighubButton
            className={styles.mdGithubBtn}
            onClick={() =>
              window.open('https://github.com/PolyhedraZK/proof-arena')
            }
          />
        </div>
      </Drawer>
    </div>
  ) : (
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
      <BaseButton className={styles.githubBtn} onClick={() => window.open('https://github.com/PolyhedraZK/proof-arena')} ><GithubIcon/> &nbsp;Github<ArrowRightTop/></BaseButton>
    </div>);
}

export default PcNavBar;
