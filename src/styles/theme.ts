import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const { width, height } = Dimensions.get('window');

// Özel tema renkleri ve ayarları
const customColors = {
  light: {
    primary: '#4C6EF5', // Ana renk (mavi)
    secondary: '#7950F2', // İkincil renk (mor)
    accent: '#FF922B', // Vurgu rengi (turuncu)
    background: '#FFFFFF', // Arka plan rengi (beyaz)
    surface: '#F8F9FA', // Yüzey rengi (açık gri)
    text: '#212529', // Metin rengi (koyu gri)
    error: '#FA5252', // Hata rengi (kırmızı)
    success: '#40C057', // Başarı rengi (yeşil)
    warning: '#FD7E14', // Uyarı rengi (turuncu)
    info: '#339AF0', // Bilgi rengi (mavi)
    placeholder: '#ADB5BD', // Placeholder rengi (orta gri)
    border: '#DEE2E6', // Kenarlık rengi (açık gri)
    card: '#FFFFFF', // Kart arka plan rengi (beyaz)
    notification: '#FA5252', // Bildirim rengi (kırmızı)
  },
  dark: {
    primary: '#748FFC', // Ana renk (açık mavi)
    secondary: '#9775FA', // İkincil renk (açık mor)
    accent: '#FFA94D', // Vurgu rengi (açık turuncu)
    background: '#121212', // Arka plan rengi (siyah)
    surface: '#1E1E1E', // Yüzey rengi (koyu gri)
    text: '#F8F9FA', // Metin rengi (beyaz)
    error: '#FF6B6B', // Hata rengi (açık kırmızı)
    success: '#51CF66', // Başarı rengi (açık yeşil)
    warning: '#FF922B', // Uyarı rengi (açık turuncu)
    info: '#4DABF7', // Bilgi rengi (açık mavi)
    placeholder: '#868E96', // Placeholder rengi (orta gri)
    border: '#343A40', // Kenarlık rengi (koyu gri)
    card: '#1E1E1E', // Kart arka plan rengi (koyu gri)
    notification: '#FF6B6B', // Bildirim rengi (açık kırmızı)
  }
};

export const customTheme = {
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
  },
  fontSizes: {
    s: 12,
    m: 14,
    l: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    bold: '700',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

// Aydınlık tema
export const lightTheme = {
  ...MD3LightTheme,
  ...NavigationLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationLightTheme.colors,
    ...customColors.light,
  },
};

// Karanlık tema
export const darkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    ...customColors.dark,
  },
};

// Varsayılan tema
export const theme = lightTheme;

// Tema türü
export type Theme = typeof theme; 