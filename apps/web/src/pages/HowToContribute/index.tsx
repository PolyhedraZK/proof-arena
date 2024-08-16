import { createStyles } from 'antd-style';
import { useEffect, useState } from 'react';

import MdDescription from '@/components/MdDescription';
import { customThemeVariables } from '@/theme';

const useStyles = createStyles(({ isDarkMode, responsive }) => {
  const colors = isDarkMode
    ? customThemeVariables.dark
    : customThemeVariables.light;
  return {
    box: {
      margin: '0 auto',
      marginTop: 24,
      borderRadius: 8,
      background: colors.cardBgColor,
      maxWidth: 1200,
      padding: 24,
      [responsive.mobile]: {
        margin: 16,
      },
    },
  };
});
const HowToContribute = () => {
  const [mdFile, setMdFile] = useState('');
  const { styles } = useStyles();
  useEffect(() => {
    fetch('/docs/how_to_contribute.md')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        setMdFile(text);
      });
  }, []);
  return (
    <div className={styles.box}>
      <MdDescription mdFile={mdFile || ''} />
    </div>
  );
};

export default HowToContribute;
