using System.ComponentModel.DataAnnotations;

namespace BankLoanSystem.DTOs;

public class RegisterDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

   
    public string Role { get; set; } = "Customer";
}