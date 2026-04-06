using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankLoanSystem.Data;

namespace BankLoanSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Officer")]
    [HttpGet("officer-summary")]
    public IActionResult GetOfficerSummary()
    {
        var totalLoans = _context.LoanApplications.Count();
        var pendingLoans = _context.LoanApplications.Count(l => l.Status == "Pending");
        var approvedLoans = _context.LoanApplications.Count(l => l.Status == "Approved");
        var rejectedLoans = _context.LoanApplications.Count(l => l.Status == "Rejected");
        var highRiskLoans = _context.LoanApplications.Count(l => l.RiskLevel == "High");

        return Ok(new
        {
            totalLoans,
            pendingLoans,
            approvedLoans,
            rejectedLoans,
            highRiskLoans
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("customer-summary")]
    public IActionResult GetCustomerSummary()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("Invalid token.");

        var userId = int.Parse(userIdClaim);

        var customerLoans = _context.LoanApplications
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToList();

        var totalApplications = customerLoans.Count;
        var pendingApplications = customerLoans.Count(l => l.Status == "Pending");
        var approvedApplications = customerLoans.Count(l => l.Status == "Approved");
        var rejectedApplications = customerLoans.Count(l => l.Status == "Rejected");

        var latestLoan = customerLoans.FirstOrDefault();

        return Ok(new
        {
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            latestApplication = latestLoan == null ? null : new
            {
                latestLoan.Id,
                latestLoan.LoanType,
                latestLoan.Amount,
                latestLoan.Status,
                latestLoan.CurrentStage,
                latestLoan.RejectionReason,
                latestLoan.Remarks,
                latestLoan.RiskLevel,
                latestLoan.EligibilityScore,
                latestLoan.RecommendedDecision,
                CreatedAt = latestLoan.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                UpdatedAt = latestLoan.UpdatedAt == null
                    ? null
                    : latestLoan.UpdatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                PendingTime = latestLoan.Status == "Pending" && latestLoan.PendingSince.HasValue
                    ? FormatPendingTime(DateTime.UtcNow - latestLoan.PendingSince.Value)
                    : null
            }
        });
    }
    private static string FormatPendingTime(TimeSpan duration)
    {
        return $"{duration.Days}d {duration.Hours}h {duration.Minutes}m";
    }
}
