import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { loadSchedulesData, saveData, Schedule, SchedulesByGroup, updateData, saveFile } from "./data";

const app = express();
const PORT = process.env.PORT || 37504;

app.use(cors());
app.use(bodyParser.json());

let { regionsData, schedulesData } = loadSchedulesData();

app.get("/api/regions", (req, res) => {
  const regions = regionsData.map((region) => region.name);
  res.json(regions);
});

app.get("/api/cities", (req, res) => {
  const regionName = req.query.region as string;
  const foundRegion = regionsData.find((region) => region.name === regionName);
  if (foundRegion) {
    const cities = foundRegion.cities.map((city) => city.name);
    res.json(cities);
  } else {
    res.status(404).send("Регіон не знайдено");
  }
});

app.get("/api/streets", (req, res) => {
  const cityName = req.query.city as string;
  const foundCity = regionsData.flatMap((region) => region.cities).find((c) => c.name === cityName);
  if (foundCity) {
    const streets = foundCity.streets.map((street) => street.name);
    res.json(streets);
  } else {
    res.status(404).send("Місто не знайдено");
  }
});

app.post("/api/schedule", (req, res) => {
  const { city, houseNumber, group } = req.body;

  if (group) {
    const groupEntries = Object.entries(schedulesData).flatMap(([groupName, groupData]) =>
      groupName === group
        ? Object.entries(groupData).flatMap(([cityName, houses]) =>
            Object.entries(houses).flatMap(([houseNum, schedule]) => schedule.map((entry) => ({ groupName: groupName, city: cityName, houseNumber: houseNum, ...entry })))
          )
        : []
    );

    if (groupEntries.length > 0) {
      res.json(groupEntries);
    } else {
      res.status(404).send("Розклад не знайдено для вказаної групи");
    }
    return;
  }

  if (city && houseNumber) {
    const groupEntries = Object.entries(schedulesData).flatMap(([groupName, group]) => (group[city]?.[houseNumber] ? group[city][houseNumber].map((schedule) => ({ groupName, ...schedule })) : []));

    if (groupEntries.length > 0) {
      res.json(groupEntries);
    } else {
      res.status(404).send("Розклад не знайдено для вказаного міста та номеру будинку");
    }
    return;
  }

  if (city) {
    const cityEntries = Object.entries(schedulesData).flatMap(([groupName, group]) =>
      Object.entries(group)
        .flatMap(([cityName, houses]) => Object.entries(houses).flatMap(([houseNum, schedule]) => schedule.map((entry) => ({ groupName, city: cityName, houseNumber: houseNum, ...entry }))))
        .filter((entry) => entry.city.toLowerCase() === city.toLowerCase())
    );

    if (cityEntries.length > 0) {
      res.json(cityEntries);
    } else {
      res.status(404).send("Розклад не знайдено для вказаного міста");
    }
    return;
  }

  res.status(404).send("Необхідно вказати місто та номер будинку або групу");
});

app.post("/api/updateschedule", (req: Request, res: Response) => {
  const { schedule, group, city } = req.body;

  const { message, updatedSchedulesData } = updateData(schedule, group, city);

  if (message.includes("не знайдена")) {
    res.status(404).send(message);
  } else if (message.includes("успішно оновлено")) {
    saveFile(updatedSchedulesData);
    res.status(200).send(message);
  } else {
    res.status(400).send(message);
  }
});
app.post("/api/import", (req: Request, res: Response) => {
  const importedData = req.body;
  const dayOfWeek: string = req.body.day;

  if (!Array.isArray(importedData.schedules) || !dayOfWeek) {
    res.status(400).send("Неправильний формат даних або відсутній день тижня");
    return;
  }

  importedData.schedules.forEach((entry: any) => {
    if (!Array.isArray(entry) || entry.length < 2) {
      return;
    }

    const group = entry[0];
    const scheduleEntries = entry.slice(1);

    if (!schedulesData[group]) {
      console.log(`Група ${group} не знайдена, пропускаємо.`);
      return;
    }

    scheduleEntries.forEach((timeInterval: string) => {
      const [start, end] = timeInterval.split("-");
      const startHour = parseInt(start.split(":")[0], 10);
      const endHour = parseInt(end.split(":")[0], 10);

      const newSchedule: Schedule = {
        day: dayOfWeek,
        hours: [startHour, endHour],
      };

      Object.entries(schedulesData[group]).forEach(([city, houses]) => {
        Object.entries(houses).forEach(([houseNumber, existingSchedules]) => {
          existingSchedules = existingSchedules.filter((schedule) => schedule.day !== dayOfWeek);

          existingSchedules.push(newSchedule);

          houses[houseNumber] = existingSchedules;
        });
      });
    });
  });

  saveData(schedulesData);
  res.status(200).send("Дані успішно імпортовані!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
