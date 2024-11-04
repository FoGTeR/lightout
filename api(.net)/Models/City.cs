
using api.Models;
namespace api.Models
{
    public class City
    {
        public string Name { get; set; } = string.Empty;
        public List<Street> Streets { get; set; } = new List<Street>();
    }
}