import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { Transaction } from "@shared/schema";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

Chart.register(...registerables);

interface ChartsProps {
  transactions: Transaction[];
}

export default function Charts({ transactions }: ChartsProps) {
  const monthlyChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const monthlyChartInstance = useRef<Chart | null>(null);
  const categoryChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!monthlyChartRef.current || !categoryChartRef.current) return;

    // Prepare monthly data
    const monthlyData = prepareMonthlyData(transactions);
    const categoryData = prepareCategoryData(transactions);

    // Destroy existing charts
    if (monthlyChartInstance.current) {
      monthlyChartInstance.current.destroy();
    }
    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }

    // Monthly trend chart
    const monthlyConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Income',
            data: monthlyData.income,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.1,
          },
          {
            label: 'Expenses',
            data: monthlyData.expenses,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return formatCurrency(Number(value));
              },
            },
          },
        },
      },
    };

    // Category pie chart
    const categoryConfig: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [
          {
            data: categoryData.amounts,
            backgroundColor: [
              '#EF4444',
              '#F59E0B',
              '#8B5CF6',
              '#06B6D4',
              '#84CC16',
              '#F97316',
              '#EC4899',
              '#6366F1',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = formatCurrency(Number(context.parsed));
                return `${label}: ${value}`;
              },
            },
          },
        },
      },
    };

    monthlyChartInstance.current = new Chart(monthlyChartRef.current, monthlyConfig);
    categoryChartInstance.current = new Chart(categoryChartRef.current, categoryConfig);

    return () => {
      if (monthlyChartInstance.current) {
        monthlyChartInstance.current.destroy();
      }
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <Card className="bg-white border border-gray-200" data-testid="card-monthly-chart">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold finance-dark">Monthly Trend</CardTitle>
            <Select defaultValue="6months">
              <SelectTrigger className="w-[140px]" data-testid="select-chart-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64">
            <canvas ref={monthlyChartRef} data-testid="canvas-monthly-chart"></canvas>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200" data-testid="card-category-chart">
        <CardHeader>
          <CardTitle className="text-lg font-semibold finance-dark">Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64">
            <canvas ref={categoryChartRef} data-testid="canvas-category-chart"></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function prepareMonthlyData(transactions: Transaction[]) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const monthlyIncome = new Array(6).fill(0);
  const monthlyExpenses = new Array(6).fill(0);

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (year === currentYear && month >= 6 && month <= 11) {
      const index = month - 6;
      const amount = parseFloat(transaction.amount);
      
      if (transaction.type === 'income') {
        monthlyIncome[index] += amount;
      } else {
        monthlyExpenses[index] += amount;
      }
    }
  });

  return {
    labels: months,
    income: monthlyIncome,
    expenses: monthlyExpenses,
  };
}

function prepareCategoryData(transactions: Transaction[]) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};

  expenseTransactions.forEach(transaction => {
    const category = getCategoryLabel(transaction.category);
    categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(transaction.amount);
  });

  return {
    labels: Object.keys(categoryTotals),
    amounts: Object.values(categoryTotals),
  };
}
