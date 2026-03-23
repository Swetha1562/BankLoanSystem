namespace BankLoanSystem.DTOs;

public class RejectLoanDto
{
    public string Remarks { get; set; } = string.Empty;
    public string? RowVersion { get; set; }
}