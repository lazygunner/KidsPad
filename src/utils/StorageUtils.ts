import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Async storage helpers that automatically JSON serialize/deserialize payloads.
 */
export default class StorageUtils {
  static async storeData<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value ?? null);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      console.error('StorageUtils.storeData error', { key, error });
    }
  }

  static async retrieveData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null || jsonValue === undefined) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error('StorageUtils.retrieveData error', { key, error });
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('StorageUtils.remove error', { key, error });
    }
  }
}
