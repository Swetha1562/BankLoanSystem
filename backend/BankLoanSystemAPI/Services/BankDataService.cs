namespace BankLoanSystem.Services;

public class BankDataResult
{
    public int CreditScore { get; set; }
    public decimal ExistingLiabilities { get; set; }
}

public class BankDataService
{
    public BankDataResult GetCustomerFinancialData(int userId)
    {
        // Mocked bank-side data for now
        // Later this can come from:
        // - internal bank database
        // - credit bureau API
        // - transaction history

        return new BankDataResult
        {
            CreditScore = 720,
            ExistingLiabilities = 20000
        };
    }
}