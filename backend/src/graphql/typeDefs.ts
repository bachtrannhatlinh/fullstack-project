import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
    isActive: Boolean!
    accounts: [Account!]!
    createdAt: Date!
    updatedAt: Date!
  }

  type Account {
    id: ID!
    userId: ID!
    accountNumber: String!
    accountType: AccountType!
    balance: Float!
    currency: String!
    isActive: Boolean!
    transactions: [Transaction!]!
    createdAt: Date!
    updatedAt: Date!
  }

  enum AccountType {
    CHECKING
    SAVINGS
    INVESTMENT
    CREDIT
  }

  type Transaction {
    id: ID!
    accountId: ID!
    amount: Float!
    type: TransactionType!
    description: String!
    category: String
    status: TransactionStatus!
    reference: String
    metadata: String
    createdAt: Date!
  }

  enum TransactionType {
    DEPOSIT
    WITHDRAWAL
    TRANSFER
    PAYMENT
    REFUND
  }

  enum TransactionStatus {
    PENDING
    COMPLETED
    FAILED
    CANCELLED
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # User queries
    me: User
    users: [User!]!
    user(id: ID!): User

    # Account queries
    accounts: [Account!]!
    account(id: ID!): Account
    userAccounts(userId: ID!): [Account!]!

    # Transaction queries
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction
    accountTransactions(accountId: ID!, limit: Int, offset: Int): [Transaction!]!
    userTransactions(userId: ID!, limit: Int, offset: Int): [Transaction!]!

    # Analytics
    accountBalance(accountId: ID!): Float!
    monthlyTransactionSummary(accountId: ID!, year: Int!, month: Int!): TransactionSummary!
  }

  type TransactionSummary {
    totalIncome: Float!
    totalExpenses: Float!
    netAmount: Float!
    transactionCount: Int!
  }

  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken: AuthPayload!

    # User management
    updateProfile(input: UpdateProfileInput!): User!
    deactivateUser(id: ID!): Boolean!

    # Account management
    createAccount(input: CreateAccountInput!): Account!
    updateAccount(id: ID!, input: UpdateAccountInput!): Account!
    deactivateAccount(id: ID!): Boolean!

    # Transaction management
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransactionStatus(id: ID!, status: TransactionStatus!): Transaction!
    transferFunds(input: TransferInput!): Boolean!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    phoneNumber: String
  }

  input CreateAccountInput {
    accountType: AccountType!
    currency: String!
    initialDeposit: Float
  }

  input UpdateAccountInput {
    currency: String
    isActive: Boolean
  }

  input CreateTransactionInput {
    accountId: ID!
    amount: Float!
    type: TransactionType!
    description: String!
    category: String
    reference: String
  }

  input TransferInput {
    fromAccountId: ID!
    toAccountId: ID!
    amount: Float!
    description: String!
  }
`;
