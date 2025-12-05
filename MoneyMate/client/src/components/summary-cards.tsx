import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
}

export default function SummaryCards({ totalIncome, totalExpenses, currentBalance }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white border border-gray-200" data-testid="card-total-income">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-bold finance-green" data-testid="text-total-income">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 finance-green" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200" data-testid="card-total-expenses">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold finance-red" data-testid="text-total-expenses">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 finance-red" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200" data-testid="card-current-balance">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold finance-blue" data-testid="text-current-balance">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 finance-blue" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
