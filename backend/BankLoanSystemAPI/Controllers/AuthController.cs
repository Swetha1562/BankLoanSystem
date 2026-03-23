using Microsoft.AspNetCore.Mvc;
using BankLoanSystem.DTOs;
using BankLoanSystem.Data;
using BankLoanSystem.Models;
using BankLoanSystem.Services;

namespace BankLoanSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(ApplicationDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto dto)
    {
        if (dto == null)
            return BadRequest("Request body is required.");

        if (string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest("Full name is required.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required.");

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required.");

        if (string.IsNullOrWhiteSpace(dto.Role))
            return BadRequest("Role is required.");

        var normalizedEmail = dto.Email.Trim().ToLower();

        if (_context.Users.Any(x => x.Email.ToLower() == normalizedEmail))
            return BadRequest("Email already exists.");

        if (dto.Role != "Customer" && dto.Role != "Officer")
            return BadRequest("Role must be either Customer or Officer.");

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role.Trim()
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        if (dto == null)
            return BadRequest("Request body is required.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required.");

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required.");

        var normalizedEmail = dto.Email.Trim().ToLower();

        var user = _context.Users.FirstOrDefault(x => x.Email.ToLower() == normalizedEmail);

        if (user == null)
            return Unauthorized("Invalid email.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid password.");

        var token = _tokenService.CreateToken(user);

        return Ok(new
        {
            message = "Login successful.",
            token,
            role = user.Role,
            email = user.Email,
            fullName = user.FullName
        });
    }
}
