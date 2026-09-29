import type { KeyValueStore } from '@nexa/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage adapter for the `KeyValueStore` port. */
export const asyncStorageStore: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
