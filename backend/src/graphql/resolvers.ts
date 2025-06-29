import { userResolvers } from './resolvers/userResolvers';
import { accountResolvers } from './resolvers/accountResolvers';
import { transactionResolvers } from './resolvers/transactionResolvers';
import { authResolvers } from './resolvers/authResolvers';
import { scalarResolvers } from './resolvers/scalarResolvers';

export const resolvers = {
  ...scalarResolvers,
  Query: {
    ...userResolvers.Query,
    ...accountResolvers.Query,
    ...transactionResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...accountResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },
  User: userResolvers.User,
  Account: accountResolvers.Account,
  Transaction: transactionResolvers.Transaction,
};
