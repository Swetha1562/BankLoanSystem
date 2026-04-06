using System;
 
namespace BankLoanSystem.Models
{
    public class LoanStatusHistory
    {
        public int Id { get; set; }
 
        public int LoanApplicationId { get; set; }
 
        public string? OldStatus { get; set; }
 
        public string NewStatus { get; set; } = "";
 
        public int ChangedByUserId { get; set; }
 
        public string? Remarks { get; set; }
 
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }
}




/*namespace BankLoanSystem.Models;

public class LoanStatusHistory
{
    public int Id { get; set; }

    public int LoanApplicationId { get; set; }

    public string OldStatus { get; set; } = string.Empty;

    public string NewStatus { get; set; } = string.Empty;

    public int ChangedByUserId { get; set; }

    public string Remarks { get; set; } = string.Empty;

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}*/