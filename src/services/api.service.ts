import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '@/utils/constants';

const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ========================================
// Request Interceptor
// ========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// ========================================
// Response Interceptor
// ========================================
apiClient.interceptors.response.use(
  response => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  error => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error('[API] Bad Request:', data);
          break;
        case 401:
          console.error('[API] Unauthorized');
          break;
        case 403:
          console.error('[API] Forbidden');
          break;
        case 404:
          console.error('[API] Not Found');
          break;
        case 500:
          console.error('[API] Server Error');
          break;
        default:
          console.error('[API] Error:', status, data);
      }
    } else if (error.request) {
      console.error('[API] Network Error:', error.request);
    } else {
      console.error('[API] Error:', error.message);
    }

    return Promise.reject(error);
  }
);
