import { Context } from '../../types';
import { db } from '../../database/mockDb';
import { hashPassword, comparePassword, generateToken, generateAccountNumber } from '../../utils/auth';
import { registerSchema, loginSchema } from '../../utils/validation';
import { logger } from '../../utils/logger';

export const authResolvers = {
  Mutation: {
    register: async (_: any, { input }: any, context: Context) => {
      try {
        // Validate input
        const { error, value } = registerSchema.validate(input);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const { email, password, firstName, lastName, phoneNumber } = value;

        // Check if user already exists
        const existingUser = db.users.findByEmail(email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = db.users.create({
          email,
          passwordHash,
          firstName,
          lastName,
          phoneNumber,
          isActive: true,
        });

        // Create a default checking account
        const account = db.accounts.create({
          userId: user.id,
          accountNumber: generateAccountNumber(),
          accountType: 'CHECKING',
          balance: 0,
          currency: 'USD',
          isActive: true,
        });

        // Generate token
        const token = generateToken(user.id, user.email);

        logger.info(`User registered successfully: ${user.email}`);

        return {
          token,
          user: {
            ...user,
            accounts: [account],
          },
        };
      } catch (error) {
        logger.error('Registration error:', error);
        throw error;
      }
    },

    login: async (_: any, { input }: any, context: Context) => {
      try {
        // Validate input
        const { error, value } = loginSchema.validate(input);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const { email, password } = value;

        // Find user
        const user = db.users.findByEmail(email);
        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated');
        }

        // Check password
        const isValidPassword = await comparePassword(password, user.passwordHash);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        // Generate token
        const token = generateToken(user.id, user.email);

        // Get user accounts
        const accounts = db.accounts.findByUserId(user.id);

        logger.info(`User logged in successfully: ${user.email}`);

        return {
          token,
          user: {
            ...user,
            accounts,
          },
        };
      } catch (error) {
        logger.error('Login error:', error);
        throw error;
      }
    },

    refreshToken: async (_: any, __: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Find user
        const user = db.users.findById(context.user.id);
        if (!user || !user.isActive) {
          throw new Error('User not found or inactive');
        }

        // Generate new token
        const token = generateToken(user.id, user.email);

        // Get user accounts
        const accounts = db.accounts.findByUserId(user.id);

        return {
          token,
          user: {
            ...user,
            accounts,
          },
        };
      } catch (error) {
        logger.error('Token refresh error:', error);
        throw error;
      }
    },
  },
};
