import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, ShoppingCart, Home } from "lucide-react";
import { Transaction } from "@shared/schema";
import { formatCurrency, formatDate, getCategoryLabel } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5);

  const getTransactionIcon = (type: string, category: string) => {
    if (type === 'income') {
      return <TrendingUp className="w-4 h-4 finance-green" />;
    }
    
    switch (category) {
      case 'food':
        return <ShoppingCart className="w-4 h-4 finance-red" />;
      case 'housing':
        return <Home className="w-4 h-4 finance-red" />;
      default:
        return <TrendingDown className="w-4 h-4 finance-red" />;
    }
  };

  const getIconBackground = (type: string) => {
    return type === 'income' ? 'bg-green-100' : 'bg-red-100';
  };

  const getAmountColor = (type: string) => {
    return type === 'income' ? 'finance-green' : 'finance-red';
  };

  const formatAmount = (amount: string, type: string) => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign}${formatCurrency(parseFloat(amount))}`;
  };

  if (recentTransactions.length === 0) {
    return (
      <Card className="bg-white border border-gray-200" data-testid="card-recent-transactions">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold finance-dark">Recent Transactions</CardTitle>
            <Link
              href="/transactions"
              className="finance-blue text-sm font-medium hover:text-blue-700 transition-colors"
              data-testid="link-view-all"
            >
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500" data-testid="text-no-transactions">
            <p>No transactions yet.</p>
            <Link
              href="/add"
              className="finance-blue hover:text-blue-700 transition-colors"
              data-testid="link-add-first-transaction"
            >
              Add your first transaction
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200" data-testid="card-recent-transactions">
      <CardHeader className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold finance-dark">Recent Transactions</CardTitle>
          <Link
            href="/transactions"
            className="finance-blue text-sm font-medium hover:text-blue-700 transition-colors"
            data-testid="link-view-all"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              data-testid={`transaction-${transaction.id}`}
            >
              <div className="flex items-center">
                <div className={`p-2 ${getIconBackground(transaction.type)} rounded-full mr-3`}>
                  {getTransactionIcon(transaction.type, transaction.category)}
                </div>
                <div>
                  <p className="font-medium finance-dark" data-testid={`transaction-note-${transaction.id}`}>
                    {transaction.note || 'No description'}
                  </p>
                  <p className="text-sm text-gray-500" data-testid={`transaction-category-${transaction.id}`}>
                    {getCategoryLabel(transaction.category)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getAmountColor(transaction.type)}`} data-testid={`transaction-amount-${transaction.id}`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </p>
                <p className="text-sm text-gray-500" data-testid={`transaction-date-${transaction.id}`}>
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
