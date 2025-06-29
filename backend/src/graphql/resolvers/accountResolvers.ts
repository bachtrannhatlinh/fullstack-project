import { Context } from '../../types';
import { createAccountSchema } from '../../utils/validation';
import { logger } from '../../utils/logger';
import { Transaction } from '../../database/mockDb';

// Helper function to generate account number
const generateAccountNumber = (): string => {
  return Math.random().toString().slice(2, 12).padStart(10, '0');
};

export const accountResolvers = {
  Query: {
    accounts: async (_: any, __: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        
        const accounts = context.db.accounts.findAll();
        logger.info(`Retrieved ${accounts.length} accounts`);
        return accounts;
      } catch (error) {
        logger.error('Error retrieving accounts:', error);
        throw error;
      }
    },

    account: async (_: any, { id }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const account = context.db.accounts.findById(id);
        if (!account) {
          throw new Error('Account not found');
        }

        // Check if user owns this account or is admin
        if (account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        return account;
      } catch (error) {
        logger.error(`Error retrieving account ${id}:`, error);
        throw error;
      }
    },

    userAccounts: async (_: any, { userId }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Users can only access their own accounts
        if (userId && userId !== context.user.id) {
          throw new Error('Access denied');
        }

        const targetUserId = userId || context.user.id;
        const accounts = context.db.accounts.findByUserId(targetUserId);
        logger.info(`Retrieved ${accounts.length} accounts for user ${targetUserId}`);
        return accounts;
      } catch (error) {
        logger.error(`Error retrieving accounts for user ${userId}:`, error);
        throw error;
      }
    },

    accountBalance: async (_: any, { accountId }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const account = context.db.accounts.findById(accountId);
        if (!account) {
          throw new Error('Account not found');
        }

        // Check if user owns this account
        if (account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        // Calculate real-time balance from transactions
        const transactions = context.db.transactions.findByAccountId(accountId);
        const calculatedBalance = transactions
          .filter((t: Transaction) => t.status === 'COMPLETED')
          .reduce((balance: number, transaction: Transaction) => {
            if (transaction.type === 'DEPOSIT' || transaction.type === 'REFUND') {
              return balance + transaction.amount;
            } else {
              return balance - transaction.amount;
            }
          }, 0);

        // Update account balance if different
        if (Math.abs(account.balance - calculatedBalance) > 0.01) {
          context.db.accounts.update(accountId, { balance: calculatedBalance });
        }

        return calculatedBalance;
      } catch (error) {
        logger.error(`Error retrieving balance for account ${accountId}:`, error);
        throw error;
      }
    },

    monthlyTransactionSummary: async (_: any, { accountId, year, month }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const account = context.db.accounts.findById(accountId);
        if (!account) {
          throw new Error('Account not found');
        }

        if (account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        const transactions = context.db.transactions.findByAccountId(accountId);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const monthlyTransactions = transactions.filter((t: Transaction) => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate >= startDate && 
                 transactionDate <= endDate && 
                 t.status === 'COMPLETED';
        });

        const totalIncome = monthlyTransactions
          .filter((t: Transaction) => t.type === 'DEPOSIT' || t.type === 'REFUND')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const totalExpenses = monthlyTransactions
          .filter((t: Transaction) => t.type === 'WITHDRAWAL' || t.type === 'PAYMENT' || t.type === 'TRANSFER')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        return {
          totalIncome,
          totalExpenses,
          netAmount: totalIncome - totalExpenses,
          transactionCount: monthlyTransactions.length
        };
      } catch (error) {
        logger.error(`Error generating monthly summary for account ${accountId}:`, error);
        throw error;
      }
    },
  },

  Mutation: {
    createAccount: async (_: any, { input }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Validate input
        const { error, value } = createAccountSchema.validate(input);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const { accountType, currency, initialDeposit = 0 } = value;

        // Create account
        const account = context.db.accounts.create({
          userId: context.user.id,
          accountNumber: generateAccountNumber(),
          accountType,
          balance: initialDeposit,
          currency,
          isActive: true,
        });

        // If there's an initial deposit, create a transaction
        if (initialDeposit > 0) {
          context.db.transactions.create({
            accountId: account.id,
            amount: initialDeposit,
            type: 'DEPOSIT',
            description: 'Initial deposit',
            category: 'DEPOSIT',
            status: 'COMPLETED',
          });
        }

        logger.info(`Account created: ${account.id} for user ${context.user.id}`);
        return account;
      } catch (error) {
        logger.error('Error creating account:', error);
        throw error;
      }
    },

    updateAccount: async (_: any, { id, input }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const account = context.db.accounts.findById(id);
        if (!account) {
          throw new Error('Account not found');
        }

        // Check if user owns this account
        if (account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        const updatedAccount = context.db.accounts.update(id, input);
        logger.info(`Account updated: ${id}`);
        return updatedAccount;
      } catch (error) {
        logger.error(`Error updating account ${id}:`, error);
        throw error;
      }
    },

    deactivateAccount: async (_: any, { id }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const account = context.db.accounts.findById(id);
        if (!account) {
          throw new Error('Account not found');
        }

        // Check if user owns this account
        if (account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        // Check if account has zero balance
        if (account.balance !== 0) {
          throw new Error('Cannot deactivate account with non-zero balance');
        }

        context.db.accounts.update(id, { isActive: false });
        logger.info(`Account deactivated: ${id}`);
        return true;
      } catch (error) {
        logger.error(`Error deactivating account ${id}:`, error);
        return false;
      }
    },
  },

  Account: {
    transactions: async (parent: any, _: any, context: Context) => {
      try {
        const transactions = context.db.transactions.findByAccountId(parent.id);
        return transactions;
      } catch (error) {
        logger.error(`Error retrieving transactions for account ${parent.id}:`, error);
        return [];
      }
    },
  },
};
