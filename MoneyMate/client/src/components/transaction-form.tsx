import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrendingUp, TrendingDown } from "lucide-react";
import { insertTransactionSchema, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type FormData = {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
};

export default function TransactionForm() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormData>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      type: 'income',
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest('POST', '/api/transactions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Transaction added successfully!",
      });
      form.reset();
      form.setValue('date', new Date().toISOString().split('T')[0]);
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const watchedType = form.watch('type');
  const categories = watchedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl">
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Transaction Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium finance-dark">Transaction Type</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="relative cursor-pointer">
                          <input
                            type="radio"
                            value="income"
                            checked={field.value === 'income'}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              form.setValue('category', '');
                            }}
                            className="sr-only peer"
                            data-testid="radio-income"
                          />
                          <div className="w-full p-4 text-center border-2 border-gray-200 rounded-lg peer-checked:border-[var(--finance-green)] peer-checked:bg-green-50 peer-checked:text-[var(--finance-green)] transition-all">
                            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                            <span className="font-medium">Income</span>
                          </div>
                        </label>
                        <label className="relative cursor-pointer">
                          <input
                            type="radio"
                            value="expense"
                            checked={field.value === 'expense'}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              form.setValue('category', '');
                            }}
                            className="sr-only peer"
                            data-testid="radio-expense"
                          />
                          <div className="w-full p-4 text-center border-2 border-gray-200 rounded-lg peer-checked:border-[var(--finance-red)] peer-checked:bg-red-50 peer-checked:text-[var(--finance-red)] transition-all">
                            <TrendingDown className="w-6 h-6 mx-auto mb-2" />
                            <span className="font-medium">Expense</span>
                          </div>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium finance-dark">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} data-testid="select-category">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium finance-dark">Amount *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500 text-lg font-medium">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Enter amount (e.g., 25.50)"
                            className="pl-8 text-lg h-12 border-2 focus:border-finance-blue"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                            }}
                            data-testid="input-amount"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium finance-dark">Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Note */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium finance-dark">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for this transaction (e.g., 'Grocery shopping at Walmart', 'Salary payment', 'Gas for car')"
                        rows={4}
                        className="border-2 focus:border-finance-blue text-base resize-none"
                        {...field}
                        data-testid="textarea-note"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Add details to help you remember this transaction later
                    </p>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-finance-blue text-white hover:bg-blue-700 transition-colors"
                  disabled={createMutation.isPending}
                  data-testid="button-add-transaction"
                >
                  {createMutation.isPending ? "Adding..." : "Add Transaction"}
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  className="px-6"
                  onClick={() => {
                    form.reset();
                    form.setValue('date', new Date().toISOString().split('T')[0]);
                  }}
                  data-testid="button-clear"
                >
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
