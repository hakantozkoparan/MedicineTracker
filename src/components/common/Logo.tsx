import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { customTheme, theme } from '../../styles/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showTitle = true }) => {
  const getLogoSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40 };
      case 'medium':
        return { width: 80, height: 80 };
      case 'large':
        return { width: 120, height: 120 };
      default:
        return { width: 80, height: 80 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 24;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, getLogoSize()]}>
        <Text style={[styles.logoText, { fontSize: getFontSize() * 0.8 }]}>mT</Text>
      </View>
      {showTitle && (
        <Text style={[styles.title, { fontSize: getFontSize() }]}>
          Medicine<Text style={{ color: theme.colors.primary }}>Tracker</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...customTheme.shadows.medium,
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    marginTop: customTheme.spacing.m,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default Logo; 