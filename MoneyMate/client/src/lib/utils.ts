import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    'salary': 'Salary',
    'freelance': 'Freelance',
    'investment': 'Investment',
    'other-income': 'Other Income',
    'food': 'Food & Dining',
    'housing': 'Housing',
    'transportation': 'Transportation',
    'utilities': 'Utilities',
    'healthcare': 'Healthcare',
    'entertainment': 'Entertainment',
    'shopping': 'Shopping',
    'other-expense': 'Other Expense',
  };
  
  return categoryMap[category] || category;
}
