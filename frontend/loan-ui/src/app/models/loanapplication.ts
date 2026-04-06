export interface LoanApplication {
  id: number;
  userId?: number;
 
  loanType?: string;
  amount?: number;
  purpose?: string;
  durationMonths?: number;
 
  annualIncome?: number;
  employmentYears?: number;
  age?: number;
 
  creditScore?: number;
  existingLiabilities?: number;
 
  status?: string;
  currentStage?: string;
  rejectionReason?: string;
  remarks?: string;
 
  riskLevel?: string;
  eligibilityScore?: number;
  recommendedDecision?: string;
 
  createdAt?: string;
  updatedAt?: string | null;
  pendingTime?: string | null;
 
  salarySlipFilePath?: string;
  rowVersion?: string | null;
}