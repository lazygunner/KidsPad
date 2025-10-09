import { DeviceEventEmitter } from 'react-native';
import Config from 'react-native-config';
import ToastUtils, { ToastType } from './ToastUtils';
import StorageUtils from './StorageUtils';

export const SUCCESS_CODE = '00';
export const LOGIN_OUT_CODE = '44';
export const ERROR_CODE = '10000';

const DEFAULT_BASE_URL = 'https://api.kidsrkidschina.com';
const BaseUrl: string = (Config.API_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

const buildHeaders = async (): Promise<Record<string, string>> => {
  const token = (await StorageUtils.retrieveData<string>('token')) ?? '';
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Token': token,
  };
};

const withBaseUrl = (url: string): string => {
  if (url.startsWith('http')) {
    return url;
  }
  return `${BaseUrl}/${url.replace(/^\//, '')}`;
};

const withQuery = (url: string, params?: Record<string, unknown>): string => {
  if (!params || Object.keys(params).length === 0) {
    return withBaseUrl(url);
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    search.append(key, `${value}`);
  });
  const queryString = search.toString();
  const separator = url.includes('?') ? '&' : '?';
  return `${withBaseUrl(url)}${separator}${queryString}`;
};

const requestWithTimeout = async (input: string, init: RequestInit, timeout = 30000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

interface ApiResponse<T = any> {
  code: string;
  data?: T;
  msg?: string;
  token?: string;
  [key: string]: any;
}

const handleApiResponse = <T>(response: ApiResponse<T>, returnFull: boolean): T | ApiResponse<T> | undefined => {
  if (response.code === SUCCESS_CODE) {
    return returnFull ? response : response.data;
  }
  if (response.code === LOGIN_OUT_CODE) {
    DeviceEventEmitter.emit('toLogin');
  }
  const message = response.msg || '系统错误,请联系管理员';
  ToastUtils.show(message, response.code === LOGIN_OUT_CODE ? ToastType.INFO : ToastType.WARNING);
  return response;
};

export default class HttpUtils {
  static async getRequest<T>(url: string, params: Record<string, unknown> = {}): Promise<T | undefined> {
    const target = withQuery(url, params);
    try {
      const response = await requestWithTimeout(target, {
        method: 'GET',
        headers: await buildHeaders(),
      });
      if (!response.ok) {
        ToastUtils.show(`服务器繁忙，请稍后再试 (HTTP ${response.status})`, ToastType.ERROR);
        return undefined;
      }
      const payload = (await response.json()) as ApiResponse<T>;
      return handleApiResponse<T>(payload, false) as T | undefined;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        ToastUtils.show('请求超时，请稍后再试', ToastType.ERROR);
      } else {
        ToastUtils.show('当前网络不可用，请检查网络设置', ToastType.ERROR);
      }
      console.error('HttpUtils.getRequest error', { url, params, error });
      return undefined;
    }
  }

  static async postRequrst<T>(
    url: string,
    params: Record<string, unknown> = {},
    returnCode = false,
  ): Promise<T | ApiResponse<T> | undefined> {
    const target = withBaseUrl(url);
    try {
      const response = await requestWithTimeout(target, {
        method: 'POST',
        headers: await buildHeaders(),
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        ToastUtils.show(`服务器繁忙，请稍后再试 (HTTP ${response.status})`, ToastType.ERROR);
        return undefined;
      }
      const payload = (await response.json()) as ApiResponse<T>;
      return handleApiResponse<T>(payload, returnCode);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        ToastUtils.show('请求超时，请稍后再试', ToastType.ERROR);
      } else {
        ToastUtils.show('当前网络不可用，请检查网络设置', ToastType.ERROR);
      }
      console.error('HttpUtils.postRequrst error', { url, params, error });
      return undefined;
    }
  }
}

export { BaseUrl };
