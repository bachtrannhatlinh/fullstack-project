import { gql } from '@apollo/client';

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      phoneNumber
      isActive
      accounts {
        id
        accountNumber
        accountType
        balance
        currency
        isActive
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
      phoneNumber
      isActive
      accounts {
        id
        accountNumber
        accountType
        balance
        currency
        isActive
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
      phoneNumber
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Account Queries
export const GET_ACCOUNTS = gql`
  query GetAccounts {
    accounts {
      id
      userId
      accountNumber
      accountType
      balance
      currency
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACCOUNT = gql`
  query GetAccount($id: ID!) {
    account(id: $id) {
      id
      userId
      accountNumber
      accountType
      balance
      currency
      isActive
      transactions {
        id
        amount
        type
        description
        category
        status
        reference
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_ACCOUNTS = gql`
  query GetUserAccounts($userId: ID!) {
    userAccounts(userId: $userId) {
      id
      accountNumber
      accountType
      balance
      currency
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACCOUNT_BALANCE = gql`
  query GetAccountBalance($accountId: ID!) {
    accountBalance(accountId: $accountId)
  }
`;

// Transaction Queries
export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      id
      accountId
      amount
      type
      description
      category
      status
      reference
      createdAt
    }
  }
`;

export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      id
      accountId
      amount
      type
      description
      category
      status
      reference
      metadata
      createdAt
    }
  }
`;

export const GET_ACCOUNT_TRANSACTIONS = gql`
  query GetAccountTransactions($accountId: ID!, $limit: Int, $offset: Int) {
    accountTransactions(accountId: $accountId, limit: $limit, offset: $offset) {
      id
      accountId
      amount
      type
      description
      category
      status
      reference
      createdAt
    }
  }
`;

export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($userId: ID!, $limit: Int, $offset: Int) {
    userTransactions(userId: $userId, limit: $limit, offset: $offset) {
      id
      accountId
      amount
      type
      description
      category
      status
      reference
      createdAt
    }
  }
`;

export const GET_MONTHLY_TRANSACTION_SUMMARY = gql`
  query GetMonthlyTransactionSummary($accountId: ID!, $year: Int!, $month: Int!) {
    monthlyTransactionSummary(accountId: $accountId, year: $year, month: $month) {
      totalIncome
      totalExpenses
      netAmount
      transactionCount
    }
  }
`;
