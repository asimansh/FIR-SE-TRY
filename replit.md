# MoneyMate Application

## Overview

This is a full-stack personal finance tracking application built with React, Express.js, and TypeScript. The application allows users to manage their financial transactions by creating, viewing, and analyzing income and expenses. It features a modern UI with charts and analytics, transaction filtering, and a comprehensive dashboard for financial overview.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript and follows a component-based architecture:

- **UI Framework**: React with Vite as the build tool and development server
- **Styling**: Tailwind CSS with Shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Charts**: Chart.js for financial data visualization

The frontend is organized into:
- `/components` - Reusable UI components including charts, forms, and tables
- `/pages` - Route-specific page components (Dashboard, Add Transaction, Transactions)
- `/lib` - Utility functions and shared logic
- `/hooks` - Custom React hooks

### Backend Architecture
The server-side uses Express.js with TypeScript:

- **Framework**: Express.js with middleware for JSON parsing and logging
- **Storage Interface**: Abstract storage interface (`IStorage`) with in-memory implementation
- **API Design**: RESTful endpoints for transaction CRUD operations with filtering capabilities
- **Validation**: Zod schemas shared between client and server for consistent data validation
- **Development**: Hot reload with Vite middleware integration

Key API endpoints:
- `GET /api/transactions` - Fetch transactions with optional filters
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update existing transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Data Storage Design
The application uses a flexible storage abstraction:

- **Current Implementation**: In-memory storage using Map for development and testing
- **Database Ready**: Drizzle ORM configuration with PostgreSQL schema prepared for production
- **Schema Design**: Transactions table with fields for type, category, amount, date, and notes
- **Categories**: Predefined income and expense categories with extensible structure

### Form and Validation Architecture
Robust form handling with type safety:

- **Schema Validation**: Zod schemas define transaction structure and validation rules
- **Shared Types**: TypeScript types generated from Zod schemas ensure consistency
- **Client Validation**: Real-time form validation with React Hook Form integration
- **Server Validation**: API endpoints validate requests using the same schemas

## External Dependencies

### Core Framework Dependencies
- **@vitejs/plugin-react**: React plugin for Vite development server
- **express**: Node.js web application framework for the backend API
- **wouter**: Lightweight routing library for React applications

### Database and ORM
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-kit**: Database migration and schema management tools
- **@neondatabase/serverless**: Serverless PostgreSQL database driver

### UI and Styling
- **tailwindcss**: Utility-first CSS framework for styling
- **@radix-ui/react-***: Headless UI components for accessibility
- **lucide-react**: Icon library for consistent iconography
- **chart.js**: Canvas-based charting library for financial visualizations

### Form Management and Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolver for React Hook Form
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching solution

### Development and Build Tools
- **typescript**: Static type checking for JavaScript
- **vite**: Fast build tool and development server
- **esbuild**: Fast JavaScript bundler for production builds