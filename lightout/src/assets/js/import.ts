import { ref } from "vue";
import { Importer, ExcelImporter, JSONImporter, ApiService } from "./ImportApiService";

function validateData(data: Array<any>): boolean {
  return data.every((row) => row.length > 1 && typeof row[0] === "number");
}

export function useImport(apiService: ApiService) {
  const selectedDay = ref<string>("");
  const error = ref<string>("");
  const successMessage = ref<string>("");

  async function importData(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      error.value = "Будь ласка, виберіть файл для імпорту.";
      return;
    }

    const reader = new FileReader();
    const fileType = file.type;
    const importer: Importer | null =
      fileType === "application/json"
        ? new JSONImporter()
        : fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType === "application/vnd.ms-excel"
        ? new ExcelImporter()
        : null;

    if (!importer) {
      error.value = "Непідтримуваний формат файлу!";
      return;
    }

    reader.onload = async (e) => {
      try {
        const data = await importer.importData(e.target?.result as any);
        if (validateData(data)) {
          await apiService.saveSchedule(selectedDay.value, data);
          successMessage.value = "Дані успішно імпортовані!";
          error.value = "";
        } else {
          error.value = "Неправильний формат даних!";
          successMessage.value = "";
        }
      } catch (err) {
        error.value = `Помилка при обробці файлу! ${err}`;
        successMessage.value = "";
      }
    };

    reader.onerror = () => {
      error.value = "Помилка при імпорті даних!";
    };

    if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType === "application/vnd.ms-excel") {
      reader.readAsArrayBuffer(file);
    } else if (fileType === "application/json") {
      reader.readAsText(file);
    }
  }

  return {
    selectedDay,
    error,
    successMessage,
    importData,
  };
}

export const import_ = useImport;
