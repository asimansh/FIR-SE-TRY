import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Database, FileDown, FileUp } from "lucide-react";
import { Transaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface BackupDialogProps {
  children: React.ReactNode;
}

export default function BackupDialog({ children }: BackupDialogProps) {
  const [open, setOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: summary } = useQuery<{
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    transactionCount: number;
  }>({
    queryKey: ['/api/summary'],
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const data = JSON.parse(text);
      await apiRequest('POST', '/api/backup/import', { transactions: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Import Successful",
        description: "Your data has been imported successfully!",
      });
      setImportFile(null);
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data. Please check your file format.",
        variant: "destructive",
      });
    },
  });

  const handleExportJSON = () => {
    if (transactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions to export.",
        variant: "destructive",
      });
      return;
    }

    const dataToExport = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      summary,
      transactions,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneymate-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your data has been exported successfully!",
    });
  };

  const handleExportCSV = () => {
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
        t.category,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        parseFloat(t.amount).toFixed(2)
      ].join(','))
      .join('\n');

    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneymate-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Export Complete",
      description: "Your transactions have been exported to CSV!",
    });
  };

  const handleImport = () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(importFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setImportFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a JSON file exported from MoneyMate.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backup & Data Management
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" data-testid="tab-export">Export Data</TabsTrigger>
            <TabsTrigger value="import" data-testid="tab-import">Import Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileDown className="w-4 h-4" />
                      <h4 className="font-medium">Complete Backup (JSON)</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Full backup including all transactions and summary data. Can be imported back into MoneyMate.
                    </p>
                    <Button
                      onClick={handleExportJSON}
                      className="w-full bg-finance-blue text-white hover:bg-blue-700"
                      disabled={transactions.length === 0}
                      data-testid="button-export-json"
                    >
                      Export JSON Backup
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileDown className="w-4 h-4" />
                      <h4 className="font-medium">Spreadsheet (CSV)</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Export transactions in CSV format for use in Excel, Google Sheets, or other applications.
                    </p>
                    <Button
                      onClick={handleExportCSV}
                      className="w-full bg-finance-green text-white hover:bg-green-700"
                      disabled={transactions.length === 0}
                      data-testid="button-export-csv"
                    >
                      Export CSV File
                    </Button>
                  </div>
                </div>

                {summary && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Current Data Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Income:</span>
                        <div className="font-medium finance-green">
                          {formatCurrency(summary.totalIncome)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Expenses:</span>
                        <div className="font-medium finance-red">
                          {formatCurrency(summary.totalExpenses)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Transactions:</span>
                        <div className="font-medium">{transactions.length}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <FileUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <div className="space-y-2">
                    <Label htmlFor="import-file" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        Select a JSON backup file to restore your data
                      </span>
                    </Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      className="mt-2"
                      data-testid="input-import-file"
                    />
                  </div>
                </div>

                {importFile && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Selected file:</strong> {importFile.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      Size: {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-1">⚠️ Important Notice</h4>
                  <p className="text-sm text-yellow-700">
                    Importing data will add new transactions to your existing data. 
                    Make sure to export your current data first if you want to keep a backup.
                  </p>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!importFile || importMutation.isPending}
                  className="w-full bg-finance-green text-white hover:bg-green-700"
                  data-testid="button-import"
                >
                  {importMutation.isPending ? "Importing..." : "Import Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}