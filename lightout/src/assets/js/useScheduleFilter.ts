import { ref, computed } from "vue";
import { ScheduleFilterApiService } from "./ScheduleFilterApiService";

export function useScheduleFilter(apiService: ScheduleFilterApiService) {
  const schedule = ref<string[][]>(Array.from({ length: 7 }, () => Array(24).fill("")));
  const group = ref("");
  const groupNumber = ref("");
  const city = ref("");
  const errorMessage = ref("");
  const isEditing = ref(false);

  const currentDayIndex = computed(() => {
    const today = new Date();
    return (today.getDay() + 6) % 7;
  });

  function toggleEditMode() {
    isEditing.value = !isEditing.value;
  }

  function toggleLight(dayIndex: number, hourIndex: number) {
    if (isEditing.value) {
      schedule.value[dayIndex][hourIndex] = schedule.value[dayIndex][hourIndex] === "Вимкнення" ? "" : "Вимкнення";
    }
  }

  async function saveSchedule() {
    try {
      await apiService.updateSchedule({
        schedule: schedule.value,
        group: group.value,
        city: city.value,
      });
      isEditing.value = false;
    } catch (error) {
      console.error("Ошибка при сохранении расписания:", error);
      errorMessage.value = "Ошибка при сохранении расписания";
    }
  }

  async function checkAndFetchSchedule() {
    if (groupNumber.value) {
      await fetchScheduleByGroup();
    } else if (city.value) {
      await fetchScheduleByCity();
    } else {
      errorMessage.value = "Необхідно ввести номер групи або місто перед отриманням розкладу.";
    }
  }

  async function fetchScheduleByGroup() {
    try {
      errorMessage.value = "";
      const newScheduleData = await apiService.fetchScheduleByGroup(groupNumber.value);

      processScheduleData(newScheduleData);
    } catch (error) {
      console.error("Ошибка при получении расписания по группе:", error);
      errorMessage.value = error.response?.data || "Ошибка при получении расписания по группе";
    }
  }

  async function fetchScheduleByCity() {
    try {
      errorMessage.value = "";
      const newScheduleData = await apiService.fetchScheduleByCity(city.value);

      processScheduleData(newScheduleData);
    } catch (error) {
      console.error("Ошибка при получении расписания по городу:", error);
      errorMessage.value = error.response?.data || "Ошибка при получении расписания по городу";
    }
  }

  function processScheduleData(newScheduleData: any) {
    const newSchedule = Array.from({ length: 7 }, () => Array(24).fill(""));
    newScheduleData.forEach((entry: any) => {
      const dayIndex = ["Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота", "Неділя"].indexOf(entry.day);
      if (dayIndex >= 0) {
        entry.hours.forEach((hour: number) => {
          newSchedule[dayIndex][hour - 1] = "Вимкнення";
        });
      }
    });

    schedule.value = newSchedule;
    group.value = newScheduleData.length > 0 ? newScheduleData[0].groupName : "";
  }

  return {
    schedule,
    currentDayIndex,
    group,
    groupNumber,
    city,
    errorMessage,
    isEditing,
    toggleEditMode,
    toggleLight,
    saveSchedule,
    checkAndFetchSchedule,
  };
}

export const scheduleFilter = useScheduleFilter;
