import { Context } from '../../types';

export const accountResolvers = {
  Query: {
    accounts: async (_: any, __: any, context: Context) => {
      // TODO: Get all accounts
      throw new Error('Not implemented yet');
    },
    account: async (_: any, { id }: any, context: Context) => {
      // TODO: Get account by ID
      throw new Error('Not implemented yet');
    },
    userAccounts: async (_: any, { userId }: any, context: Context) => {
      // TODO: Get accounts for specific user
      throw new Error('Not implemented yet');
    },
    accountBalance: async (_: any, { accountId }: any, context: Context) => {
      // TODO: Get account balance
      return 0;
    },
  },
  Mutation: {
    createAccount: async (_: any, { input }: any, context: Context) => {
      // TODO: Create new account
      throw new Error('Not implemented yet');
    },
    updateAccount: async (_: any, { id, input }: any, context: Context) => {
      // TODO: Update account
      throw new Error('Not implemented yet');
    },
    deactivateAccount: async (_: any, { id }: any, context: Context) => {
      // TODO: Deactivate account
      return false;
    },
  },
  Account: {
    transactions: async (parent: any, _: any, context: Context) => {
      // TODO: Get account transactions
      return [];
    },
  },
};
