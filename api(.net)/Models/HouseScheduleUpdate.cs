
using api.Models;

namespace api.Models
{
    public class HouseScheduleUpdate
    {
        public required string HouseNumber { get; set; }
        public List<DayScheduleUpdate> Days { get; set; } = new List<DayScheduleUpdate>();
    }
}