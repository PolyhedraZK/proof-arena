import { links } from './Header';
import MenuIcon from '@/assets/icons/menu.svg?r';
import MenuCloseIcon from '@/assets/icons/menu-close.svg?r';
import useStyles from './header.style';
import { Drawer, Dropdown } from 'antd';
import { useToggle } from 'ahooks';
import { useRef } from 'react';
import { useLogout } from '@/hooks/useLogout';
import avatar from '@/assets/images/user/avatar.png';
import { useNavigate } from 'react-router';
import { useGlobalStore } from '@/store/global';

const MenuDropdownRender = () => {
  const { styles } = useStyles();

  const logout = useLogout();
  const navigate = useNavigate();
  const { update } = useGlobalStore();

  const onNavigate = item => {
    if (item.isExternalLink) {
      window.open(item.to, '_target');
    } else {
      navigate(item.to);
    }
    update('mobileNav', false);
  };

  const handleLogout = () => {
    update('mobileNav', false);
    logout();
  };

  return (
    <div className={styles.menuWrapper}>
      <ul className="dropdown-menu">
        {links.map((item, i) => (
          <li
            className="dropdown-menu-item"
            onClick={() => onNavigate(item)}
            key={i}
          >
            {item.title}
          </li>
        ))}
        <li onClick={handleLogout} className="dropdown-menu-item">
          <img src={avatar} className="mobile-avatar"></img>
          <p className="mobile-logout">Log out</p>
        </li>
      </ul>
    </div>
  );
};
function MobileNavBar() {
  const { styles } = useStyles();
  const { mobileNav, update } = useGlobalStore();

  const ref = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (mobileNav) {
      update('mobileNav', false);
    } else {
      update('mobileNav', true);
    }
  };

  return (
    <div className={styles.mobileNav} ref={ref}>
      <div onClick={toggle} className={styles.mobileNavIcon}>
        {mobileNav ? <MenuCloseIcon /> : <MenuIcon />}
      </div>
      <Drawer
        placement="bottom"
        rootStyle={{
          top: 72,
        }}
        closable={false}
        maskClosable
        open={mobileNav}
        height="100%"
        className={styles.drawerWrapper}
      >
        <MenuDropdownRender />
      </Drawer>
    </div>
  );
}

export default MobileNavBar;
