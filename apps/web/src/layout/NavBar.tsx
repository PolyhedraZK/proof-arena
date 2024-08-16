import Icon, { CloseOutlined } from '@ant-design/icons';
import { Drawer, Menu } from 'antd';
import { useResponsive, useThemeMode } from 'antd-style';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import GighubButton from '@/assets/footerIcons/githubButton.svg?r';
import ArrowRightTop from '@/assets/icons/arrow-right-top.svg?r';
import CheckMark from '@/assets/icons/check-mark.svg?r';
import GithubIcon from '@/assets/icons/githubIcon.svg?r';
import Logo from '@/assets/logo.svg';
import MenuIcon from '@/assets/menuIcon.svg?r';
import WhiteLogo from '@/assets/white-logo.svg';
import BaseButton from '@/components/base/BaseButton';

import { links } from './Header';
import useStyles from './header.style';
function PcNavBar() {
  const { styles } = useStyles();
  const navigate = useNavigate();
  const { mobile } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const { themeMode } = useThemeMode();
  const selectd = `/${location.pathname.split('/')[1]}`;
  const createMenuItems = () =>
    links.map(item => ({
      label: (
        <Link key={item.label} to={item.to}>
          {item.label}
        </Link>
      ),
      key: item.to,
    }));
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
              key={item.label}
              className={styles.dropdownItem}
            >
              {item.label}
              {item.to === selectd && (
                <CheckMark className={styles.checkMarkIcon} />
              )}
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
      <Menu
        selectedKeys={[selectd]}
        className={styles.antMenuStyle}
        mode="horizontal"
        items={createMenuItems()}
      />
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
  );
}

export default PcNavBar;
