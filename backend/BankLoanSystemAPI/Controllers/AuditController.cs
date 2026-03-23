using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankLoanSystem.Data;

namespace BankLoanSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuditController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Officer")]
    [HttpGet]
    public IActionResult GetAuditLogs()
    {
        var logs = _context.AuditLogs
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.Action,
                a.PerformedByUserId,
                a.LoanApplicationId,
                a.Details,
                CreatedAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            })
            .ToList();

        return Ok(logs);
    }
}