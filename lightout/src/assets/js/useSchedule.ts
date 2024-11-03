import { ref, computed, onMounted } from "vue";
import { ScheduleApiService } from "./ScheduleApiService";

export function useSchedule(apiService: ScheduleApiService) {
  const regions = ref<string[]>([]);
  const cities = ref<string[]>([]);
  const streets = ref<string[]>([]);
  const selectedRegion = ref("");
  const selectedCity = ref("");
  const selectedStreet = ref("");
  const houseNumber = ref("");
  const schedule = ref<string[][]>(Array.from({ length: 7 }, () => Array(24).fill("")));
  const group = ref("");
  const errorMessage = ref("");

  const currentDayIndex = computed(() => {
    const today = new Date();
    return (today.getDay() + 6) % 7;
  });

  async function exportToJson() {
    const formattedSchedule = schedule.value.map((daySchedule) => {
      const intervals = [];
      let start = null;

      daySchedule.forEach((status, hour) => {
        if (status === "Вимкнення" && start === null) {
          start = hour;
        } else if (status !== "Вимкнення" && start !== null) {
          intervals.push(`${String(start).padStart(2, "0")}:00-${String(hour).padStart(2, "0")}:00`);
          start = null;
        }
      });
      if (start !== null) {
        intervals.push(`${String(start).padStart(2, "0")}:00-24:00`);
      }

      return intervals;
    });

    const scheduleData = {
      selectedRegion: selectedRegion.value,
      selectedCity: selectedCity.value,
      selectedStreet: selectedStreet.value,
      houseNumber: houseNumber.value,
      schedule: formattedSchedule,
      group: group.value,
    };

    const json = JSON.stringify(scheduleData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedules.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function fetchRegions() {
    try {
      errorMessage.value = "";
      regions.value = await apiService.getRegions();
    } catch {
      errorMessage.value = "Ошибка при получении регионов";
    }
  }

  async function fetchCities() {
    try {
      errorMessage.value = "";
      cities.value = await apiService.getCities(selectedRegion.value);
      selectedCity.value = "";
      streets.value = [];
      selectedStreet.value = "";
      houseNumber.value = "";
    } catch {
      errorMessage.value = "Помилка під час отримання міст";
    }
  }

  async function fetchStreets() {
    try {
      errorMessage.value = "";
      streets.value = await apiService.getStreets(selectedCity.value);
      selectedStreet.value = "";
      houseNumber.value = "";
    } catch {
      errorMessage.value = "Ошибка при получении улиц";
    }
  }

  async function checkAndFetchSchedule() {
    if (selectedRegion.value && selectedCity.value && selectedStreet.value && houseNumber.value) {
      try {
        errorMessage.value = "";
        const newScheduleData = await apiService.fetchSchedule(selectedCity.value, houseNumber.value);
        const newSchedule = Array.from({ length: 7 }, () => Array(24).fill(""));

        newScheduleData.forEach((entry) => {
          const dayIndex = ["Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота", "Неділя"].indexOf(entry.day);
          if (dayIndex >= 0) {
            entry.hours.forEach((hour) => {
              newSchedule[dayIndex][hour - 1] = "Вимкнення";
            });
          }
        });

        schedule.value = newSchedule;
        group.value = [...new Set(newScheduleData.map((entry) => entry.groupName))][0];
      } catch (error) {
        errorMessage.value = error.response?.data || "Ошибка при получении расписания";
      }
    }
  }

  onMounted(fetchRegions);

  return {
    regions,
    cities,
    streets,
    selectedRegion,
    selectedCity,
    selectedStreet,
    houseNumber,
    schedule,
    currentDayIndex,
    group,
    errorMessage,
    fetchCities,
    fetchStreets,
    checkAndFetchSchedule,
    exportToJson,
  };
}

export const schedule_ = useSchedule;
