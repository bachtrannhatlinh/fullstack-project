import { Context } from '../../types';
import { createTransactionSchema } from '../../utils/validation';
import { logger } from '../../utils/logger';
import { Transaction } from '../../database/mockDb';

export const transactionResolvers = {
  Query: {
    transactions: async (_: any, __: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        
        const transactions = context.db.transactions.findAll();
        logger.info(`Retrieved ${transactions.length} transactions`);
        return transactions;
      } catch (error) {
        logger.error('Error retrieving transactions:', error);
        throw error;
      }
    },

    transaction: async (_: any, { id }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const transaction = context.db.transactions.findById(id);
        if (!transaction) {
          throw new Error('Transaction not found');
        }

        // Check if user owns the account associated with this transaction
        const account = context.db.accounts.findById(transaction.accountId);
        if (!account || account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        return transaction;
      } catch (error) {
        logger.error(`Error retrieving transaction ${id}:`, error);
        throw error;
      }
    },

    accountTransactions: async (_: any, { accountId, limit = 50, offset = 0 }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Check if user owns this account
        const account = context.db.accounts.findById(accountId);
        if (!account || account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        const transactions = context.db.transactions.findByAccountId(accountId)
          .sort((a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(offset, offset + limit);

        logger.info(`Retrieved ${transactions.length} transactions for account ${accountId}`);
        return transactions;
      } catch (error) {
        logger.error(`Error retrieving transactions for account ${accountId}:`, error);
        throw error;
      }
    },

    userTransactions: async (_: any, { userId, limit = 50, offset = 0 }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Users can only access their own transactions
        if (userId && userId !== context.user.id) {
          throw new Error('Access denied');
        }

        const targetUserId = userId || context.user.id;
        
        // Get all user's accounts
        const userAccounts = context.db.accounts.findByUserId(targetUserId);
        const accountIds = userAccounts.map((account: any) => account.id);

        // Get all transactions for these accounts
        const allTransactions = accountIds.flatMap((accountId: string) => 
          context.db.transactions.findByAccountId(accountId)
        );

        const transactions = allTransactions
          .sort((a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(offset, offset + limit);

        logger.info(`Retrieved ${transactions.length} transactions for user ${targetUserId}`);
        return transactions;
      } catch (error) {
        logger.error(`Error retrieving transactions for user ${userId}:`, error);
        throw error;
      }
    },

    monthlyTransactionSummary: async (_: any, { accountId, year, month }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Check if user owns this account
        const account = context.db.accounts.findById(accountId);
        if (!account || account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        const transactions = context.db.transactions.findByAccountId(accountId);
        
        // Filter transactions for the specified month
        const monthlyTransactions = transactions.filter((transaction: Transaction) => {
          const date = new Date(transaction.createdAt);
          return date.getFullYear() === year && date.getMonth() === month - 1;
        });

        const totalIncome = monthlyTransactions
          .filter((t: Transaction) => ['DEPOSIT', 'REFUND'].includes(t.type))
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const totalExpenses = monthlyTransactions
          .filter((t: Transaction) => ['WITHDRAWAL', 'PAYMENT'].includes(t.type))
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        return {
          totalIncome,
          totalExpenses,
          netAmount: totalIncome - totalExpenses,
          transactionCount: monthlyTransactions.length,
        };
      } catch (error) {
        logger.error(`Error retrieving monthly summary for account ${accountId}:`, error);
        throw error;
      }
    },
  },

  Mutation: {
    createTransaction: async (_: any, { input }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Validate input
        const { error, value } = createTransactionSchema.validate(input);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const { accountId, amount, type, description, category, reference } = value;

        // Check if user owns this account
        const account = context.db.accounts.findById(accountId);
        if (!account || account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        // Check account is active
        if (!account.isActive) {
          throw new Error('Cannot create transaction for inactive account');
        }

        // Check balance for withdrawals and payments
        if (['WITHDRAWAL', 'PAYMENT'].includes(type) && account.balance < amount) {
          throw new Error('Insufficient funds');
        }

        // Create transaction
        const transaction = context.db.transactions.create({
          accountId,
          amount,
          type,
          description,
          category,
          reference,
          status: 'COMPLETED',
        });

        // Update account balance
        let newBalance = account.balance;
        if (['DEPOSIT', 'REFUND'].includes(type)) {
          newBalance += amount;
        } else if (['WITHDRAWAL', 'PAYMENT'].includes(type)) {
          newBalance -= amount;
        }

        context.db.accounts.update(accountId, { balance: newBalance });

        logger.info(`Transaction created: ${transaction.id} for account ${accountId}`);
        return transaction;
      } catch (error) {
        logger.error('Error creating transaction:', error);
        throw error;
      }
    },

    updateTransactionStatus: async (_: any, { id, status }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const transaction = context.db.transactions.findById(id);
        if (!transaction) {
          throw new Error('Transaction not found');
        }

        // Check if user owns the account associated with this transaction
        const account = context.db.accounts.findById(transaction.accountId);
        if (!account || account.userId !== context.user.id) {
          throw new Error('Access denied');
        }

        const updatedTransaction = context.db.transactions.update(id, { status });
        logger.info(`Transaction status updated: ${id} to ${status}`);
        return updatedTransaction;
      } catch (error) {
        logger.error(`Error updating transaction status ${id}:`, error);
        throw error;
      }
    },

    transferFunds: async (_: any, { input }: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const { fromAccountId, toAccountId, amount, description } = input;

        // Validate accounts exist and user owns them
        const fromAccount = context.db.accounts.findById(fromAccountId);
        const toAccount = context.db.accounts.findById(toAccountId);

        if (!fromAccount || fromAccount.userId !== context.user.id) {
          throw new Error('Invalid source account');
        }

        if (!toAccount) {
          throw new Error('Invalid destination account');
        }

        if (!fromAccount.isActive || !toAccount.isActive) {
          throw new Error('Cannot transfer to/from inactive accounts');
        }

        if (fromAccount.balance < amount) {
          throw new Error('Insufficient funds');
        }

        // Create withdrawal transaction
        context.db.transactions.create({
          accountId: fromAccountId,
          amount,
          type: 'TRANSFER',
          description: `Transfer to ${toAccount.accountNumber}: ${description}`,
          status: 'COMPLETED',
        });

        // Create deposit transaction
        context.db.transactions.create({
          accountId: toAccountId,
          amount,
          type: 'TRANSFER',
          description: `Transfer from ${fromAccount.accountNumber}: ${description}`,
          status: 'COMPLETED',
        });

        // Update balances
        context.db.accounts.update(fromAccountId, { 
          balance: fromAccount.balance - amount 
        });
        context.db.accounts.update(toAccountId, { 
          balance: toAccount.balance + amount 
        });

        logger.info(`Transfer completed: ${amount} from ${fromAccountId} to ${toAccountId}`);
        return true;
      } catch (error) {
        logger.error('Error transferring funds:', error);
        throw error;
      }
    },
  },

  Transaction: {
    // No nested resolvers needed for now
  },
};
