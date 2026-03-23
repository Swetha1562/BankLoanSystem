namespace BankLoanSystem.Models;

public class AuditLog
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public int PerformedByUserId { get; set; }
    public int? LoanApplicationId { get; set; }
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}