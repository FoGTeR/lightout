using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using api.Models;


[Route("api")]
[ApiController]
public class SchedulesController : ControllerBase
{
    private readonly string dataFilePath = Path.Combine(Directory.GetCurrentDirectory(), "data/data.json");
    private RootData? _data;

    public SchedulesController()
    {
        LoadData();
    }

    private void LoadData()
    {
        if (System.IO.File.Exists(dataFilePath))
        {
            var jsonData = System.IO.File.ReadAllText(dataFilePath);
            _data = JsonConvert.DeserializeObject<RootData>(jsonData);
        }
        else
        {
            _data = new RootData();
        }
    }

    [HttpGet("regions")]
    public IActionResult GetRegions()
    {
        var regions = _data?.Regions.Select(region => region.Name).ToList() ?? new List<string>();
        return Ok(regions);
    }

    [HttpGet("cities")]
    public IActionResult GetCities([FromQuery] string region)
    {
        var foundRegion = _data?.Regions.FirstOrDefault(r => r.Name == region);
        if (foundRegion != null)
        {
            var cities = foundRegion.Cities.Select(city => city.Name).ToList();
            return Ok(cities);
        }
        return NotFound("Регион не найден");
    }

    [HttpGet("streets")]
    public IActionResult GetStreets([FromQuery] string city)
    {
        var foundCity = _data?.Regions.SelectMany(region => region.Cities).FirstOrDefault(c => c.Name == city);
        if (foundCity != null)
        {
            var streets = foundCity.Streets.Select(street => street.Name).ToList();
            return Ok(streets);
        }
        return NotFound("Город не найден");
    }

    [HttpPost("schedule")]
    public IActionResult GetSchedule([FromBody] ScheduleRequest request)
    {
        Console.WriteLine(request);
        var schedules = GetSchedules(request.City, request.HouseNumber, request.Group);

        if (schedules.Any())
        {
            return Ok(schedules);
        }
        else
        {
            return NotFound("Розклад не знайдено для вказаних параметрів.");
        }
    }

    private List<ScheduleResponse> GetSchedules(string? city, string? houseNumber, string? group)
    {
        Console.WriteLine(city);
        Console.WriteLine(houseNumber);
        Console.WriteLine(group);
        var results = new List<ScheduleResponse>();

        var relevantSchedules = _data?.Schedules
            .Where(s => string.IsNullOrEmpty(group) || s.Key == group)
            .ToList();

        if (relevantSchedules != null && relevantSchedules.Any())
        {
            foreach (var groupSchedule in relevantSchedules)
            {
                if (!string.IsNullOrEmpty(city))
                {
                    if (groupSchedule.Value.TryGetValue(city, out var citySchedule))
                    {
                        if (!string.IsNullOrEmpty(houseNumber))
                        {
                            if (citySchedule.TryGetValue(houseNumber, out var houseSchedules))
                            {
                                foreach (var entry in houseSchedules)
                                {
                                    results.Add(new ScheduleResponse
                                    {
                                        Group = groupSchedule.Key,
                                        City = city,
                                        HouseNumber = houseNumber,
                                        Day = entry.Day,
                                        Hours = entry.Hours
                                    });
                                }
                            }
                            else
                            {
                                Console.WriteLine($"Номер будинку '{houseNumber}' не знайдено в місті '{city}' у групі '{groupSchedule.Key}'.");
                            }
                        }
                        else
                        {
                            foreach (var (houseNum, houseSchedules) in citySchedule)
                            {
                                foreach (var entry in houseSchedules)
                                {
                                    results.Add(new ScheduleResponse
                                    {
                                        Group = groupSchedule.Key,
                                        City = city,
                                        HouseNumber = houseNum,
                                        Day = entry.Day,
                                        Hours = entry.Hours
                                    });
                                }
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Місто '{city}' не знайдено в групі '{groupSchedule.Key}'.");
                    }
                }
                else
                {
                    foreach (var (cityName, houses) in groupSchedule.Value)
                    {
                        foreach (var (houseNum, houseSchedules) in houses)
                        {
                            foreach (var entry in houseSchedules)
                            {
                                results.Add(new ScheduleResponse
                                {
                                    Group = groupSchedule.Key,
                                    City = cityName,
                                    HouseNumber = houseNum,
                                    Day = entry.Day,
                                    Hours = entry.Hours
                                });
                            }
                        }
                    }
                }
            }
        }
        else
        {
            Console.WriteLine("Відповідних розкладів не знайдено.");
        }

        return results;
    }




    [HttpPost("updateschedule")]
    public IActionResult UpdateSchedule([FromBody] UpdateScheduleRequest request)
    {
        if (string.IsNullOrEmpty(request.Group) || string.IsNullOrEmpty(request.City))
        {
            return BadRequest("Необходимо указать группу и город для обновления расписания");
        }

        var schedules = _data?.Schedules;

        if (schedules == null || !schedules.ContainsKey(request.Group))
        {
            return NotFound("Групу не знайдено");
        }

        if (!schedules[request.Group].ContainsKey(request.City))
        {
            return NotFound("Місто не знайдено в групі");
        }

        var citySchedules = schedules[request.Group][request.City];

        foreach (var update in request.Schedule)
        {
            var houseNumber = update.HouseNumber;

            if (!citySchedules.ContainsKey(houseNumber))
            {
                citySchedules[houseNumber] = new List<ScheduleEntry>();
            }

            foreach (var daySchedule in update.Days)
            {
                var existingEntry = citySchedules[houseNumber].FirstOrDefault(e => e.Day == daySchedule.Day);

                if (existingEntry != null)
                {
                    existingEntry.Hours = daySchedule.Hours;
                }
                else
                {
                    citySchedules[houseNumber].Add(new ScheduleEntry
                    {
                        Day = daySchedule.Day,
                        Hours = daySchedule.Hours
                    });
                }
            }
        }
        SaveData();

        return Ok("Розклад для групи успішно оновлено");
    }
    [HttpPost("import")]
    public IActionResult ImportSchedules([FromBody] ImportRequest importRequest)
    {
        if (importRequest == null || importRequest.Schedules == null || !importRequest.Schedules.Any() || string.IsNullOrEmpty(importRequest.Day))
        {
            return BadRequest("Неправильний формат даних або відсутній день тижня");
        }

        foreach (var entry in importRequest.Schedules)
        {
            if (entry.Length < 2)
            {
                continue;
            }

            var group = entry[0];
            var scheduleEntries = entry.Skip(1).ToArray();

            if (!_data?.Schedules.ContainsKey(group) ?? true)
            {
                Console.WriteLine($"Група {group} не знайдена, пропускаємо.");
                continue;
            }

            foreach (var timeInterval in scheduleEntries)
            {
                var timeParts = timeInterval.Split('-');
                if (timeParts.Length != 2)
                {
                    continue;
                }

                var startHour = int.Parse(timeParts[0].Split(':')[0]);
                var endHour = int.Parse(timeParts[1].Split(':')[0]);

                var newSchedule = new ScheduleEntry
                {
                    Day = importRequest.Day,
                    Hours = new List<int> { startHour, endHour }
                };

                var groupSchedules = _data.Schedules[group];
                foreach (var city in groupSchedules.Keys)
                {
                    foreach (var houseNumber in groupSchedules[city].Keys)
                    {
                        groupSchedules[city][houseNumber] = groupSchedules[city][houseNumber]
                            .Where(s => s.Day != importRequest.Day)
                            .ToList();
                        groupSchedules[city][houseNumber].Add(newSchedule);
                    }
                }
            }
        }

        SaveData();
        return Ok("Дані успішно імпортовані!");
    }

    private void SaveData()
    {
        var jsonData = JsonConvert.SerializeObject(_data, Formatting.Indented);
        System.IO.File.WriteAllText(dataFilePath, jsonData);
    }

}



