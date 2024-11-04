namespace api.Models
{
    public class ScheduleResponse
    {
        public required string Group { get; set; }
        public required string City { get; set; }
        public required string HouseNumber { get; set; }
        public required string Day { get; set; }
        public required List<int> Hours { get; set; } = new List<int>();
    }
}