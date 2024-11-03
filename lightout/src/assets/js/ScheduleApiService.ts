import axios, { AxiosInstance } from "axios";

export class ScheduleApiService {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  async getRegions(): Promise<string[]> {
    const response = await this.httpClient.get("/api/regions");
    return response.data;
  }

  async getCities(region: string): Promise<string[]> {
    const response = await this.httpClient.get(`/api/cities?region=${region}`);
    return response.data;
  }

  async getStreets(city: string): Promise<string[]> {
    const response = await this.httpClient.get(`/api/streets?city=${city}`);
    return response.data;
  }

  async fetchSchedule(city: string, houseNumber: string): Promise<any> {
    const response = await this.httpClient.post("/api/schedule", {
      city,
      houseNumber,
    });
    return response.data;
  }
}
