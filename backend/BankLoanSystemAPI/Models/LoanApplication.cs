using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
 
namespace BankLoanSystem.Models
{
    public class LoanApplication
    {
        [Key]
        public int Id { get; set; }
 
        [Required]
        public int UserId { get; set; }
 
        [Required]
        [StringLength(100)]
        public string LoanType { get; set; } = string.Empty;
 
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
 
        [Required]
        [StringLength(500)]
        public string Purpose { get; set; } = string.Empty;
 
        [Required]
        public int DurationMonths { get; set; }
 
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal AnnualIncome { get; set; }
 
        [Required]
        public int EmploymentYears { get; set; }
 
        [Required]
        public int Age { get; set; }
 
        public int CreditScore { get; set; }
 
        [Column(TypeName = "decimal(18,2)")]
        public decimal ExistingLiabilities { get; set; }
 
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Pending";
 
        [StringLength(100)]
        public string? CurrentStage { get; set; }
 
        [StringLength(500)]
        public string? RejectionReason { get; set; }
 
        [StringLength(500)]
        public string? Remarks { get; set; }
 
        [StringLength(50)]
        public string? RiskLevel { get; set; }
 
        public int EligibilityScore { get; set; }
 
        [StringLength(100)]
        public string? RecommendedDecision { get; set; }
 
        [StringLength(500)]
        public string? SalarySlipFilePath { get; set; }
 
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
 
        public DateTime? UpdatedAt { get; set; }
 
        public DateTime? PendingSince { get; set; }
 
        [Timestamp]
        public byte[]? RowVersion { get; set; }
 
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
 



/*using System.ComponentModel.DataAnnotations;
 
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

    //public string? SalarySlipFileName { get; set; }
    public string? SalarySlipFilePath { get; set; }
 
    public User? User { get; set; }
}*/