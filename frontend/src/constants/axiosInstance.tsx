// frontend/api/axiosInstance.js

import axios from 'axios';
import { SERVER_URL } from '../constants';

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📡 Sending request:', config);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (UPDATED HERE)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isExpected401 =
      error?.response?.status === 401 &&
      error?.config?.url?.includes('/auth/check');

    if (!isExpected401) {
      console.error('❌ API Error:', error);
    } else {
      console.log('⚠️ Expected 401 from /auth/check — suppressing log.');
    }

    return Promise.reject(error);
  }
);

export default api;
