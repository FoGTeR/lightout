using api.Models;

namespace api.Models
{
    public class UpdateScheduleRequest
    {
        public required string Group { get; set; }
        public required string City { get; set; }
        public List<HouseScheduleUpdate> Schedule { get; set; } = new List<HouseScheduleUpdate>();
    }
}