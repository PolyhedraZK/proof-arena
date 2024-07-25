import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';

import LogoutSvg from '@/assets/icons/logout.svg?r';
import avatar from '@/assets/images/user/avatar.png';
import { useLogout } from '@/hooks/useLogout';
import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

const useStyles = createStyles(({ isDarkMode, token }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '184px',
      marginTop: '20px',
      border: `1px solid ${hex2rgba(colors.borderColor, 5)}`,
      background: token.colorBgElevated,
      borderRadius: '16px',
    },
    avatar: {
      objectFit: 'cover',
      objectPosition: 'center center',
      flexShrink: '0',
      maxWidth: '100%',
      width: '32px',
      height: '32px',
      cursor: 'pointer',
    },
    header: {
      padding: '15px 0 15px 20px',
      width: '100%',
      border: `1px solid ${hex2rgba(colors.borderColor, 5)}`,
      '& img': {
        flexShrink: '0',
        maxWidth: '100%',
        width: '40px',
        height: 40,
      },
    },

    menuItem: {
      display: 'flex',
      justifyContent: 'flex-start',
      gap: '12px',
      alignItems: 'center',
      height: '52px',
      width: '146px',
      cursor: 'pointer',
      fontSize: 16,
      color: hex2rgba(colors.textColor, 60),
      '&:hover': {
        color: colors.textColor,
      },
      '& svg': {
        flexShrink: '0',
        maxWidth: '100%',
        width: '24px',
      },
      '& p': {
        fontWeight: '500',
        lineHeight: '1',
      },
    },
  };
});

const DropdownRender = () => {
  const { styles } = useStyles();

  /**
   * todo 可以定义useDisConnect的hook，将disconnect的逻辑抽离出来，
   *  将来可以将connect、disconnect等逻辑放一起
   */

  const logout = useLogout();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src={avatar}></img>
      </div>
      <div>
        <div onClick={logout} className={styles.menuItem}>
          <LogoutSvg />
          <p>Log out</p>
        </div>
      </div>
    </div>
  );
};

export function UserAccount() {
  const { styles } = useStyles();

  return (
    <Dropdown placement="bottomRight" dropdownRender={() => <DropdownRender />}>
      <img src={avatar} alt="" className={styles.avatar} />
    </Dropdown>
  );
}
