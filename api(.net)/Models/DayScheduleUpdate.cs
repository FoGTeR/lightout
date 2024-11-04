namespace api.Models
{
    public class DayScheduleUpdate
    {
        public required string Day { get; set; }
        public required List<int> Hours { get; set; } = new List<int>();
    }
}