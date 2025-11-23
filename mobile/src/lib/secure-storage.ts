import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'smartbid-token';
const canUseSecureStore =
  Platform.OS !== 'web' &&
  typeof SecureStore.setItemAsync === 'function' &&
  typeof SecureStore.getItemAsync === 'function' &&
  typeof SecureStore.deleteItemAsync === 'function';

const setItem = (value: string) =>
  canUseSecureStore
    ? SecureStore.setItemAsync(TOKEN_KEY, value)
    : AsyncStorage.setItem(TOKEN_KEY, value);

const getItem = () =>
  canUseSecureStore ? SecureStore.getItemAsync(TOKEN_KEY) : AsyncStorage.getItem(TOKEN_KEY);

const deleteItem = () =>
  canUseSecureStore
    ? SecureStore.deleteItemAsync(TOKEN_KEY)
    : AsyncStorage.removeItem(TOKEN_KEY);

export const saveToken = async (token: string) => {
  await setItem(token);
};

export const readToken = async () => getItem();

export const deleteToken = async () => deleteItem();
