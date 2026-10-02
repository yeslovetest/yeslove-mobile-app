import axios, { AxiosRequestConfig } from "axios";

// Global axios instance: carries the base URL, auth header and refresh-on-401 handling.
export interface DeviceRegistration {
  token: string;
  platform: "ios" | "android";
  device_id: string;
}

export const pushApiFactory = {
  registerDevice: (data: DeviceRegistration, config?: AxiosRequestConfig) =>
    axios.post<{ message: string }>("/api/notifications/device-token", data, config),

  unregisterDevice: (token: string, config?: AxiosRequestConfig) =>
    axios.delete<{ message: string }>("/api/notifications/device-token", {
      ...config,
      data: { token },
    }),
};
