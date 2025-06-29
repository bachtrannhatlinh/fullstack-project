import { Context } from '../../types';
import { db } from '../../database/mockDb';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const user = db.users.findById(context.user.id);
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },
    
    users: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      // TODO: Add admin role check
      return db.users.findAll();
    },
    
    user: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const user = db.users.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // TODO: Add permission check (admin or self)
      return user;
    },
  },
  
  Mutation: {
    updateProfile: async (_: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const updatedUser = db.users.update(context.user.id, input);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    },
    
    deactivateUser: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // TODO: Add admin role check
      const updatedUser = db.users.update(id, { isActive: false });
      return !!updatedUser;
    },
  },
  
  User: {
    accounts: async (parent: any, _: any, context: Context) => {
      return db.accounts.findByUserId(parent.id);
    },
  },
};
