import { useQuery } from "@tanstack/react-query";
import SummaryCards from "@/components/summary-cards";
import Charts from "@/components/charts";
import RecentTransactions from "@/components/recent-transactions";
import { Transaction } from "@shared/schema";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  transactionCount: number;
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ['/api/summary'],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const isLoading = summaryLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="dashboard-loading">
        <div className="mb-8">
          <h2 className="text-3xl font-bold finance-dark">Financial Dashboard</h2>
          <p className="text-gray-600 mt-2">Overview of your financial activity</p>
        </div>
        <div className="text-center text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-bold finance-dark">Financial Dashboard</h2>
        <p className="text-gray-600 mt-2">Overview of your financial activity</p>
      </div>

      <SummaryCards
        totalIncome={summary?.totalIncome || 0}
        totalExpenses={summary?.totalExpenses || 0}
        currentBalance={summary?.currentBalance || 0}
      />

      <Charts transactions={transactions} />

      <RecentTransactions transactions={transactions} />
    </div>
  );
}
