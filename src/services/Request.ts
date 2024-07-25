import axios, {
  type AxiosHeaders,
  type AxiosInstance,
  type HeadersDefaults,
  type Method,
  type RawAxiosRequestHeaders,
} from 'axios';
import Cookies from 'js-cookie';

class IRequest {
  private instance: AxiosInstance;

  constructor(private BASE_URL: string, private TIMEOUT: number = 10000) {
    const instance = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
    });
    instance.interceptors.request.use(config => {
      const token = Cookies.get('token');
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    instance.interceptors.response.use(
      resp => {
        if (resp.data) {
          const { code } = resp.data;
          if (code == 401) {
            Cookies.remove('accountId');
            window.location.replace('/login');
          }
        }
        return resp.data;
      },
      e => {
        const code = e.response.status;
        if (code == 401) {
          Cookies.remove('accountId');
          window.location.replace('/login');
        }
      }
    );

    this.instance = instance;
  }

  request = <R = any>(url: string, method: Method, others: Record<string, any>) => {
    return this.instance.request<any, R>({
      url,
      method,
      ...others,
    });
  };

  get = <R = any>(url: string, params?) => {
    return this.request<R>(url, 'GET', { params });
  };

  post = <R = any>(
    url: string,
    data,
    headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>
  ) => {
    return this.request<R>(url, 'POST', { data, headers });
  };
}

const iRequest = new IRequest(import.meta.env.VITE_BASE_URL);

export default iRequest;
export const { get, post, request } = iRequest;
