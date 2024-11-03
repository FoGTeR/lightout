import axios, { AxiosInstance } from "axios";
import * as XLSX from "xlsx";

export interface Importer {
  importData(data: any): Promise<Array<any>>;
}

export class ExcelImporter implements Importer {
  async importData(data: ArrayBuffer): Promise<Array<any>> {
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData: Array<any> = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return jsonData.filter((arr) => arr.length > 0);
  }
}

export class JSONImporter implements Importer {
  async importData(data: string): Promise<Array<any>> {
    const jsonData = JSON.parse(data);
    return Object.entries(jsonData).map(([houseNumber, timeRanges]) => [Number(houseNumber), ...timeRanges]);
  }
}

export class ApiService {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  async saveSchedule(day: string, data: Array<any>): Promise<void> {
    await this.httpClient.post("/api/import", {
      day,
      schedules: data,
    });
  }
}
