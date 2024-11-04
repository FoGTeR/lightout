namespace api.Models
{
    public class ImportRequest
    {
        public required string Day { get; set; }
        public List<string[]> Schedules { get; set; } = new List<string[]>();
    }
}