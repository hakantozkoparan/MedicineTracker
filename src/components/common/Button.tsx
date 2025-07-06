import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { customTheme, theme } from '../../styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  mode = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (mode) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (mode) {
      case 'primary':
      case 'secondary':
        return styles.primaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={mode === 'outline' ? theme.colors.primary : '#fff'} />
      ) : (
        <Text style={[getTextStyle(), disabled && styles.disabledText, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: customTheme.borderRadius.l,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: customTheme.spacing.xl,
    ...customTheme.shadows.medium,
    flexDirection: 'row',
    minHeight: 52,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  primaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: customTheme.fontFamily.bold,
    letterSpacing: 0.2,
  },
  outlineText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: customTheme.fontFamily.bold,
    letterSpacing: 0.2,
  },
  disabledText: {
    color: '#BDBDBD',
    fontFamily: customTheme.fontFamily.medium,
  },
});

export default Button; 