import { Alert, Platform, ToastAndroid } from 'react-native';

export enum ToastType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

const toastPrefix: Record<ToastType, string> = {
  [ToastType.INFO]: '',
  [ToastType.SUCCESS]: '✔ ',
  [ToastType.WARNING]: '⚠ ',
  [ToastType.ERROR]: '✖ ',
};

const formatMessage = (message: string, type: ToastType): string => `${toastPrefix[type]}${message}`;

export default class ToastUtils {
  static show(message: string, type: ToastType = ToastType.INFO): void {
    const formatted = formatMessage(message, type);
    if (Platform.OS === 'android') {
      ToastAndroid.show(formatted, type === ToastType.SUCCESS ? ToastAndroid.SHORT : ToastAndroid.LONG);
      return;
    }
    Alert.alert('提示', formatted);
  }

  static showDuration(message: string, type: ToastType = ToastType.INFO): void {
    this.show(message, type);
  }
}
