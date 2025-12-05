import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@shared/schema";
import { formatCurrency, formatDate, getCategoryLabel } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions to export.",
        variant: "destructive",
      });
      return;
    }

    const csvHeaders = "Date,Type,Category,Description,Amount\n";
    const csvData = transactions
      .map(t => [
        t.date,
        t.type,
        getCategoryLabel(t.category),
        t.note || '',
        parseFloat(t.amount).toFixed(2)
      ].join(','))
      .join('\n');

    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200" data-testid="card-transactions-loading">
        <CardContent className="p-6">
          <div className="text-center">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200" data-testid="card-transactions-table">
      <CardHeader className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold finance-dark">Transaction History</CardTitle>
            <p className="text-sm text-gray-500 mt-1" data-testid="text-transaction-count">
              Showing {Math.min(transactions.length, itemsPerPage)} of {transactions.length} transactions
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-green-600 text-white hover:bg-green-700 transition-colors"
            disabled={transactions.length === 0}
            data-testid="button-export-csv"
          >
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500" data-testid="text-no-transactions">
            <p>No transactions found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50" data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell data-testid={`cell-date-${transaction.id}`}>
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className={transaction.type === 'income' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}
                          data-testid={`badge-type-${transaction.id}`}
                        >
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`cell-category-${transaction.id}`}>
                        {getCategoryLabel(transaction.category)}
                      </TableCell>
                      <TableCell data-testid={`cell-note-${transaction.id}`}>
                        {transaction.note || 'No description'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'finance-green' : 'finance-red'}`} data-testid={`cell-amount-${transaction.id}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-900"
                            data-testid={`button-edit-${transaction.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(transaction.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${transaction.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-mobile"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-mobile"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700" data-testid="text-pagination-info">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, transactions.length)}</span> of{' '}
                      <span className="font-medium">{transactions.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="rounded-l-md"
                        data-testid="button-prev"
                      >
                        Previous
                      </Button>
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                          className={currentPage === i + 1 ? "bg-finance-blue border-finance-blue text-white" : ""}
                          data-testid={`button-page-${i + 1}`}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-r-md"
                        data-testid="button-next"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
