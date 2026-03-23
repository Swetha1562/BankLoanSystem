using BankLoanSystem.DTOs;

namespace BankLoanSystem.Services
{
    public class EligibilityResult
    {
        public bool IsEligible { get; set; }

        public int Score { get; set; }

        public string RiskLevel { get; set; } = "";

        public string RecommendedDecision { get; set; } = "";

        public List<string> Reasons { get; set; } = new();
    }

    public class EligibilityService
    {
        public EligibilityResult Evaluate(
            ApplyLoanDto dto,
            int creditScore,
            decimal existingLiabilities)
        {
            var result = new EligibilityResult();

            int score = 0;

            // AGE CHECK
            if (dto.Age >= 21 && dto.Age <= 60)
                score += 10;
            else
                result.Reasons.Add("Age not in eligible range (21-60).");

            // INCOME CHECK
            if (dto.AnnualIncome >= 300000)
                score += 20;
            else
                result.Reasons.Add("Annual income too low.");

            // LOAN AMOUNT VS INCOME
            if (dto.Amount <= dto.AnnualIncome * 5)
                score += 20;
            else
                result.Reasons.Add("Loan amount exceeds allowed multiple of income.");

            // LOAN DURATION
            if (dto.DurationMonths <= 60)
                score += 10;
            else
                result.Reasons.Add("Loan duration too long.");

            // CREDIT SCORE CHECK
            if (creditScore >= 750)
                score += 25;
            else if (creditScore >= 650)
                score += 15;
            else if (creditScore >= 550)
                score += 5;
            else
                result.Reasons.Add("Credit score too low.");

            // EXISTING LIABILITIES CHECK
            if (existingLiabilities <= dto.AnnualIncome * 0.4m)
                score += 10;
            else
                result.Reasons.Add("Existing liabilities too high.");

            // EMPLOYMENT STABILITY
            if (dto.EmploymentYears >= 2)
                score += 5;
            else
                result.Reasons.Add("Employment history too short.");

            result.Score = score;

            // DECISION LOGIC
            if (score >= 80)
            {
                result.IsEligible = true;
                result.RiskLevel = "Low";
                result.RecommendedDecision = "Approve";
            }
            else if (score >= 60)
            {
                result.IsEligible = true;
                result.RiskLevel = "Medium";
                result.RecommendedDecision = "Manual Review";
            }
            else
            {
                result.IsEligible = false;
                result.RiskLevel = "High";
                result.RecommendedDecision = "Reject";
            }

            return result;
        }
    }
}