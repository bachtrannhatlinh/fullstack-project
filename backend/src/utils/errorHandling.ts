import { GraphQLError } from 'graphql';
import { logger } from './logger';

export enum ErrorCode {
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  INVALID_OPERATION = 'INVALID_OPERATION',
}

export class CustomError extends Error {
  public code: ErrorCode;
  public statusCode: number;
  public details?: any;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 400,
    details?: any
  ) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCode.AUTHENTICATION_REQUIRED, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, ErrorCode.ACCESS_DENIED, 403);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string) {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
  }
}

export class InsufficientFundsError extends CustomError {
  constructor(message: string = 'Insufficient funds') {
    super(message, ErrorCode.INSUFFICIENT_FUNDS, 400);
  }
}

export class AccountInactiveError extends CustomError {
  constructor(message: string = 'Account is inactive') {
    super(message, ErrorCode.ACCOUNT_INACTIVE, 400);
  }
}

export class TransactionFailedError extends CustomError {
  constructor(message: string) {
    super(message, ErrorCode.TRANSACTION_FAILED, 400);
  }
}

export class DuplicateResourceError extends CustomError {
  constructor(resource: string) {
    super(`${resource} already exists`, ErrorCode.DUPLICATE_RESOURCE, 409);
  }
}

export class InvalidOperationError extends CustomError {
  constructor(message: string) {
    super(message, ErrorCode.INVALID_OPERATION, 400);
  }
}

// GraphQL error formatter
export const formatGraphQLError = (error: any) => {
  // Log the error
  logger.error('GraphQL Error:', {
    message: error.message,
    code: error.extensions?.code,
    path: error.path,
    stack: error.stack,
  });

  // Handle known custom errors
  if (error.originalError instanceof CustomError) {
    return new GraphQLError(error.message, {
      extensions: {
        code: error.originalError.code,
        statusCode: error.originalError.statusCode,
        details: error.originalError.details,
      },
    });
  }

  // Handle validation errors from Joi
  if (error.message.includes('Validation error:')) {
    return new GraphQLError(error.message, {
      extensions: {
        code: ErrorCode.VALIDATION_ERROR,
        statusCode: 400,
      },
    });
  }

  // Handle authentication errors
  if (error.message.includes('Authentication required') || 
      error.message.includes('Access denied')) {
    return new GraphQLError(error.message, {
      extensions: {
        code: error.message.includes('Authentication required') 
          ? ErrorCode.AUTHENTICATION_REQUIRED 
          : ErrorCode.ACCESS_DENIED,
        statusCode: error.message.includes('Authentication required') ? 401 : 403,
      },
    });
  }

  // Default to internal error for unknown errors
  return new GraphQLError('An internal error occurred', {
    extensions: {
      code: ErrorCode.INTERNAL_ERROR,
      statusCode: 500,
    },
  });
};

// Utility function to handle async errors in resolvers
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (context) {
      logger.error(`Error in ${context}:`, error);
    }
    throw error;
  }
};

// Express error handler middleware
export const errorHandler = (error: any, req: any, res: any, next: any) => {
  logger.error('Express Error:', error);

  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    code: ErrorCode.INTERNAL_ERROR,
  });
};
