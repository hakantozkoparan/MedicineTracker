import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { customTheme, theme } from '../../styles/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  icon?: string;
  multiline?: boolean;
  numberOfLines?: number;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  icon,
  multiline = false,
  numberOfLines = 1,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          multiline && { height: numberOfLines * 30 },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.placeholder}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: customTheme.spacing.l,
    width: '100%',
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: customTheme.fontFamily.medium,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: customTheme.borderRadius.l,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: customTheme.spacing.l,
    height: 56,
    ...customTheme.shadows.small,
  },
  focusedInput: {
    borderColor: theme.colors.primary,
    ...customTheme.shadows.medium,
  },
  errorInput: {
    borderColor: theme.colors.error,
    ...customTheme.shadows.small,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: theme.colors.text,
    height: '100%',
    fontFamily: customTheme.fontFamily.regular,
    backgroundColor: 'transparent',
    letterSpacing: 0.1,
  },
  icon: {
    marginRight: customTheme.spacing.s,
  },
  eyeIcon: {
    padding: customTheme.spacing.s,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    marginTop: 5,
    fontFamily: customTheme.fontFamily.medium,
  },
});

export default Input; 