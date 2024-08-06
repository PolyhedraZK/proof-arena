import { ThemeConfig } from 'antd';
import tinycolor from 'tinycolor2';

import { hex2rgba } from './utils';

// antd利用的
export const theme: ThemeConfig = {
  cssVar: true,
  token: {
    colorText: '#fff',
    colorPrimary: '#75faca',
    fontFamily: 'Poppins',
    colorBgSpotlight: '#222423',
    colorBgMask: 'rgba(0, 0, 0, 0.78)',
    colorBgContainer: 'rgba(255, 255, 255, 0.05)',
    colorBgElevated: '#151716',
  },
  components: {
    Form: {
      labelHeight: 50,
      fontSize: 16,
      labelRequiredMarkColor: '#a1a2a2',
    },
    Input: {
      controlHeight: 50,
      hoverBorderColor: 'none',
      colorTextPlaceholder: '#5b5d5c',
      colorTextDescription: '#5b5d5c',
      boxShadow: 'none',
    },
    InputNumber: {
      controlHeight: 50,
      hoverBorderColor: 'none',
    },
    Radio: {
      buttonBg: '#212322',
      buttonCheckedBg: '#212322',
      fontSize: 16,
      paddingContentHorizontal: 15,
    },
    Modal: {
      contentBg: '#151716',
      titleColor: '#fff',
      headerBg: '#151716',
      titleFontSize: 20,
    },
    Drawer: {
      footerPaddingBlock: 0,
      footerPaddingInline: 0,
    },
    Message: {
      contentBg: '#151716',
    },
    Layout: {
      bodyBg: 'none',
    },
    Button: {
      defaultBg: 'none',
      defaultBorderColor: '#4d4d4d',
      defaultColor: '#75faca',
      defaultHoverBg: 'linear-gradient(68deg, #0CFFF0 7.6%, #0CFFA7 75.87%)',
      defaultActiveBg: 'linear-gradient(68deg, #0CFFF0 7.6%, #0CFFA7 75.87%)',
      defaultHoverColor: 'black',
      defaultHoverBorderColor: 'transparent',
      defaultActiveBorderColor: 'none',
      defaultActiveColor: 'black',
      borderRadius: 52,
      borderRadiusLG: 100,
      colorTextDisabled: 'rgba(43, 51, 45, 0.30)',
      borderColorDisabled: 'rgba(43, 51, 45, 0.30)',
    },
    Table: {
      headerBg: 'rgba(255, 255, 255, 0.05)',
      headerColor: 'rgba(255, 255, 255, 0.5)',
      borderColor: 'rgba(255, 255, 255, 0.10)',
      headerSplitColor: 'transparent',
      cellPaddingInline: 34,
    },
  },
};

export const themeLight: ThemeConfig = {
  cssVar: true,
  token: {
    colorText: '#2B332D',
    colorPrimary: '#34A853',
    colorTextPlaceholder: hex2rgba('#2B332D', 30),
    colorTextDescription: '#5b5d5c',
    fontFamily: 'Poppins',
    colorBgSpotlight: '#222423',
    colorBgMask: 'rgba(0, 0, 0, 0.7)',
    colorBgContainer: 'rgba(255, 255, 255, 0.05)',
    colorBgElevated: '#fff',
  },
  components: {
    Form: {
      labelHeight: 50,
      fontSize: 16,
      labelRequiredMarkColor: '#a1a2a2',
    },
    Input: {
      controlHeight: 50,
      hoverBorderColor: 'none',
    },
    InputNumber: {
      controlHeight: 50,
      hoverBorderColor: 'none',
    },
    Radio: {
      buttonBg: '#212322',
      buttonCheckedBg: '#212322',
      fontSize: 16,
      paddingContentHorizontal: 15,
    },
    Modal: {
      contentBg: '#F8F9FA',
      titleColor: '#000',
      headerBg: '#F8F9FA',
      titleFontSize: 20,
    },
    Drawer: {
      footerPaddingBlock: 0,
      footerPaddingInline: 0,
    },
    Message: {
      contentBg: '#F8F9FA',
    },
    Layout: {
      bodyBg: 'none',
    },
    Button: {
      defaultBg: '#34A853',
      defaultBorderColor: '#34A853',
      defaultColor: '#fff',
      defaultHoverBg: '#34A853',
      defaultActiveBg: '#34A853',
      defaultHoverColor: tinycolor('#fff').darken(20).toString(),
      defaultHoverBorderColor: 'transparent',
      defaultActiveBorderColor: 'none',
      defaultActiveColor: '#fff',
      borderRadius: 52,
      borderRadiusLG: 100,
      controlHeight: 52,
      contentFontSizeLG: 18,
      contentFontSize: 18,
      contentFontSizeSM: 18,
      fontSize: 18,
    },
    Table: {
      headerBg: '#FFF',
      headerColor: 'rgba(43, 51, 45, 0.5)',
      borderColor: 'rgba(43, 51, 45, 0.05)',
      headerSplitColor: 'transparent',
      cellPaddingInline: 34,
    },
  },
};

export const customThemeVariables = {
  dark: {
    bgColor: '#000',
    headerBgColor: '#000',
    borderColor: '#fff',
    textColor: '#fff',
    lightBtnBgColor: '#fff', // 轻按钮的背景色
    lightBtnColor: '#34A853', // 轻按钮的背景色
    primaryBtnBgColor: '#34A853', // 轻按钮的背景色
    primaryBtnColor: '#fff', // 轻按钮的背景色
    cardBgColor: 'rgba(255, 255, 255, 0.05)',
  },
  light: {
    bgColor: '#F8F9FA', //main content背景色
    headerBgColor: '#fff',
    borderColor: '#2B332D',
    textColor: '#2B332D',
    lightBtnBgColor: '#fff', // 轻按钮的背景色
    lightBtnColor: '#34A853', // 轻按钮的文字颜色
    primaryBtnBgColor: '#34A853', // 按钮的背景色
    primaryBtnColor: '#fff', // 按钮的文字色
    cardBgColor: '#fff',
  },
};

export default themeLight;
