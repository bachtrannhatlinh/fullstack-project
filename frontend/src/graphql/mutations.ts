import { gql } from '@apollo/client';

// Authentication Mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
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
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
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
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      token
      user {
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
  }
`;

// User Mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      firstName
      lastName
      phoneNumber
      isActive
      updatedAt
    }
  }
`;

// Account Mutations
export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
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

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      id
      accountNumber
      accountType
      balance
      currency
      isActive
      updatedAt
    }
  }
`;

export const DEACTIVATE_ACCOUNT = gql`
  mutation DeactivateAccount($id: ID!) {
    deactivateAccount(id: $id)
  }
`;

// Transaction Mutations
export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
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

export const UPDATE_TRANSACTION_STATUS = gql`
  mutation UpdateTransactionStatus($id: ID!, $status: TransactionStatus!) {
    updateTransactionStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const TRANSFER_FUNDS = gql`
  mutation TransferFunds($input: TransferInput!) {
    transferFunds(input: $input)
  }
`;
