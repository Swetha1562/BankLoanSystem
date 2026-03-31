using System.Security.Claims;
using BankLoanSystem.Data;
using BankLoanSystem.DTOs;
using BankLoanSystem.Hubs;
using BankLoanSystem.Models;
using BankLoanSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
 
namespace BankLoanSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EligibilityService _eligibilityService;
        private readonly BankDataService _bankDataService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IWebHostEnvironment _environment;
 
        public LoanController(
            ApplicationDbContext context,
            EligibilityService eligibilityService,
            BankDataService bankDataService,
            IHubContext<NotificationHub> hubContext,
            IWebHostEnvironment environment)
        {
            _context = context;
            _eligibilityService = eligibilityService;
            _bankDataService = bankDataService;
            _hubContext = hubContext;
            _environment = environment;
        }
 
        [Authorize(Roles = "Customer")]
        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromForm] ApplyLoanDto dto)
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
 
            string? salarySlipPath = null;
            if (dto.SalarySlipDocument != null)
            {
                salarySlipPath = await SaveSalarySlipAsync(dto.SalarySlipDocument);
            }
 
            var bankData = _bankDataService.GetCustomerFinancialData(userId);
 
            var evaluation = _eligibilityService.Evaluate(
                dto,
                bankData.CreditScore,
                bankData.ExistingLiabilities
            );
 
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
                Remarks = "Under review",
                RejectionReason = null,
                RiskLevel = evaluation.RiskLevel,
                EligibilityScore = evaluation.Score,
                RecommendedDecision = evaluation.RecommendedDecision,
                SalarySlipPath = salarySlipPath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
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
                CreatedAt = DateTime.UtcNow
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
                currentStage = loan.CurrentStage,
                remarks = loan.Remarks
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
                salarySlipPath = loan.SalarySlipPath,
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
                    id = l.Id,
                    userId = l.UserId,
                    loanType = l.LoanType,
                    amount = l.Amount,
                    purpose = l.Purpose,
                    durationMonths = l.DurationMonths,
                    annualIncome = l.AnnualIncome,
                    employmentYears = l.EmploymentYears,
                    age = l.Age,
                    creditScore = l.CreditScore,
                    existingLiabilities = l.ExistingLiabilities,
                    status = l.Status,
                    currentStage = l.CurrentStage,
                    rejectionReason = l.RejectionReason,
                    remarks = string.IsNullOrWhiteSpace(l.Remarks)
                        ? (l.Status == "Pending" ? "Under review" : "No remarks")
                        : l.Remarks,
                    riskLevel = l.RiskLevel,
                    eligibilityScore = l.EligibilityScore,
                    recommendedDecision = l.RecommendedDecision,
                    createdAt = ConvertToIstString(l.CreatedAt),
                    updatedAt = l.UpdatedAt.HasValue ? ConvertToIstString(l.UpdatedAt.Value) : null,
                    pendingTime = l.Status == "Pending"
                        ? FormatPendingTime(DateTime.UtcNow - l.PendingSince)
                        : null,
                    salarySlipPath = l.SalarySlipPath,
                    salarySlipFilePath = l.SalarySlipPath,
                    rowVersion = l.RowVersion != null ? Convert.ToBase64String(l.RowVersion) : null
                })
                .ToListAsync();
 
            return Ok(loans);
        }
 
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
 
            if (string.IsNullOrWhiteSpace(userIdClaim) || string.IsNullOrWhiteSpace(roleClaim))
                return Unauthorized("Invalid token.");
 
            var userId = int.Parse(userIdClaim);
 
            var loan = await _context.LoanApplications.FirstOrDefaultAsync(l => l.Id == id);
            if (loan == null)
                return NotFound("Loan not found.");
 
            if (roleClaim == "Customer" && loan.UserId != userId)
                return Forbid();
 
            return Ok(new
            {
                id = loan.Id,
                userId = loan.UserId,
                loanType = loan.LoanType,
                amount = loan.Amount,
                purpose = loan.Purpose,
                durationMonths = loan.DurationMonths,
                annualIncome = loan.AnnualIncome,
                employmentYears = loan.EmploymentYears,
                age = loan.Age,
                creditScore = loan.CreditScore,
                existingLiabilities = loan.ExistingLiabilities,
                status = loan.Status,
                currentStage = loan.CurrentStage,
                rejectionReason = loan.RejectionReason,
                remarks = string.IsNullOrWhiteSpace(loan.Remarks)
                    ? (loan.Status == "Pending" ? "Under review" : "No remarks")
                    : loan.Remarks,
                riskLevel = loan.RiskLevel,
                eligibilityScore = loan.EligibilityScore,
                recommendedDecision = loan.RecommendedDecision,
                createdAt = ConvertToIstString(loan.CreatedAt),
                updatedAt = loan.UpdatedAt.HasValue ? ConvertToIstString(loan.UpdatedAt.Value) : null,
                pendingTime = loan.Status == "Pending"
                    ? FormatPendingTime(DateTime.UtcNow - loan.PendingSince)
                    : null,
                salarySlipPath = loan.SalarySlipPath,
                salarySlipFilePath = loan.SalarySlipPath,
                rowVersion = loan.RowVersion != null ? Convert.ToBase64String(loan.RowVersion) : null
            });
        }
  
        [Authorize(Roles = "Officer")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var loans = await _context.LoanApplications
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    id = l.Id,
                    userId = l.UserId,
                    loanType = l.LoanType,
                    amount = l.Amount,
                    purpose = l.Purpose,
                    durationMonths = l.DurationMonths,
                    annualIncome = l.AnnualIncome,
                    employmentYears = l.EmploymentYears,
                    age = l.Age,
                    creditScore = l.CreditScore,
                    existingLiabilities = l.ExistingLiabilities,
                    status = l.Status,
                    currentStage = l.CurrentStage,
                    rejectionReason = l.RejectionReason,
                    remarks = string.IsNullOrWhiteSpace(l.Remarks)
                        ? (l.Status == "Pending" ? "No remarks" : "No remarks")
                        : l.Remarks,
                    riskLevel = l.RiskLevel,
                    eligibilityScore = l.EligibilityScore,
                    recommendedDecision = l.RecommendedDecision,
                    createdAt = ConvertToIstString(l.CreatedAt),
                    updatedAt = l.UpdatedAt.HasValue ? ConvertToIstString(l.UpdatedAt.Value) : null,
                    pendingTime = l.Status == "Pending"
                        ? FormatPendingTime(DateTime.UtcNow - l.PendingSince)
                        : null,
                    salarySlipPath = l.SalarySlipPath,
                    salarySlipFilePath = l.SalarySlipPath,
                    rowVersion = l.RowVersion != null ? Convert.ToBase64String(l.RowVersion) : null
                })
                .ToListAsync();
 
            return Ok(loans);
        }
 
        [Authorize(Roles = "Officer")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveLoan(int id, [FromBody] ApproveLoanDto dto)
        {
            if (dto == null)
                return BadRequest("Approval details are required.");
 
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
                loan.Remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? "Approved" : dto.Remarks.Trim();
                loan.RejectionReason = null;
                loan.UpdatedAt = DateTime.UtcNow;
 
                _context.LoanStatusHistories.Add(new LoanStatusHistory
                {
                    LoanApplicationId = loan.Id,
                    OldStatus = oldStatus,
                    NewStatus = "Approved",
                    ChangedByUserId = officerId,
                    Remarks = loan.Remarks
                });
 
                _context.Notifications.Add(new Notification
                {
                    UserId = loan.UserId,
                    Message = $"Your loan application #{loan.Id} has been approved.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
 
                _context.AuditLogs.Add(new AuditLog
                {
                    Action = "Loan Approved",
                    PerformedByUserId = officerId,
                    LoanApplicationId = loan.Id,
                    Details = loan.Remarks
                });
 
                await _context.SaveChangesAsync();
 
                await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
                {
                    loanId = loan.Id,
                    status = loan.Status,
                    currentStage = loan.CurrentStage,
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
                return StatusCode(500, $"Approval failed: {ex.Message}");
            }
        }
 
    
     
 
 
        [Authorize(Roles = "Officer")]
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectLoan(int id, [FromBody] RejectLoanDto dto)
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
                loan.RejectionReason = dto.Remarks.Trim();
                loan.Remarks = dto.Remarks.Trim();
                loan.UpdatedAt = DateTime.UtcNow;
 
                _context.LoanStatusHistories.Add(new LoanStatusHistory
                {
                    LoanApplicationId = loan.Id,
                    OldStatus = oldStatus,
                    NewStatus = "Rejected",
                    ChangedByUserId = officerId,
                    Remarks = dto.Remarks.Trim()
                });
 
                _context.Notifications.Add(new Notification
                {
                    UserId = loan.UserId,
                    Message = $"Your loan application #{loan.Id} has been rejected. Reason: {dto.Remarks.Trim()}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
 
                _context.AuditLogs.Add(new AuditLog
                {
                    Action = "Loan Rejected",
                    PerformedByUserId = officerId,
                    LoanApplicationId = loan.Id,
                    Details = dto.Remarks.Trim()
                });
 
                await _context.SaveChangesAsync();
 
                await _hubContext.Clients.All.SendAsync("LoanStatusUpdated", new
                {
                    loanId = loan.Id,
                    status = loan.Status,
                    currentStage = loan.CurrentStage,
                    rejectionReason = loan.RejectionReason,
                    remarks = loan.Remarks
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
                return StatusCode(500, $"Rejection failed: {ex.Message}");
            }
        }
 
        private async Task<string?> SaveSalarySlipAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return null;
 
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != ".pdf")
                throw new Exception("Only PDF salary slip files are allowed.");
 
            var folderPath = Path.Combine(_environment.WebRootPath, "uploads", "salary-slips");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);
 
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(folderPath, fileName);
 
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
 
            return Path.Combine("uploads", "salary-slips", fileName).Replace("\\", "/");
        }
 
        private static string FormatPendingTime(TimeSpan duration)
        {
            if (duration.TotalMinutes < 1)
                return "Just now";
 
            if (duration.TotalHours < 1)
                return $"{(int)duration.TotalMinutes} min ago";
 
            if (duration.TotalDays < 1)
                return $"{(int)duration.TotalHours} hr {(int)(duration.TotalMinutes % 60)} min ago";
 
            return $"{(int)duration.TotalDays} day {(int)(duration.TotalHours % 24)} hr ago";
        }
 
        private static string ConvertToIstString(DateTime utcDate)
        {
            try
            {
                var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                var istTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcDate, DateTimeKind.Utc), istZone);
                return istTime.ToString("yyyy-MM-dd HH:mm:ss");
            }
            catch
            {
                return utcDate.ToString("yyyy-MM-dd HH:mm:ss");
            }
        }
    }
}