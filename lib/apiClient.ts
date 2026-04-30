import axios from "axios";

type RetriableRequestConfig = {
  _retry?: boolean;
  url?: string;
};

let refreshRequest: Promise<unknown> | null = null;

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const requestConfig = error.config as typeof error.config & RetriableRequestConfig;
    const status = error.response?.status;
    const requestUrl = requestConfig?.url ?? "";
    const isRefreshRequest = requestUrl.includes("/api/auth/refresh");
    const isLoginRequest = requestUrl.includes("/api/auth/login");
    const responseDetail =
      typeof error.response?.data?.detail === "string"
        ? error.response.data.detail.toLowerCase()
        : "";
    const shouldAttemptRefresh =
      status === 401 ||
      (status === 403 && responseDetail.includes("authentication credentials"));

    if (
      !shouldAttemptRefresh ||
      !requestConfig ||
      requestConfig._retry ||
      isRefreshRequest ||
      isLoginRequest
    ) {
      return Promise.reject(error);
    }

    requestConfig._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = api.post("/api/auth/refresh");
      }

      await refreshRequest;
      refreshRequest = null;

      return api(requestConfig);
    } catch (refreshError) {
      refreshRequest = null;
      return Promise.reject(refreshError);
    }
  }
);
