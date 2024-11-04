namespace api.Models
{
    public class ScheduleEntry
    {
        public required string Day { get; set; }
        public List<int> Hours { get; set; } = new List<int>();
    }
}