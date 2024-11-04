
using api.Models;
using api.Models;


namespace api.Models
{
    public class RootData
    {
        public List<Region> Regions { get; set; } = new List<Region>();
        public Dictionary<string, Dictionary<string, Dictionary<string, List<ScheduleEntry>>>> Schedules { get; set; } = new();
    }
}