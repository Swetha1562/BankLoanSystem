using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        var normalizedRole = "Customer";
 
        if (_context.Users.Any(x => x.Email.ToLower() == normalizedEmail))
            return BadRequest("Email already exists.");
 
        /*if (normalizedRole != "Customer" && normalizedRole != "Officer")
            return BadRequest("Role must be either Customer or Officer.");*/
 
        if (!IsStrongPassword(dto.Password))
        {
            return BadRequest(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );
        }
 
        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = normalizedRole
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
 
    [HttpPost("forgot-password")]
    public IActionResult ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (dto == null)
            return BadRequest(new { message = "Request body is required." });
 
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required." });
 
        var normalizedEmail = dto.Email.Trim().ToLower();
 
        var user = _context.Users
            .AsEnumerable()
            .FirstOrDefault(x => x.Email.Trim().ToLower() == normalizedEmail);
 
        if (user == null)
            return NotFound(new { message = "No account found with this email." });
 
        return Ok(new
        {
            message = "Email verified successfully.",
            email = user.Email
        });
    }
 
    [HttpPost("reset-password")]
    public IActionResult ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (dto == null)
            return BadRequest(new { message = "Request body is required." });
 
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required." });
 
        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest(new { message = "New password is required." });
 
        if (string.IsNullOrWhiteSpace(dto.ConfirmPassword))
            return BadRequest(new { message = "Confirm password is required." });
 
        if (dto.NewPassword != dto.ConfirmPassword)
            return BadRequest(new { message = "Passwords do not match." });
 
        if (!IsStrongPassword(dto.NewPassword))
        {
            return BadRequest(new
            {
                message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            });
        }
 
        var normalizedEmail = dto.Email.Trim().ToLower();
 
        var user = _context.Users
            .AsEnumerable()
            .FirstOrDefault(x => x.Email.Trim().ToLower() == normalizedEmail);
 
        if (user == null)
            return NotFound(new { message = "No account found with this email." });
 
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetOtp = null;
        user.PasswordResetOtpExpiry = null;
 
        _context.SaveChanges();
 
        return Ok(new { message = "Password reset successfully." });
    }
 
    private bool IsStrongPassword(string password)
    {
        var regex = new System.Text.RegularExpressions.Regex(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=]).{8,}$"
        );
        return regex.IsMatch(password);
    }
}
 