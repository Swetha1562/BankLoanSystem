using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using BankLoanSystem.Data;
using BankLoanSystem.DTOs;
using BankLoanSystem.Hubs;
using BankLoanSystem.Models;
using BankLoanSystem.Services;

namespace BankLoanSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoanController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EligibilityService _eligibilityService;
    private readonly BankDataService _bankDataService;
    private readonly IHubContext<NotificationHub> _hubContext;

    public LoanController(
        ApplicationDbContext context,
        EligibilityService eligibilityService,
        BankDataService bankDataService,
        IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _eligibilityService = eligibilityService;
        _bankDataService = bankDataService;
        _hubContext = hubContext;
    }

    [Authorize(Roles = "Customer")]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply([FromBody] ApplyLoanDto dto)
    {
        if (dto.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");

        if (dto.DurationMonths <= 0)
            return BadRequest("DurationMonths must be greater than zero.");

        if (string.IsNullOrWhiteSpace(dto.LoanType))
            return BadRequest("LoanType is required.");

        if (string.IsNullOrWhiteSpace(dto.Purpose))
            return BadRequest("Purpose is required.");

        if (dto.AnnualIncome <= 0)
            return BadRequest("AnnualIncome must be greater than zero.");

        if (dto.EmploymentYears < 0)
            return BadRequest("EmploymentYears cannot be negative.");

        if (dto.Age <= 0)
            return BadRequest("Age must be greater than zero.");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("Invalid token.");

        var userId = int.Parse(userIdClaim);

        var bankData = _bankDataService.GetCustomerFinancialData(userId);

        var evaluation = _eligibilityService.Evaluate(
            dto,
            bankData.CreditScore,
            bankData.ExistingLiabilities);

        var loan = new LoanApplication
        {
            UserId = userId,
            LoanType = dto.LoanType,
            Amount = dto.Amount,
            Purpose = dto.Purpose,
            DurationMonths = dto.DurationMonths,
            AnnualIncome = dto.AnnualIncome,
            EmploymentYears = dto.EmploymentYears,
            Age = dto.Age,
            CreditScore = bankData.CreditScore,
            ExistingLiabilities = bankData.ExistingLiabilities,
            Status = "Pending",
            CurrentStage = "Submitted",
            RiskLevel = evaluation.RiskLevel,
            EligibilityScore = evaluation.Score,
            RecommendedDecision = evaluation.RecommendedDecision,
            CreatedAt = DateTime.UtcNow,
            PendingSince = DateTime.UtcNow
        };

        _context.LoanApplications.Add(loan);
        await _context.SaveChangesAsync();

        _context.LoanStatusHistories.Add(new LoanStatusHistory
        {
            LoanApplicationId = loan.Id,
            OldStatus = "None",
            NewStatus = "Pending",
            ChangedByUserId = userId,
            Remarks = "Loan submitted"
        });

        _context.Notifications.Add(new Notification
        {
            UserId = userId,
            Message = $"Your loan application #{loan.Id} has been submitted.",
            IsRead = false,
            CreatedAt = loan.CreatedAt
        });

        _context.AuditLogs.Add(new AuditLog
        {
            Action = "Loan Applied",
            PerformedByUserId = userId,
            LoanApplicationId = loan.Id,
            Details = $"Recommended decision: {evaluation.RecommendedDecision}, Risk: {evaluation.RiskLevel}"
        });

        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
        {
            loanId = loan.Id,
            status = loan.Status,
            currentStage = loan.CurrentStage
        });

        return Ok(new
        {
            message = "Loan application submitted successfully.",
            loanId = loan.Id,
            creditScore = bankData.CreditScore,
            existingLiabilities = bankData.ExistingLiabilities,
            eligibilityScore = evaluation.Score,
            riskLevel = evaluation.RiskLevel,
            recommendedDecision = evaluation.RecommendedDecision,
            reasons = evaluation.Reasons,
            rowVersion = loan.RowVersion != null ? Convert.ToBase64String(loan.RowVersion) : null
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("myloans")]
    public async Task<IActionResult> GetMyLoans()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("Invalid token.");

        var userId = int.Parse(userIdClaim);

        var loans = await _context.LoanApplications
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new
            {
                l.Id,
                l.LoanType,
                l.Amount,
                l.Purpose,
                l.DurationMonths,
                l.AnnualIncome,
                l.EmploymentYears,
                l.Age,
                l.CreditScore,
                l.ExistingLiabilities,
                l.Status,
                l.CurrentStage,
                l.RejectionReason,
                l.Remarks,
                l.RiskLevel,
                l.EligibilityScore,
                l.RecommendedDecision,
                RowVersion = l.RowVersion != null ? Convert.ToBase64String(l.RowVersion) : null,
                CreatedAt = ConvertToIST(l.CreatedAt),
                UpdatedAt = l.UpdatedAt == null
                    ? null
                    : ConvertToIST(l.UpdatedAt.Value),
                PendingTime = l.Status == "Pending"
                    ? FormatPendingTime(DateTime.UtcNow - l.PendingSince)
                    : null
            })
            .ToListAsync();

        return Ok(loans);
    }

    [Authorize]
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim) || string.IsNullOrWhiteSpace(roleClaim))
            return Unauthorized("Invalid token.");

        var userId = int.Parse(userIdClaim);

        var loan = _context.LoanApplications.FirstOrDefault(l => l.Id == id);

        if (loan == null)
            return NotFound("Loan not found.");

        if (roleClaim == "Customer" && loan.UserId != userId)
            return Forbid();

        return Ok(new
        {
            loan.Id,
            loan.UserId,
            loan.LoanType,
            loan.Amount,
            loan.Purpose,
            loan.DurationMonths,
            loan.AnnualIncome,
            loan.EmploymentYears,
            loan.Age,
            loan.CreditScore,
            loan.ExistingLiabilities,
            loan.Status,
            loan.CurrentStage,
            loan.RejectionReason,
            loan.Remarks,
            loan.RiskLevel,
            loan.EligibilityScore,
            loan.RecommendedDecision,
            RowVersion = loan.RowVersion != null ? Convert.ToBase64String(loan.RowVersion) : null,
            CreatedAt = ConvertToIST(loan.CreatedAt),
            UpdatedAt = loan.UpdatedAt == null
                ? null
                : ConvertToIST(loan.UpdatedAt.Value),
            PendingTime = loan.Status == "Pending"
                ? FormatPendingTime(DateTime.UtcNow - loan.PendingSince)
                : null
        });
    }

    [Authorize(Roles = "Officer")]
    [HttpGet]
    public IActionResult GetAll()
    {
        var loans = _context.LoanApplications
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new
            {
                l.Id,
                l.UserId,
                l.LoanType,
                l.Amount,
                l.Purpose,
                l.DurationMonths,
                l.AnnualIncome,
                l.EmploymentYears,
                l.Age,
                l.CreditScore,
                l.ExistingLiabilities,
                l.RiskLevel,
                l.EligibilityScore,
                l.RecommendedDecision,
                l.Status,
                l.CurrentStage,
                l.RejectionReason,
                l.Remarks,
                RowVersion = l.RowVersion != null ? Convert.ToBase64String(l.RowVersion) : null,
                CreatedAt = ConvertToIST(l.CreatedAt),
                UpdatedAt = l.UpdatedAt == null
                    ? null
                    : ConvertToIST(l.UpdatedAt.Value),
                PendingTime = l.Status == "Pending"
                    ? FormatPendingTime(DateTime.UtcNow - l.PendingSince)
                    : null
            })
            .ToList();

        return Ok(loans);
    }

    [Authorize(Roles = "Officer")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(int id, [FromBody] ApproveLoanDto? dto)
    {
        dto ??= new ApproveLoanDto();

        if (string.IsNullOrWhiteSpace(dto.RowVersion))
            return BadRequest("RowVersion is required for approval.");

        var officerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(officerIdClaim))
            return Unauthorized("Invalid token.");

        var officerId = int.Parse(officerIdClaim);

        var loan = await _context.LoanApplications.FirstOrDefaultAsync(l => l.Id == id);

        if (loan == null)
            return NotFound("Loan not found.");

        if (loan.Status != "Pending")
            return BadRequest("Only pending loans can be approved.");

        try
        {
            var originalRowVersion = Convert.FromBase64String(dto.RowVersion);
            _context.Entry(loan).Property(x => x.RowVersion).OriginalValue = originalRowVersion;

            var oldStatus = loan.Status;

            loan.Status = "Approved";
            loan.CurrentStage = "Final Decision";
            loan.Remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? "Approved" : dto.Remarks;
            loan.RejectionReason = null;
            loan.UpdatedAt = DateTime.UtcNow;

            _context.LoanStatusHistories.Add(new LoanStatusHistory
            {
                LoanApplicationId = loan.Id,
                OldStatus = oldStatus,
                NewStatus = "Approved",
                ChangedByUserId = officerId,
                Remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? "Approved" : dto.Remarks
            });

            _context.Notifications.Add(new Notification
            {
                UserId = loan.UserId,
                Message = $"Your loan application #{loan.Id} has been approved.",
                IsRead = false,
                CreatedAt = loan.UpdatedAt ?? DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Loan Approved",
                PerformedByUserId = officerId,
                LoanApplicationId = loan.Id,
                Details = string.IsNullOrWhiteSpace(dto.Remarks) ? "Loan approved." : dto.Remarks
            });

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
            {
                loanId = loan.Id,
                status = loan.Status,
                remarks = loan.Remarks
            });

            return Ok(new
            {
                message = "Loan approved successfully.",
                rowVersion = loan.RowVersion != null ? Convert.ToBase64String(loan.RowVersion) : null
            });
        }
        catch (DbUpdateConcurrencyException)
        {
            var currentLoan = await _context.LoanApplications
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id);

            return Conflict(new
            {
                message = "This loan application was modified by another officer. Please refresh and try again.",
                latestRowVersion = currentLoan?.RowVersion != null
                    ? Convert.ToBase64String(currentLoan.RowVersion)
                    : null,
                latestStatus = currentLoan?.Status
            });
        }
        catch (FormatException)
        {
            return BadRequest("Invalid RowVersion format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Approve failed: {ex.Message}");
        }
    }

    [Authorize(Roles = "Officer")]
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectLoanDto? dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Remarks))
            return BadRequest("Remarks are required for rejection.");

        if (string.IsNullOrWhiteSpace(dto.RowVersion))
            return BadRequest("RowVersion is required for rejection.");

        var officerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(officerIdClaim))
            return Unauthorized("Invalid token.");

        var officerId = int.Parse(officerIdClaim);

        var loan = await _context.LoanApplications.FirstOrDefaultAsync(l => l.Id == id);

        if (loan == null)
            return NotFound("Loan not found.");

        if (loan.Status != "Pending")
            return BadRequest("Only pending loans can be rejected.");

        try
        {
            var originalRowVersion = Convert.FromBase64String(dto.RowVersion);
            _context.Entry(loan).Property(x => x.RowVersion).OriginalValue = originalRowVersion;

            var oldStatus = loan.Status;

            loan.Status = "Rejected";
            loan.CurrentStage = "Final Decision";
            loan.RejectionReason = dto.Remarks;
            loan.Remarks = dto.Remarks;
            loan.UpdatedAt = DateTime.UtcNow;

            _context.LoanStatusHistories.Add(new LoanStatusHistory
            {
                LoanApplicationId = loan.Id,
                OldStatus = oldStatus,
                NewStatus = "Rejected",
                ChangedByUserId = officerId,
                Remarks = dto.Remarks
            });

            _context.Notifications.Add(new Notification
            {
                UserId = loan.UserId,
                Message = $"Your loan application #{loan.Id} has been rejected. Reason: {dto.Remarks}",
                IsRead = false,
                CreatedAt = loan.UpdatedAt ?? DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Loan Rejected",
                PerformedByUserId = officerId,
                LoanApplicationId = loan.Id,
                Details = dto.Remarks
            });

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
            {
                loanId = loan.Id,
                status = loan.Status,
                rejectionReason = loan.RejectionReason
            });

            return Ok(new
            {
                message = "Loan rejected successfully.",
                rowVersion = loan.RowVersion != null ? Convert.ToBase64String(loan.RowVersion) : null
            });
        }
        catch (DbUpdateConcurrencyException)
        {
            var currentLoan = await _context.LoanApplications
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id);

            return Conflict(new
            {
                message = "This loan application was modified by another officer. Please refresh and try again.",
                latestRowVersion = currentLoan?.RowVersion != null
                    ? Convert.ToBase64String(currentLoan.RowVersion)
                    : null,
                latestStatus = currentLoan?.Status
            });
        }
        catch (FormatException)
        {
            return BadRequest("Invalid RowVersion format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Reject failed: {ex.Message}");
        }
    }

    private static string FormatPendingTime(TimeSpan duration)
    {
        return $"{duration.Days}d {duration.Hours}h {duration.Minutes}m";
    }

    private static string ConvertToIST(DateTime utcDate)
    {
        var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        var istTime = TimeZoneInfo.ConvertTimeFromUtc(utcDate, istZone);
        return istTime.ToString("yyyy-MM-dd HH:mm:ss");
    }
}