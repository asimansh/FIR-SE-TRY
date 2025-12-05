import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Filter,
  Download,
  BarChart3,
  PieChart
} from "lucide-react";
import { Transaction, ALL_CATEGORIES } from "@shared/schema";
import { formatCurrency, formatDate, getCategoryLabel } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  transactionCount: number;
}

export default function Reports() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    type: "",
    category: "",
  });

  const queryParams = new URLSearchParams();
  if (appliedFilters.startDate) queryParams.append('startDate', appliedFilters.startDate);
  if (appliedFilters.endDate) queryParams.append('endDate', appliedFilters.endDate);
  if (appliedFilters.type) queryParams.append('type', appliedFilters.type);
  if (appliedFilters.category) queryParams.append('category', appliedFilters.category);

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

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    
    const query = searchQuery.toLowerCase();
    return transactions.filter(t => 
      (t.note?.toLowerCase().includes(query)) ||
      getCategoryLabel(t.category).toLowerCase().includes(query) ||
      t.type.toLowerCase().includes(query) ||
      t.amount.includes(query)
    );
  }, [transactions, searchQuery]);

  const reportSummary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const categorySummary: Record<string, { amount: number; count: number; type: string }> = {};
    filteredTransactions.forEach(t => {
      if (!categorySummary[t.category]) {
        categorySummary[t.category] = { amount: 0, count: 0, type: t.type };
      }
      categorySummary[t.category].amount += parseFloat(t.amount);
      categorySummary[t.category].count++;
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      transactionCount: filteredTransactions.length,
      categorySummary,
    };
  }, [filteredTransactions]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
      type: typeFilter,
      category: categoryFilter,
    });
  };

  const handleClearFilters = () => {
    const defaults = {
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      type: "",
      category: "",
    };
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
    setTypeFilter("");
    setCategoryFilter("");
    setSearchQuery("");
    setAppliedFilters(defaults);
  };

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setYearRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let currentY = margin;

    const addHeader = () => {
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("$", margin + 2, 18);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("MoneyMate", margin + 12, 18);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Financial Report", margin + 12, 26);
      
      doc.setFontSize(9);
      doc.text(`${formatDate(appliedFilters.startDate)} - ${formatDate(appliedFilters.endDate)}`, pageWidth - margin, 18, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 26, { align: 'right' });
      
      return 45;
    };

    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFillColor(245, 245, 245);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("MoneyMate - Your Personal Finance Companion", margin, pageHeight - 10);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    };

    currentY = addHeader();

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 50, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Summary", margin + 8, currentY + 12);
    
    const summaryBoxWidth = (pageWidth - (margin * 2) - 32) / 4;
    const summaryY = currentY + 22;
    
    const summaryItems = [
      { label: "Total Income", value: formatCurrency(reportSummary.totalIncome), color: [34, 197, 94] as [number, number, number] },
      { label: "Total Expenses", value: formatCurrency(reportSummary.totalExpenses), color: [239, 68, 68] as [number, number, number] },
      { label: "Net Balance", value: formatCurrency(reportSummary.netBalance), color: reportSummary.netBalance >= 0 ? [34, 197, 94] as [number, number, number] : [239, 68, 68] as [number, number, number] },
      { label: "Transactions", value: reportSummary.transactionCount.toString(), color: [59, 130, 246] as [number, number, number] },
    ];

    summaryItems.forEach((item, index) => {
      const boxX = margin + 8 + (index * (summaryBoxWidth + 8));
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(boxX, summaryY, summaryBoxWidth, 22, 2, 2, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(boxX, summaryY, summaryBoxWidth, 22, 2, 2, 'S');
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, boxX + 4, summaryY + 8);
      
      doc.setFontSize(11);
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(item.value, boxX + 4, summaryY + 17);
    });

    currentY += 60;

    if (filteredTransactions.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Transaction Details", margin, currentY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`${filteredTransactions.length} transactions`, pageWidth - margin, currentY, { align: 'right' });
      currentY += 8;

      const tableData = filteredTransactions.map(t => [
        formatDate(t.date),
        t.type === 'income' ? 'Income' : 'Expense',
        getCategoryLabel(t.category),
        (t.note || '-').substring(0, 40) + ((t.note?.length || 0) > 40 ? '...' : ''),
        `${t.type === 'income' ? '+' : '-'}${formatCurrency(parseFloat(t.amount))}`
      ]);

      const maxDescLength = Math.max(...filteredTransactions.map(t => (t.note || '-').length), 11);
      const descWidth = Math.min(Math.max(maxDescLength * 1.5, 40), 70);

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [51, 51, 51],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 24, halign: 'left' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 'auto', halign: 'left' },
          3: { cellWidth: descWidth, halign: 'left' },
          4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        },
        styles: {
          lineColor: [229, 231, 235],
          lineWidth: 0.1,
          overflow: 'ellipsize',
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const cellText = data.cell.text[0] || '';
            if (cellText.startsWith('+')) {
              data.cell.styles.textColor = [34, 197, 94];
            } else if (cellText.startsWith('-')) {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
          if (data.section === 'body' && data.column.index === 1) {
            const cellText = data.cell.text[0] || '';
            if (cellText === 'Income') {
              data.cell.styles.textColor = [34, 197, 94];
            } else {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (Object.keys(reportSummary.categorySummary).length > 0 && currentY < pageHeight - 80) {
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Category Breakdown", margin, currentY);
      currentY += 8;

      const categoryData = Object.entries(reportSummary.categorySummary)
        .sort((a, b) => b[1].amount - a[1].amount)
        .map(([category, data]) => [
          getCategoryLabel(category),
          data.type === 'income' ? 'Income' : 'Expense',
          data.count.toString(),
          formatCurrency(data.amount),
        ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Category', 'Type', 'Count', 'Total Amount']],
        body: categoryData,
        theme: 'grid',
        headStyles: { 
          fillColor: [100, 116, 139],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            const cellText = data.cell.text[0] || '';
            if (cellText === 'Income') {
              data.cell.styles.textColor = [34, 197, 94];
            } else {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
          if (data.section === 'body' && data.column.index === 3) {
            data.cell.styles.textColor = [59, 130, 246];
          }
        },
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    doc.save(`MoneyMate-Report-${appliedFilters.startDate}-to-${appliedFilters.endDate}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const summarySheetData = [
      [''],
      ['', 'MONEYMATE FINANCIAL REPORT'],
      [''],
      ['', 'Report Information'],
      ['', 'Report Period:', `${formatDate(appliedFilters.startDate)} - ${formatDate(appliedFilters.endDate)}`],
      ['', 'Generated On:', new Date().toLocaleString()],
      ['', 'Total Transactions:', reportSummary.transactionCount],
      [''],
      ['', 'FINANCIAL SUMMARY'],
      [''],
      ['', 'Metric', 'Amount', 'Status'],
      ['', 'Total Income', reportSummary.totalIncome, 'Positive'],
      ['', 'Total Expenses', reportSummary.totalExpenses, 'Negative'],
      ['', 'Net Balance', reportSummary.netBalance, reportSummary.netBalance >= 0 ? 'Positive' : 'Negative'],
      [''],
      ['', 'QUICK STATS'],
      ['', 'Average Transaction:', filteredTransactions.length > 0 ? 
        (filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / filteredTransactions.length).toFixed(2) : '0.00'],
      ['', 'Largest Income:', filteredTransactions.filter(t => t.type === 'income').length > 0 ?
        Math.max(...filteredTransactions.filter(t => t.type === 'income').map(t => parseFloat(t.amount))).toFixed(2) : '0.00'],
      ['', 'Largest Expense:', filteredTransactions.filter(t => t.type === 'expense').length > 0 ?
        Math.max(...filteredTransactions.filter(t => t.type === 'expense').map(t => parseFloat(t.amount))).toFixed(2) : '0.00'],
      [''],
      ['', 'Report generated by MoneyMate - Your Personal Finance Companion'],
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
    summaryWs['!cols'] = [
      { wch: 3 },
      { wch: 25 },
      { wch: 35 },
      { wch: 15 },
    ];
    summaryWs['!rows'] = [
      { hpt: 10 },
      { hpt: 30 },
      { hpt: 10 },
      { hpt: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const maxDescLength = Math.max(
      ...filteredTransactions.map(t => (t.note || '').length),
      15
    );
    const dynamicDescWidth = Math.min(Math.max(maxDescLength, 20), 60);

    const transactionHeader = [
      ['TRANSACTION DETAILS'],
      [''],
      ['#', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Running Balance'],
    ];

    let runningBalance = 0;
    const transactionRows = filteredTransactions.map((t, index) => {
      const amount = parseFloat(t.amount);
      runningBalance += t.type === 'income' ? amount : -amount;
      return [
        index + 1,
        t.date,
        t.type === 'income' ? 'INCOME' : 'EXPENSE',
        getCategoryLabel(t.category),
        t.note || '-',
        t.type === 'income' ? amount : -amount,
        runningBalance,
      ];
    });

    const transactionTotal = [
      [''],
      ['', '', '', '', 'TOTALS:', '', ''],
      ['', '', 'Income:', '', '', reportSummary.totalIncome, ''],
      ['', '', 'Expenses:', '', '', -reportSummary.totalExpenses, ''],
      ['', '', 'Net:', '', '', reportSummary.netBalance, ''],
    ];

    const transactionsWs = XLSX.utils.aoa_to_sheet([
      ...transactionHeader,
      ...transactionRows,
      ...transactionTotal,
    ]);

    transactionsWs['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: dynamicDescWidth },
      { wch: 15 },
      { wch: 15 },
    ];

    const numRows = transactionRows.length + transactionHeader.length;
    for (let i = 3; i < numRows; i++) {
      const amountCell = XLSX.utils.encode_cell({ r: i, c: 5 });
      const balanceCell = XLSX.utils.encode_cell({ r: i, c: 6 });
      if (transactionsWs[amountCell]) {
        transactionsWs[amountCell].z = '$#,##0.00';
      }
      if (transactionsWs[balanceCell]) {
        transactionsWs[balanceCell].z = '$#,##0.00';
      }
    }

    XLSX.utils.book_append_sheet(wb, transactionsWs, 'Transactions');

    if (Object.keys(reportSummary.categorySummary).length > 0) {
      const categoryHeader = [
        ['CATEGORY BREAKDOWN'],
        [''],
        ['Category', 'Type', 'Transaction Count', 'Total Amount', 'Percentage of Total'],
      ];

      const totalAmount = Object.values(reportSummary.categorySummary)
        .reduce((sum, data) => sum + data.amount, 0);

      const categoryRows = Object.entries(reportSummary.categorySummary)
        .sort((a, b) => b[1].amount - a[1].amount)
        .map(([category, data]) => [
          getCategoryLabel(category),
          data.type === 'income' ? 'INCOME' : 'EXPENSE',
          data.count,
          data.amount,
          totalAmount > 0 ? `${((data.amount / totalAmount) * 100).toFixed(1)}%` : '0%',
        ]);

      const incomeCategories = Object.entries(reportSummary.categorySummary)
        .filter(([_, data]) => data.type === 'income');
      const expenseCategories = Object.entries(reportSummary.categorySummary)
        .filter(([_, data]) => data.type === 'expense');

      const categorySummaryRows = [
        [''],
        ['SUMMARY BY TYPE'],
        [''],
        ['Type', 'Categories', 'Total Amount'],
        ['Income', incomeCategories.length, incomeCategories.reduce((sum, [_, d]) => sum + d.amount, 0)],
        ['Expenses', expenseCategories.length, expenseCategories.reduce((sum, [_, d]) => sum + d.amount, 0)],
      ];

      const categoriesWs = XLSX.utils.aoa_to_sheet([
        ...categoryHeader,
        ...categoryRows,
        ...categorySummaryRows,
      ]);

      const maxCategoryLength = Math.max(
        ...Object.keys(reportSummary.categorySummary).map(c => getCategoryLabel(c).length),
        10
      );

      categoriesWs['!cols'] = [
        { wch: Math.min(maxCategoryLength + 5, 30) },
        { wch: 12 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 },
      ];

      XLSX.utils.book_append_sheet(wb, categoriesWs, 'Categories');
    }

    const months: Record<string, { income: number; expenses: number }> = {};
    filteredTransactions.forEach(t => {
      const monthKey = t.date.substring(0, 7);
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0 };
      }
      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        months[monthKey].income += amount;
      } else {
        months[monthKey].expenses += amount;
      }
    });

    if (Object.keys(months).length > 0) {
      const trendHeader = [
        ['MONTHLY TRENDS'],
        [''],
        ['Month', 'Income', 'Expenses', 'Net', 'Savings Rate'],
      ];

      const trendRows = Object.entries(months)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, data]) => {
          const net = data.income - data.expenses;
          const savingsRate = data.income > 0 ? ((net / data.income) * 100).toFixed(1) + '%' : 'N/A';
          return [
            month,
            data.income,
            data.expenses,
            net,
            savingsRate,
          ];
        });

      const trendsWs = XLSX.utils.aoa_to_sheet([
        ...trendHeader,
        ...trendRows,
      ]);

      trendsWs['!cols'] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(wb, trendsWs, 'Monthly Trends');
    }

    XLSX.writeFile(wb, `MoneyMate-Report-${appliedFilters.startDate}-to-${appliedFilters.endDate}.xlsx`);
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="mb-6">
        <h2 className="text-3xl font-bold finance-dark">Financial Reports</h2>
        <p className="text-gray-600 mt-2">Generate custom reports for any time period</p>
      </div>

      {/* Date Range & Filters */}
      <Card className="bg-white border border-gray-200" data-testid="card-filters">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Date Range Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickRange(7)}
              data-testid="button-last-7-days"
            >
              Last 7 Days
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickRange(30)}
              data-testid="button-last-30-days"
            >
              Last 30 Days
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickRange(90)}
              data-testid="button-last-90-days"
            >
              Last 90 Days
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={setMonthRange}
              data-testid="button-this-month"
            >
              This Month
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={setYearRange}
              data-testid="button-this-year"
            >
              This Year
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>

            {/* End Date */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>

            {/* Type Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search transactions by description, category, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleApplyFilters}
              className="bg-finance-blue text-white hover:bg-blue-700"
              data-testid="button-apply-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
            <div className="flex-1" />
            <Button
              onClick={exportToPDF}
              disabled={filteredTransactions.length === 0}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="button-export-pdf"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={exportToExcel}
              disabled={filteredTransactions.length === 0}
              className="bg-green-600 text-white hover:bg-green-700"
              data-testid="button-export-excel"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200" data-testid="card-total-income">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold finance-green" data-testid="text-income">
                  {formatCurrency(reportSummary.totalIncome)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-5 h-5 finance-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200" data-testid="card-total-expenses">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold finance-red" data-testid="text-expenses">
                  {formatCurrency(reportSummary.totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-5 h-5 finance-red" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200" data-testid="card-net-balance">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Net Balance</p>
                <p className={`text-2xl font-bold ${reportSummary.netBalance >= 0 ? 'finance-green' : 'finance-red'}`} data-testid="text-net-balance">
                  {formatCurrency(reportSummary.netBalance)}
                </p>
              </div>
              <div className={`p-3 ${reportSummary.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full`}>
                <DollarSign className={`w-5 h-5 ${reportSummary.netBalance >= 0 ? 'finance-green' : 'finance-red'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200" data-testid="card-transaction-count">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-2xl font-bold finance-blue" data-testid="text-count">
                  {reportSummary.transactionCount}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-5 h-5 finance-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions" data-testid="tab-transactions">
            <BarChart3 className="w-4 h-4 mr-2" />
            Transaction Details
          </TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <PieChart className="w-4 h-4 mr-2" />
            Category Breakdown
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold finance-dark">
                  Transaction Details
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {filteredTransactions.length} transactions found
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500" data-testid="text-no-data">
                  <p>No transactions found for the selected period.</p>
                  <p className="text-sm mt-1">Try adjusting your filters or date range.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-gray-50" data-testid={`row-${transaction.id}`}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.type === 'income' ? 'default' : 'destructive'}
                              className={transaction.type === 'income' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}
                            >
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                          <TableCell>{transaction.note || '-'}</TableCell>
                          <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'finance-green' : 'finance-red'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold finance-dark">
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(reportSummary.categorySummary).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No category data available for the selected period.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(reportSummary.categorySummary)
                    .sort((a, b) => b[1].amount - a[1].amount)
                    .map(([category, data]) => (
                      <div 
                        key={category} 
                        className={`p-4 rounded-lg ${data.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}
                        data-testid={`category-card-${category}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium finance-dark">{getCategoryLabel(category)}</h4>
                            <Badge 
                              variant="outline" 
                              className={`mt-1 ${data.type === 'income' ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}`}
                            >
                              {data.type === 'income' ? 'Income' : 'Expense'}
                            </Badge>
                          </div>
                          <div className={`p-2 rounded-full ${data.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {data.type === 'income' ? 
                              <TrendingUp className="w-4 h-4 finance-green" /> : 
                              <TrendingDown className="w-4 h-4 finance-red" />
                            }
                          </div>
                        </div>
                        <p className={`text-xl font-bold mt-2 ${data.type === 'income' ? 'finance-green' : 'finance-red'}`}>
                          {formatCurrency(data.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.count} transaction{data.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
