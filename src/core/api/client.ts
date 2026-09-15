import { env } from "@core/config";
import axios from "axios";

// eslint-disable-next-line import/no-named-as-default-member -- Axios documents axios.create as its instance factory.
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
