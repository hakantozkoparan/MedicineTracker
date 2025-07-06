import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface ActiveSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  label?: string;
}

const ActiveSwitch: React.FC<ActiveSwitchProps> = ({ value, onValueChange, label }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#bbb', true: '#bbf7d0' }}
        thumbColor={value ? '#22c55e' : '#f4f4f4'}
        style={value ? styles.thumbShadow : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  thumbShadow: {
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    marginRight: 12,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
});

export default ActiveSwitch;
