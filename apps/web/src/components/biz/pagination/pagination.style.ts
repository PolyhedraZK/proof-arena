import { createStyles } from 'antd-style';

import { customThemeVariables } from '@/theme';
import { hex2rgba } from '@/utils';

export default createStyles(({ token, css, cx, responsive, isDarkMode }) => {
  const colors = isDarkMode ? customThemeVariables.dark : customThemeVariables.light;
  return {
    paginationWrapper: css`
      margin: 0 auto 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    `,
    paginationItem: css`
      width: fit-content;
      height: 40px;
      min-width: 40px;
      color: ${colors.textColor};
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid ${hex2rgba(colors.borderColor, 10)};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      box-sizing: border-box;
      padding: 0 4px;
      transition: none !important;
      svg {
        color: ${colors.textColor};
      }
      &.active {
        border: 1px solid ${token.colorPrimary};
        color: ${token.colorPrimary};
      }
      &:disabled {
        color: ${hex2rgba(colors.textColor, 30)};
        pointer-events: none;
        cursor: default;
        svg {
          color: ${hex2rgba(colors.textColor, 30)};
        }
      }
    `,
    [responsive.sm]: {
      mobilePaginationNav: css`
        display: none;
      `,
      pcPaginationNav: css`
        display: none;
      `,
    },
  };
});
