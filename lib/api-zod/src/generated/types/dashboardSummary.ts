import type { DashboardSummaryAccountBreakdownItem } from "./dashboardSummaryAccountBreakdownItem";

export interface DashboardSummary {
  totalBalance: number;
  totalAccounts: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  accountBreakdown: DashboardSummaryAccountBreakdownItem[];
}
