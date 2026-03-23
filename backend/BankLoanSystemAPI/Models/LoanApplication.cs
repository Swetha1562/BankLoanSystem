using System.ComponentModel.DataAnnotations;

namespace BankLoanSystem.Models;

public class LoanApplication
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string LoanType { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Purpose { get; set; } = string.Empty;

    public int DurationMonths { get; set; }

    public decimal AnnualIncome { get; set; }

    public int EmploymentYears { get; set; }

    public int Age { get; set; }

    public int CreditScore { get; set; }

    public decimal ExistingLiabilities { get; set; }

    public string Status { get; set; } = "Pending";

    public string CurrentStage { get; set; } = "Submitted";

    public string? Remarks { get; set; }

    public string? RejectionReason { get; set; }

    public string RiskLevel { get; set; } = "Unknown";

    public int EligibilityScore { get; set; }

    public string RecommendedDecision { get; set; } = "Manual Review";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime PendingSince { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[]? RowVersion { get; set; }

    public User? User { get; set; }
}