import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const { type, category, startDate, endDate } = req.query;
      
      let transactions = await storage.getTransactions();
      
      // Apply filters
      if (type && (type === 'income' || type === 'expense')) {
        transactions = transactions.filter(t => t.type === type);
      }
      
      if (category && typeof category === 'string') {
        transactions = transactions.filter(t => t.category === category);
      }
      
      if (startDate && typeof startDate === 'string') {
        transactions = transactions.filter(t => t.date >= startDate);
      }
      
      if (endDate && typeof endDate === 'string') {
        transactions = transactions.filter(t => t.date <= endDate);
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get transaction by ID
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Create new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Update transaction
  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const updates = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, updates);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Delete transaction
  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Get financial summary
  app.get("/api/summary", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const currentBalance = totalIncome - totalExpenses;
      
      res.json({
        totalIncome,
        totalExpenses,
        currentBalance,
        transactionCount: transactions.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate summary" });
    }
  });

  // Get category summary
  app.get("/api/summary/categories", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      const categoryTotals: Record<string, { amount: number; count: number; type: string }> = {};
      
      transactions.forEach(transaction => {
        const category = transaction.category;
        if (!categoryTotals[category]) {
          categoryTotals[category] = { amount: 0, count: 0, type: transaction.type };
        }
        categoryTotals[category].amount += parseFloat(transaction.amount);
        categoryTotals[category].count += 1;
      });
      
      res.json(categoryTotals);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate category summary" });
    }
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await storage.verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        message: "Login successful"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Backup routes
  app.post("/api/backup/import", async (req, res) => {
    try {
      const { transactions } = req.body;
      
      if (!Array.isArray(transactions)) {
        return res.status(400).json({ message: "Invalid data format. Expected transactions array." });
      }
      
      await storage.importTransactions(transactions);
      res.json({ message: "Data imported successfully", count: transactions.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to import data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
