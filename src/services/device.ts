import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

export interface DeviceInfo {
  platform: string;
  appVersion: string;
  deviceLanguage: string;
  deviceModel: string;
  deviceName: string;
  deviceType: string;
  osName: string;
  osVersion: string;
  pushNotificationToken: string | null;
  timezone: string;
  deviceId: string;
  isTablet: boolean;
  isEmulator: boolean;
}

// Dummy push notification token function - no actual notifications in Expo Go
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  // Expo Go'da push bildirimleri çalışmadığı için dummy token dönüyoruz
  return "expo-go-push-token-not-available";
};

// Cihaz bilgilerini al
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const pushToken = await registerForPushNotificationsAsync();
  
  return {
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version || '1.0.0',
    deviceLanguage: Localization.getLocales()[0]?.languageCode || 'unknown',
    deviceModel: Device.modelName || 'Unknown',
    deviceName: Device.deviceName || 'Unknown',
    deviceType: Device.deviceType === Device.DeviceType.PHONE ? 'Phone' : 
                Device.deviceType === Device.DeviceType.TABLET ? 'Tablet' : 'Unknown',
    osName: Device.osName || Platform.OS,
    osVersion: Device.osVersion || 'Unknown',
    pushNotificationToken: pushToken,
    timezone: new Date().getTimezoneOffset().toString() || 'Unknown',
    deviceId: Constants.installationId || 'Unknown',
    isTablet: Device.deviceType === Device.DeviceType.TABLET,
    isEmulator: !Device.isDevice,
  };
}; 