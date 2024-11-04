import axios, { AxiosInstance } from "axios";
import { ScheduleApiService } from "./ScheduleApiService";
import { ScheduleFilterApiService } from "./ScheduleFilterApiService";
import { ApiService } from "./ImportApiService";

export const apiService = new ScheduleApiService(
  axios.create({
    baseURL: "http://161.97.155.200:37504",
  })
);
export const apiServiceFilter = new ScheduleFilterApiService(
  axios.create({
    baseURL: "http://161.97.155.200:37504",
  })
);

export const apiServiceImport = new ApiService(
  axios.create({
    baseURL: "http://161.97.155.200:37504",
  })
);
