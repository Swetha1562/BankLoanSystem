using Microsoft.AspNetCore.Http;
 
namespace BankLoanSystem.DTOs;
 
public class ApplyLoanDto
{
    public string LoanType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public int DurationMonths { get; set; }
    public decimal AnnualIncome { get; set; }
    public int EmploymentYears { get; set; }
    public int Age { get; set; }
 
    public IFormFile? SalarySlipDocument { get; set; }
}