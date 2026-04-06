using BankLoanSystem.Data;
using BankLoanSystem.DTOs;
using BankLoanSystem.Models;
using BankLoanSystem.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
 
namespace BankLoanSystemAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IWebHostEnvironment _environment;
 
        public LoanController(
            ApplicationDbContext context,
            IHubContext<NotificationHub> hubContext,
            IWebHostEnvironment environment)
        {
            _context = context;
            _hubContext = hubContext;
            _environment = environment;
        }
 
        [Authorize(Roles = "Customer")]
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyLoan([FromForm] LoanApplicationDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Loan data is required."
                    });
                }
 
                if (string.IsNullOrWhiteSpace(dto.LoanType) ||
                    string.IsNullOrWhiteSpace(dto.Purpose) ||
                    dto.Amount <= 0 ||
                    dto.DurationMonths <= 0 ||
                    dto.AnnualIncome <= 0 ||
                    dto.EmploymentYears < 0 ||
                    dto.Age <= 18 ||
                    dto.SalarySlip == null ||
                    dto.SalarySlip.Length == 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "All fields are required, including salary slip."
                    });
                }
 
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(userIdClaim))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid token."
                    });
                }
 
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid user ID."
                    });
                }
 
                string? salarySlipFilePath = null;
 
                if (dto.SalarySlip != null && dto.SalarySlip.Length > 0)
                {
                    var uploadsFolder = Path.Combine(_environment.WebRootPath, "Uploads");
 
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
 
                    var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(dto.SalarySlip.FileName)}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
 
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.SalarySlip.CopyToAsync(stream);
                    }
 
                    salarySlipFilePath = uniqueFileName;
                }
 
                decimal interestRate = dto.LoanType switch
                {
                   "Home Loan" => 8.75m,
                    "Vehicle Loan" => 9.50m,
                    "Education Loan" => 10.75m,
                    "Personal Loan" => 12.25m,
                    _ => 10.00m
                };
 
                int creditScore = 700;
                decimal existingLiabilities = 0m;
 
                int eligibilityScore = 0;
 
                eligibilityScore += dto.LoanType switch
                {
                    "Home Loan" => 18,
                    "Education Loan" => 14,
                    "Vehicle Loan" => 12,
                    "Personal Loan" => 8,
                    _ => 0
                };
 
                if (dto.Age >= 23 && dto.Age <= 55) eligibilityScore += 15;
                else if (dto.Age >= 21 && dto.Age <= 58) eligibilityScore += 12;
                else if (dto.Age > 18 && dto.Age <= 60) eligibilityScore += 8;
 
                if (dto.AnnualIncome >= 1200000) eligibilityScore += 22;
                else if (dto.AnnualIncome >= 900000) eligibilityScore += 18;
                else if (dto.AnnualIncome >= 700000) eligibilityScore += 15;
                else if (dto.AnnualIncome >= 500000) eligibilityScore += 12;
                else if (dto.AnnualIncome >= 350000) eligibilityScore += 7;
                else if (dto.AnnualIncome >= 250000) eligibilityScore += 3;
 
                if (dto.EmploymentYears >= 8) eligibilityScore += 18;
                else if (dto.EmploymentYears >= 5) eligibilityScore += 15;
                else if (dto.EmploymentYears >= 3) eligibilityScore += 10;
                else if (dto.EmploymentYears >= 1) eligibilityScore += 5;
 
                decimal loanToIncomeRatio = dto.AnnualIncome > 0 ? dto.Amount / dto.AnnualIncome : 99m;
 
                if (loanToIncomeRatio <= 0.20m) eligibilityScore += 18;
                else if (loanToIncomeRatio <= 0.50m) eligibilityScore += 15;
                else if (loanToIncomeRatio <= 1.00m) eligibilityScore += 10;
                else if (loanToIncomeRatio <= 1.50m) eligibilityScore += 4;
                else eligibilityScore -= 10;
 
                if (dto.DurationMonths >= 36 && dto.DurationMonths <= 120) eligibilityScore += 10;
                else if (dto.DurationMonths >= 24) eligibilityScore += 7;
                else if (dto.DurationMonths >= 12) eligibilityScore += 4;
                else if (dto.DurationMonths > 0) eligibilityScore += 1;
 
                decimal monthlyIncome = dto.AnnualIncome / 12m;
                decimal monthlyRate = interestRate / 12m / 100m;
 
                decimal estimatedEmi = 0m;
                if (dto.Amount > 0 && dto.DurationMonths > 0 && monthlyRate > 0)
                {
                    var factor = (decimal)Math.Pow((double)(1 + monthlyRate), dto.DurationMonths);
                    estimatedEmi = (dto.Amount * monthlyRate * factor) / (factor - 1);
                }
 
                decimal emiRatio = monthlyIncome > 0 ? estimatedEmi / monthlyIncome : 1m;
 
                if (emiRatio <= 0.20m) eligibilityScore += 20;
                else if (emiRatio <= 0.30m) eligibilityScore += 16;
                else if (emiRatio <= 0.40m) eligibilityScore += 10;
                else if (emiRatio <= 0.50m) eligibilityScore += 3;
                else eligibilityScore -= 15;
 
                if (loanToIncomeRatio > 1.5m) eligibilityScore -= 8;
                if (emiRatio > 0.45m) eligibilityScore -= 10;
                if (emiRatio > 0.55m) eligibilityScore -= 10;
                if (dto.AnnualIncome < 400000 && dto.Amount > 500000) eligibilityScore -= 10;
                if (dto.EmploymentYears < 2 && dto.Amount > 300000) eligibilityScore -= 8;
                if (dto.Age < 21 || dto.Age > 60) eligibilityScore -= 12;
 
                eligibilityScore = Math.Max(0, Math.Min(100, eligibilityScore));
 
                string riskLevel;
                string recommendedDecision;
 
                if (eligibilityScore >= 85)
                {
                    riskLevel = "Low";
                    recommendedDecision = "Approve";
                }
                else if (eligibilityScore >= 65)
                {
                    riskLevel = "Moderate";
                    recommendedDecision = "Review";
                }
                else if (eligibilityScore >= 40)
                {
                    riskLevel = "High";
                    recommendedDecision = "Needs Review";
                }
                else
                {
                    riskLevel = "Very High";
                    recommendedDecision = "Reject";
                }
                var isTime=TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,
                TimeZoneInfo.FindSystemTimeZoneById("India Standard TIme"));
 
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
                    CreditScore = creditScore,
                    ExistingLiabilities = existingLiabilities,
                    Status = "Pending",
                    CurrentStage = "Submitted",
                    Remarks = null,
                    RejectionReason = null,
                    RiskLevel = riskLevel,
                    EligibilityScore = eligibilityScore,
                    RecommendedDecision = recommendedDecision,
                    SalarySlipFilePath = salarySlipFilePath,
                    //CreatedAt = DateTime.UtcNow,
                    CreatedAt=isTime,
                    UpdatedAt = isTime,
                    PendingSince = isTime
                };
 
                _context.LoanApplications.Add(loan);
                await _context.SaveChangesAsync();
 
                var history = new LoanStatusHistory
                {
                    LoanApplicationId = loan.Id,
                    OldStatus = "Submitted",
                    NewStatus = "Pending",
                    ChangedByUserId = userId,
                    Remarks = "Loan submitted",
                    ChangedAt = isTime
                };
 
                _context.LoanStatusHistories.Add(history);
 
                var notification = new Notification
                {
                    UserId = userId,
                    Message = $"Your loan application #{loan.Id} has been submitted.",
                    IsRead = false,
                    CreatedAt = isTime
                };
 
                _context.Notifications.Add(notification);
 
                var audit = new AuditLog
                {
                    Action = "Loan Applied",
                    PerformedByUserId = userId,
                    LoanApplicationId = loan.Id,
                    Details = $"Loan submitted. Recommendation: {recommendedDecision}, Risk: {riskLevel}",
                    CreatedAt = isTime
                };
 
                _context.AuditLogs.Add(audit);
 
                await _context.SaveChangesAsync();
 
                await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
                {
                    loanId = loan.Id,
                    status = loan.Status,
                    currentStage = loan.CurrentStage
                });
 
                return Ok(new
                {
                    success = true,
                    message = "Loan applied successfully.",
                    loanId = loan.Id,
                    eligibilityScore = loan.EligibilityScore,
                    riskLevel = loan.RiskLevel,
                    recommendation = loan.RecommendedDecision,
                    salarySlipFilePath = salarySlipFilePath
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "An unexpected error occurred.",
                    detail = ex.InnerException?.Message ?? ex.Message
                });
            }
        }
 
        [Authorize(Roles = "Customer")]
        [HttpGet("myloans")]
        public async Task<IActionResult> GetMyLoans()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
 
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "Invalid token. User ID claim is missing." });
            }
 
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid user ID in token." });
            }
 
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
                    l.Remarks,
                    l.RejectionReason,
                    l.RiskLevel,
                    l.EligibilityScore,
                    l.RecommendedDecision,
                    CreatedAt = l.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    UpdatedAt = l.UpdatedAt.HasValue
                        ? l.UpdatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss")
                        : null,
                    PendingTime = l.PendingSince.HasValue
                        ? (DateTime.UtcNow - l.PendingSince.Value).TotalMinutes
                        : 0,
                    SalarySlipPath = l.SalarySlipFilePath
                })
                .ToListAsync();
 
            return Ok(loans);
        }
 
        [Authorize(Roles = "Officer")]
        [HttpGet]
        public async Task<IActionResult> GetAllLoans()
        {
            var loans = await _context.LoanApplications
                .Include(l => l.User)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    l.Id,
                    UserId = l.UserId,
                    CustomerName = l.User != null ? l.User.FullName : "N/A",
                    Email = l.User != null ? l.User.Email : "N/A",
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
                    l.Remarks,
                    l.RejectionReason,
                    l.RiskLevel,
                    l.EligibilityScore,
                    l.RecommendedDecision,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt,
                    l.PendingSince,
                    SalarySlipPath = l.SalarySlipFilePath
                })
                .ToListAsync();
 
            return Ok(loans);
        }
 
        [Authorize(Roles = "Officer")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLoanById(int id)
        {
            var loan = await _context.LoanApplications
                .Include(l => l.User)
                .Where(l => l.Id == id)
                .Select(l => new
                {
                    l.Id,
                    UserId = l.UserId,
                    CustomerName = l.User != null ? l.User.FullName : "N/A",
                    Email = l.User != null ? l.User.Email : "N/A",
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
                    l.Remarks,
                    l.RejectionReason,
                    l.RiskLevel,
                    l.EligibilityScore,
                    l.RecommendedDecision,
                    l.CreatedAt,
                    l.UpdatedAt,
                    l.PendingSince,
                    SalarySlipPath = l.SalarySlipFilePath
                })
                .FirstOrDefaultAsync();
 
            if (loan == null)
                return NotFound("Loan not found.");
 
            return Ok(loan);
        }
 
        [Authorize(Roles = "Officer")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveLoan(int id, [FromForm] LoanDecisionDto dto)
        {
            try
            {
                var loan = await _context.LoanApplications.FindAsync(id);
 
                if (loan == null)
                {
                    return NotFound(new { success = false, message = "Loan not found." });
                }
 
                if ((loan.Status ?? "").ToLower() != "pending")
                {
                    return BadRequest(new { success = false, message = "Only pending loans can be approved." });
                }
 
                loan.Status = "Approved";
                loan.CurrentStage = "Approved";
                loan.Remarks = dto?.Remarks ?? "Approved by officer";
                loan.RejectionReason = null;
                loan.UpdatedAt = DateTime.UtcNow;
                loan.PendingSince = DateTime.UtcNow;
 
                await _context.SaveChangesAsync();
 
                await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
                {
                    loanId = loan.Id,
                    status = loan.Status,
                    currentStage = loan.CurrentStage
                });
 
                return Ok(new
                {
                    success = true,
                    message = "Loan approved successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "An unexpected error occurred.",
                    detail = ex.InnerException?.Message ?? ex.Message
                });
            }
        }
 
        [Authorize(Roles = "Officer")]
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectLoan(int id, [FromForm] LoanDecisionDto dto)
        {
            try
            {
                var loan = await _context.LoanApplications.FindAsync(id);
 
                if (loan == null)
                    return NotFound(new { success = false, message = "Loan not found." });
 
                if ((loan.Status ?? "").ToLower() != "pending")
                    return BadRequest(new { success = false, message = "Only pending loans can be rejected." });
 
                loan.Status = "Rejected";
                loan.CurrentStage = "Rejected";
                loan.Remarks = dto?.Remarks ?? "Rejected by officer";
                loan.RejectionReason = dto?.Remarks ?? "Rejected by officer";
                loan.UpdatedAt = DateTime.UtcNow;
                loan.PendingSince = DateTime.UtcNow;
 
                await _context.SaveChangesAsync();
 
                await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
                {
                    loanId = loan.Id,
                    status = loan.Status,
                    currentStage = loan.CurrentStage
                });
 
                return Ok(new
                {
                    success = true,
                    message = "Loan rejected successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "An unexpected error occurred.",
                    detail = ex.InnerException?.Message ?? ex.Message
                });
            }
        }
    }
}







