import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const setupInterceptors = (store) => {
  // Response Interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Dispatch logout action directly using the type string to avoid circular dependency
        store.dispatch({ type: "auth/logout" });
        // window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
};

export default api;
