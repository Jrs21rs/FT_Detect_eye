import * as SecureStore from 'expo-secure-store';

const USER_TOKEN_KEY = 'userToken';

export const tokenStorage = {
  getToken: () => SecureStore.getItemAsync(USER_TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(USER_TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(USER_TOKEN_KEY),
};
