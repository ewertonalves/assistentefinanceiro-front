import axios, { AxiosError } from 'axios';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/utils/constants';
import type { ApiError } from '@/types/api.types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let lastBackendMessage: string | null = null;

api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: any) => {
    try {
      lastBackendMessage = (response?.data as any)?.mensagem ?? null;
    } catch (_) {
      lastBackendMessage = null;
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    try {
      lastBackendMessage = (error.response?.data as any)?.mensagem ?? null;
    } catch (_) {
      lastBackendMessage = null;
    }
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('assistente_financeiro_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const getLastBackendMessage = (): string | null => lastBackendMessage;
export const clearLastBackendMessage = (): void => {
  lastBackendMessage = null;
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: unknown) {
    if (maxRetries === 0) throw error;

    let isRetryable = false;
    if (axios.isAxiosError(error)) {
      isRetryable = 
        (error as AxiosError).code === 'ECONNABORTED' ||
        (error as AxiosError).response?.status === 503 ||
        (error as AxiosError).response?.status === 408;
    }

    if (isRetryable) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, maxRetries - 1, delay * 2);
    }

    throw error;
  }
};

