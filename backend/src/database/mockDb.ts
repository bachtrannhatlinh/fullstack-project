import { v4 as uuidv4 } from 'uuid';

// In-memory database for demo purposes
// In production, this will be replaced with actual PostgreSQL queries

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'REFUND';
  description: string;
  category?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference?: string;
  metadata?: string;
  createdAt: Date;
}

// In-memory storage
const users: User[] = [];
const accounts: Account[] = [];
const transactions: Transaction[] = [];

export const db = {
  // User operations
  users: {
    create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
      const user: User = {
        id: uuidv4(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(user);
      return user;
    },
    findByEmail: (email: string): User | undefined => {
      return users.find(user => user.email === email);
    },
    findById: (id: string): User | undefined => {
      return users.find(user => user.id === id);
    },
    update: (id: string, updates: Partial<User>): User | undefined => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) return undefined;
      
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date(),
      };
      return users[userIndex];
    },
    findAll: (): User[] => users,
  },

  // Account operations
  accounts: {
    create: (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account => {
      const account: Account = {
        id: uuidv4(),
        ...accountData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      accounts.push(account);
      return account;
    },
    findById: (id: string): Account | undefined => {
      return accounts.find(account => account.id === id);
    },
    findByUserId: (userId: string): Account[] => {
      return accounts.filter(account => account.userId === userId);
    },
    update: (id: string, updates: Partial<Account>): Account | undefined => {
      const accountIndex = accounts.findIndex(account => account.id === id);
      if (accountIndex === -1) return undefined;
      
      accounts[accountIndex] = {
        ...accounts[accountIndex],
        ...updates,
        updatedAt: new Date(),
      };
      return accounts[accountIndex];
    },
    findAll: (): Account[] => accounts,
  },

  // Transaction operations
  transactions: {
    create: (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
      const transaction: Transaction = {
        id: uuidv4(),
        ...transactionData,
        createdAt: new Date(),
      };
      transactions.push(transaction);
      return transaction;
    },
    findById: (id: string): Transaction | undefined => {
      return transactions.find(transaction => transaction.id === id);
    },
    findByAccountId: (accountId: string, limit?: number, offset?: number): Transaction[] => {
      let results = transactions.filter(transaction => transaction.accountId === accountId);
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      if (offset) results = results.slice(offset);
      if (limit) results = results.slice(0, limit);
      
      return results;
    },
    update: (id: string, updates: Partial<Transaction>): Transaction | undefined => {
      const transactionIndex = transactions.findIndex(transaction => transaction.id === id);
      if (transactionIndex === -1) return undefined;
      
      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        ...updates,
      };
      return transactions[transactionIndex];
    },
    findAll: (): Transaction[] => transactions,
  },
};
