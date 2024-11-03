import fs from "fs";
import path from "path";

interface Street {
  name: string;
}

interface City {
  name: string;
  streets: Street[];
}

interface Region {
  name: string;
  cities: City[];
}

export interface Schedule {
  day: string;
  hours: number[];
}

interface Group {
  name: string;
  schedules: Schedule[];
}

export interface SchedulesByGroup {
  [groupName: string]: {
    [cityName: string]: {
      [houseNumber: string]: Schedule[];
    };
  };
}

const dataFilePath = path.join(__dirname, "../data/data.json");

export function loadData(): { regionsData: Region[]; schedulesData: SchedulesByGroup } {
  const jsonData = fs.readFileSync(dataFilePath, "utf8");
  const data = JSON.parse(jsonData);

  return {
    regionsData: data.regions,
    schedulesData: data.schedules,
  };
}

function getHourRange(start: number, end: number): number[] {
  const hours = [];
  for (let hour = start; hour <= end; hour++) {
    hours.push(hour);
  }
  return hours;
}

export function saveData(newSchedulesData: SchedulesByGroup): void {
  const { regionsData, schedulesData } = loadData();

  Object.entries(newSchedulesData).forEach(([groupName, groupData]) => {
    if (!schedulesData[groupName]) {
      schedulesData[groupName] = {};
    }
    Object.entries(groupData).forEach(([cityName, houses]) => {
      if (!schedulesData[groupName][cityName]) {
        schedulesData[groupName][cityName] = {};
      }
      Object.entries(houses).forEach(([houseNumber, newSchedules]) => {
        if (!schedulesData[groupName][cityName][houseNumber]) {
          schedulesData[groupName][cityName][houseNumber] = [];
        }

        newSchedules.forEach((newSchedule) => {
          const startHour = newSchedule.hours[0];
          const endHour = newSchedule.hours[1];
          const fullHoursRange = getHourRange(startHour, endHour);

          const existingSchedule = schedulesData[groupName][cityName][houseNumber].find((existing) => existing.day === newSchedule.day);

          if (existingSchedule) {
            existingSchedule.hours = Array.from(new Set([...existingSchedule.hours, ...fullHoursRange]));
          } else {
            schedulesData[groupName][cityName][houseNumber].push({
              day: newSchedule.day,
              hours: fullHoursRange,
            });
          }
        });
      });
    });
  });

  fs.writeFileSync(dataFilePath, JSON.stringify({ regions: regionsData, schedules: schedulesData }, null, 2), "utf8");
}

export function saveFile(newSchedulesData: SchedulesByGroup): void {
  const { regionsData, schedulesData } = loadData();

  Object.entries(newSchedulesData).forEach(([groupName, groupData]) => {
    if (!schedulesData[groupName]) {
      schedulesData[groupName] = {};
    }
    Object.entries(groupData).forEach(([cityName, houses]) => {
      if (!schedulesData[groupName][cityName]) {
        schedulesData[groupName][cityName] = {};
      }
      Object.entries(houses).forEach(([houseNumber, newSchedules]) => {
        if (!schedulesData[groupName][cityName][houseNumber]) {
          schedulesData[groupName][cityName][houseNumber] = [];
        }

        newSchedules.forEach((newSchedule) => {
          const fullHoursRange = newSchedule.hours;

          const existingSchedule = schedulesData[groupName][cityName][houseNumber].find((existing) => existing.day === newSchedule.day);

          if (existingSchedule) {
            existingSchedule.hours = fullHoursRange;
          } else {
            schedulesData[groupName][cityName][houseNumber].push({
              day: newSchedule.day,
              hours: fullHoursRange,
            });
          }
        });
      });
    });
  });

  fs.writeFileSync(dataFilePath, JSON.stringify({ regions: regionsData, schedules: schedulesData }, null, 2), "utf8");
}

export function updateData(schedule: string[][], group?: string, city?: string): { message: string; updatedSchedulesData: any } {
  const { regionsData, schedulesData } = loadData();

  const getDayName = (index: number): string => {
    const days = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"];
    return days[index];
  };

  if (group) {
    if (!schedulesData[group]) {
      return { message: "Групу не знайдено", updatedSchedulesData: schedulesData };
    }

    if (city) {
      if (!schedulesData[group][city]) {
        return { message: "Місто не знайдено в групі", updatedSchedulesData: schedulesData };
      }

      Object.keys(schedulesData[group][city]).forEach((houseNumber) => {
        for (let dayIndex = 0; dayIndex < schedule.length; dayIndex++) {
          const daySchedules = schedule[dayIndex];
          const dayName = getDayName(dayIndex);

          const existingSchedule = schedulesData[group][city][houseNumber].find((s) => s.day === dayName);

          if (existingSchedule) {
            const newHours = daySchedules.map((hourString, hourIndex) => (hourString === "Вимкнення" ? hourIndex + 1 : null)).filter((hour) => hour !== null);

            existingSchedule.hours = newHours;
          } else {
            const newHours = daySchedules.map((hourString, hourIndex) => (hourString === "Вимкнення" ? hourIndex + 1 : null)).filter((hour) => hour !== null);

            schedulesData[group][city][houseNumber].push({
              day: dayName,
              hours: newHours,
            });
          }
        }
      });

      return { message: "Розклад для групи успішно оновлено для міста " + city, updatedSchedulesData: schedulesData };
    } else {
      Object.keys(schedulesData[group]).forEach((cityName) => {
        const citySchedules = schedulesData[group][cityName];

        Object.keys(citySchedules).forEach((houseNumber) => {
          for (let dayIndex = 0; dayIndex < schedule.length; dayIndex++) {
            const daySchedules = schedule[dayIndex];
            const dayName = getDayName(dayIndex);

            const existingSchedule = citySchedules[houseNumber].find((s) => s.day === dayName);

            if (existingSchedule) {
              const newHours = daySchedules.map((hourString, hourIndex) => (hourString === "Вимкнення" ? hourIndex + 1 : null)).filter((hour) => hour !== null);

              existingSchedule.hours = newHours;
            } else {
              const newHours = daySchedules.map((hourString, hourIndex) => (hourString === "Вимкнення" ? hourIndex + 1 : null)).filter((hour) => hour !== null);

              citySchedules[houseNumber].push({
                day: dayName,
                hours: newHours,
              });
            }
          }
        });
      });

      return { message: "Розклад для групи успішно оновлено для всіх міст", updatedSchedulesData: schedulesData };
    }
  }

  return { message: "Необхідно вказати групу або місто для оновлення розкладу", updatedSchedulesData: schedulesData };
}

export { loadData as loadSchedulesData, saveData as updateSchedulesData };
