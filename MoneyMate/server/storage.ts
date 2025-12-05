import { type Transaction, type InsertTransaction, type User, type InsertUser, type LoginUser } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;
  getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]>;
  getTransactionsByCategory(category: string): Promise<Transaction[]>;
  
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  
  // Backup operations
  importTransactions(transactions: Transaction[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private users: Map<string, User>;

  constructor() {
    this.transactions = new Map();
    this.users = new Map();
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      note: insertTransaction.note || null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = {
      ...existing,
      ...updates,
      amount: updates.amount ? updates.amount.toString() : existing.amount,
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const all = await this.getTransactions();
    return all.filter(t => t.date >= startDate && t.date <= endDate);
  }

  async getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    const all = await this.getTransactions();
    return all.filter(t => t.type === type);
  }

  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    const all = await this.getTransactions();
    return all.filter(t => t.category === category);
  }

  // User management methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Backup operations
  async importTransactions(transactions: Transaction[]): Promise<void> {
    transactions.forEach(transaction => {
      // Generate new IDs to avoid conflicts
      const newTransaction = {
        ...transaction,
        id: randomUUID(),
        createdAt: new Date(),
      };
      this.transactions.set(newTransaction.id, newTransaction);
    });
  }
}

export const storage = new MemStorage();
