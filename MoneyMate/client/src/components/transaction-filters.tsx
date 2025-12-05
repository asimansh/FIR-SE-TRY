import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CATEGORIES } from "@shared/schema";
import { getCategoryLabel } from "@/lib/utils";

interface TransactionFiltersProps {
  filters: {
    type: string;
    category: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function TransactionFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: TransactionFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="bg-white border border-gray-200 mb-6" data-testid="card-filters">
      <CardHeader>
        <CardTitle className="text-lg font-semibold finance-dark">Filters</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)} data-testid="select-filter-type">
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)} data-testid="select-filter-category">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {ALL_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              data-testid="input-filter-start-date"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              data-testid="input-filter-end-date"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={onApplyFilters}
            className="bg-finance-blue text-white hover:bg-blue-700 transition-colors"
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
          <Button
            onClick={onClearFilters}
            variant="outline"
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
