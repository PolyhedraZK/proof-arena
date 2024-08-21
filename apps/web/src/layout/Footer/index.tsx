import Logo from '@/assets/logo.svg';
import WhiteLogo from '@/assets/white-logo.svg';
import { useThemeMode, useResponsive } from 'antd-style';
import useStyles from './index.style';
import twitter from '@/assets/footerIcons/twitter.svg';
import medium from '@/assets/footerIcons/medium.svg';
import discord from '@/assets/footerIcons/discord.svg';
import { Space } from 'antd';

const Footer = () => {
  const { themeMode } = useThemeMode();
  const { mobile } = useResponsive();
  const { styles } = useStyles();
  const Icons = [
    {
      id: '1',
      icon: twitter,
      address: 'https://twitter.com/PolyhedraZK',
      name: 'twitter',
      width: 28,
    },

    {
      id: '2',
      icon: discord,
      address: 'https://discord.com/invite/polyhedra-network',
      name: 'discord',
      width: 28,
    },
    {
      id: '3',
      icon: medium,
      address: 'https://polyhedra.medium.com/',
      name: 'medium',
      width: 28,
    },
  ]
  const Copyright = () => <div className={styles.copyright}>
    © 2024 Proof Arena. All rights reserved
  </div>
  const IconsDom = () => <div className={styles.footerItemBox}>
    <Space className={styles.footerIconBox} size={24}>
      {Icons?.map(item => <img
        className={styles.footerIconStyle}
        style={{ width: item.width }}
        onClick={() => window.open(item.address)}
        key={item.name}
        alt={item.name}
        src={item.icon} />)}
    </Space>
  </div>
  return <footer className={styles.footerBox}>
    <div className={styles.footerContent}>
      <div className={styles.footerItemBox}>
        <img
          className={styles.logo}
          src={themeMode == 'dark' ? Logo : WhiteLogo}
          alt="logo"
        />
      </div>
      {
        mobile ? <>
          <IconsDom />
          <Copyright />
        </>
          : <>
            <Copyright />
            <IconsDom />
          </>
      }
    </div>
  </footer>
};

export default Footer;
