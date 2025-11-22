import Cookies from 'js-cookie';
import { authAPI } from './api';

export const setAuthToken = (token) => {
  if (token) {
    Cookies.set('access_token', token, { expires: 7 }); // 7 days
  } else {
    Cookies.remove('access_token');
  }
};

export const getAuthToken = () => {
  return Cookies.get('access_token');
};

export const logout = () => {
  Cookies.remove('access_token');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

