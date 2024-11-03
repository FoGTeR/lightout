import axios, { AxiosInstance } from "axios";

export class ScheduleFilterApiService {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  async fetchScheduleByGroup(group: string): Promise<any> {
    const response = await this.httpClient.post("/api/schedule", { group });
    return response.data;
  }

  async fetchScheduleByCity(city: string): Promise<any> {
    const response = await this.httpClient.post("/api/schedule", { city });
    return response.data;
  }

  async updateSchedule(scheduleData: any): Promise<void> {
    await this.httpClient.post("/api/updateschedule", scheduleData);
  }
}
