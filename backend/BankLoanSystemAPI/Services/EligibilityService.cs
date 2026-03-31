namespace BankLoanSystem.Services;
 
public class EligibilityResult
{
    public int Score { get; set; }
    public string RiskLevel { get; set; } = "Unknown";
    public string RecommendedDecision { get; set; } = "Manual Review";
}
 
public class EligibilityService
{
    public EligibilityResult Evaluate(
        decimal amount,
        decimal annualIncome,
        int durationMonths,
        int employmentYears,
        int age,
        int creditScore,
        decimal existingLiabilities)
    {
        int score = 0;
 
        // Income scoring
        if (annualIncome >= 1000000) score += 20;
        else if (annualIncome >= 600000) score += 16;
        else if (annualIncome >= 300000) score += 10;
        else if (annualIncome > 0) score += 4;
 
        // Employment stability
        if (employmentYears >= 8) score += 16;
        else if (employmentYears >= 5) score += 12;
        else if (employmentYears >= 2) score += 8;
        else if (employmentYears >= 1) score += 4;
 
        // Loan-to-income ratio
        if (annualIncome > 0)
        {
            var ratio = amount / annualIncome;
 
            if (ratio <= 0.30m) score += 14;
            else if (ratio <= 0.50m) score += 8;
            else if (ratio <= 0.75m) score += 2;
            else score -= 8;
        }
 
        // Duration
        if (durationMonths >= 12 && durationMonths <= 60) score += 6;
        else if (durationMonths > 60 && durationMonths <= 120) score += 2;
 
        // Age
        if (age >= 21 && age <= 55) score += 8;
        else if (age > 55 && age <= 65) score += 3;
        else if (age >= 18 && age < 21) score += 2;
        else score -= 5;
 
        // Credit score
        if (creditScore >= 750) score += 18;
        else if (creditScore >= 700) score += 12;
        else if (creditScore >= 650) score += 6;
        else score -= 10;
 
        // Existing liabilities
        if (existingLiabilities <= 50000) score += 10;
        else if (existingLiabilities <= 200000) score += 5;
        else score -= 8;
 
        score = Math.Max(0, Math.Min(100, score));
 
        string riskLevel;
        if (score >= 80) riskLevel = "Low Risk";
        else if (score >= 65) riskLevel = "Moderate Risk";
        else riskLevel = "High Risk";
 
        string recommendedDecision;
        if (score >= 80) recommendedDecision = "Likely Approve";
        else if (score >= 65) recommendedDecision = "Needs Manual Review";
        else recommendedDecision = "Likely Reject";
 
        return new EligibilityResult
        {
            Score = score,
            RiskLevel = riskLevel,
            RecommendedDecision = recommendedDecision
        };
    }
}
 