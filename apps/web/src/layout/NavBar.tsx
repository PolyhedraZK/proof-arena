import Icon, { CloseOutlined } from '@ant-design/icons';
import { Drawer, Menu } from 'antd';
import { useResponsive, useThemeMode } from 'antd-style';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import GighubButton from '@/assets/footerIcons/githubButton.svg?r';
import CheckMark from '@/assets/icons/check-mark.svg?r';
import Logo from '@/assets/logo.svg';
import MenuIcon from '@/assets/menuIcon.svg?r';
import WhiteLogo from '@/assets/white-logo.svg';

import useStyles from './header.style';

export const links = [
  { to: '/problems', label: 'Problems' },
  { to: '/how-to-contribute', label: 'How to Contribute' },
  { to: '/machine-spec', label: 'Machine Specification' },
  { to: '/supported-provers', label: 'Supported Provers' },
];

function NavBar() {
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
        expandIcon
      />
    </div>
  );
}

export default NavBar;
