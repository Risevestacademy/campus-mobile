import { env } from "@core/config";
import axios from "axios";

export const httpClient = axios.create({ baseURL: env.apiBaseUrl });

httpClient.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);
