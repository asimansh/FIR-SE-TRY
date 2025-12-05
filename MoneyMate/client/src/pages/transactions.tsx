import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import TransactionFilters from "@/components/transaction-filters";
import TransactionTable from "@/components/transaction-table";
import { Transaction } from "@shared/schema";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

interface CategorySummary {
  [key: string]: {
    amount: number;
    count: number;
    type: string;
  };
}

export default function Transactions() {
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Build query params from applied filters
  const queryParams = new URLSearchParams();
  if (appliedFilters.type) queryParams.append('type', appliedFilters.type);
  if (appliedFilters.category) queryParams.append('category', appliedFilters.category);
  if (appliedFilters.startDate) queryParams.append('startDate', appliedFilters.startDate);
  if (appliedFilters.endDate) queryParams.append('endDate', appliedFilters.endDate);

  const queryString = queryParams.toString();
  const url = `/api/transactions${queryString ? `?${queryString}` : ''}`;

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', appliedFilters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
  });

  const { data: categorySummary = {} } = useQuery<CategorySummary>({
    queryKey: ['/api/summary/categories'],
  });

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      type: '',
      category: '',
      startDate: '',
      endDate: '',
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  // Filter category summary to show only expense categories
  const expenseCategories = Object.entries(categorySummary)
    .filter(([_, data]) => data.type === 'expense')
    .slice(0, 6); // Show top 6 categories

  return (
    <div className="space-y-8" data-testid="transactions-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold finance-dark">All Transactions</h2>
        <p className="text-gray-600 mt-2">View and manage your transaction history</p>
      </div>

      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <TransactionTable transactions={transactions} isLoading={isLoading} />

      {/* Category Summary */}
      {expenseCategories.length > 0 && (
        <Card className="bg-white border border-gray-200" data-testid="card-category-summary">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold finance-dark mb-4">Category Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map(([category, data]) => (
                <div key={category} className="p-4 bg-red-50 rounded-lg" data-testid={`category-summary-${category}`}>
                  <h4 className="font-medium finance-dark">{getCategoryLabel(category)}</h4>
                  <p className="text-2xl font-bold finance-red" data-testid={`category-amount-${category}`}>
                    {formatCurrency(data.amount)}
                  </p>
                  <p className="text-sm text-gray-600" data-testid={`category-count-${category}`}>
                    {data.count} transaction{data.count !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
