using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankLoanSystem.Data;

namespace BankLoanSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("my")]
    public IActionResult GetMyNotifications()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("Invalid token.");

        var userId = int.Parse(userIdClaim);

        var notifications = _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.UserId,
                n.Message,
                n.IsRead,
                CreatedAt = ConvertToIST(n.CreatedAt)
            })
            .ToList();

        return Ok(notifications);
    }

    [Authorize(Roles = "Officer")]
    [HttpGet]
    public IActionResult GetAllNotifications()
    {
        var notifications = _context.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.UserId,
                n.Message,
                n.IsRead,
                CreatedAt = ConvertToIST(n.CreatedAt)
            })
            .ToList();

        return Ok(notifications);
    }

    private static string ConvertToIST(DateTime utcDate)
    {
        var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        var istTime = TimeZoneInfo.ConvertTimeFromUtc(utcDate, istZone);
        return istTime.ToString("yyyy-MM-dd HH:mm:ss");
    }
}