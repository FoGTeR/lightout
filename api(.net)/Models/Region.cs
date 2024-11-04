
using api.Models;

namespace api.Models
{
    public class Region
    {
        public string Name { get; set; } = string.Empty;
        public List<City> Cities { get; set; } = new List<City>();
    }
}