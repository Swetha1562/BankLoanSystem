using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BankLoanSystem.Models;
using Microsoft.IdentityModel.Tokens;
 
namespace BankLoanSystem.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;
 
        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
 
        public string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };
 
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
 
            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new Exception("JWT key is missing in appsettings.json");
            }
 
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
 
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials
            );
 
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}