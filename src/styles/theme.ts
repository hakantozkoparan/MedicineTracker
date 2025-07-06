import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const { width, height } = Dimensions.get('window');

// Özel tema renkleri ve ayarları
const customColors = {
  light: {
    primary: '#4ADE80', // Ana renk (açık yeşil)
    secondary: '#22C55E', // İkincil renk (soft koyu yeşil)
    accent: '#A7F3D0', // Vurgu rengi (çok açık yeşil)
    background: '#F6FFF8', // Arka plan rengi (çok açık yeşil-beyaz)
    surface: '#FFFFFF', // Yüzey rengi (beyaz)
    text: '#1A2E05', // Metin rengi (koyu yeşil-gri)
    error: '#F87171', // Hata rengi (soft kırmızı)
    success: '#22C55E', // Başarı rengi (canlı yeşil)
    warning: '#FBBF24', // Uyarı rengi (soft turuncu)
    info: '#34D399', // Bilgi rengi (turkuaz-yeşil)
    placeholder: '#A3A3A3', // Placeholder rengi (gri)
    border: '#D1FAE5', // Kenarlık rengi (açık yeşil-gri)
    card: '#FFFFFF', // Kart arka plan rengi (beyaz)
    notification: '#F87171', // Bildirim rengi (soft kırmızı)
  },
  dark: {
    primary: '#22C55E', // Ana renk (canlı yeşil)
    secondary: '#166534', // İkincil renk (koyu yeşil)
    accent: '#065F46', // Vurgu rengi (çok koyu yeşil)
    background: '#101F14', // Arka plan rengi (siyahımsı koyu yeşil)
    surface: '#1E293B', // Yüzey rengi (koyu gri-yeşil)
    text: '#F0FFF4', // Metin rengi (açık yeşil-beyaz)
    error: '#F87171', // Hata rengi (soft kırmızı)
    success: '#4ADE80', // Başarı rengi (açık yeşil)
    warning: '#FBBF24', // Uyarı rengi (soft turuncu)
    info: '#34D399', // Bilgi rengi (turkuaz-yeşil)
    placeholder: '#64748B', // Placeholder rengi (gri-mavi)
    border: '#334155', // Kenarlık rengi (koyu gri)
    card: '#1E293B', // Kart arka plan rengi (koyu gri-yeşil)
    notification: '#F87171', // Bildirim rengi (soft kırmızı)
  }
};

export const customTheme = {
  fontFamily: {
    regular: 'Inter', // veya 'Roboto', projenizde hangisi yüklüyse onu kullanabilirsiniz
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },
  spacing: {
    xs: 6,
    s: 12,
    m: 20,
    l: 32,
    xl: 48,
  },
  borderRadius: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
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