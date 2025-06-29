import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add,
  SwapHoriz,
  TrendingUp,
  TrendingDown,
  FilterList,
  Download,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_TRANSACTIONS, GET_USER_ACCOUNTS } from '../graphql/queries';
import { CREATE_TRANSACTION, TRANSFER_FUNDS } from '../graphql/mutations';
import { useAuth } from '../hooks/useAuth';
import { 
  TransactionType, 
  TransactionStatus, 
  Transaction, 
  CreateTransactionInput, 
  TransferInput,
  Account 
} from '../types';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transaction-tabpanel-${index}`}
      aria-labelledby={`transaction-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  
  const [transactionFormData, setTransactionFormData] = useState<CreateTransactionInput>({
    accountId: '',
    amount: 0,
    type: TransactionType.DEPOSIT,
    description: '',
    category: '',
  });

  const [transferFormData, setTransferFormData] = useState<TransferInput>({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    description: '',
  });

  const { data: transactionsData, loading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery(GET_USER_TRANSACTIONS, {
    variables: { userId: user?.id, limit: 100, offset: 0 },
    skip: !user?.id,
  });

  const { data: accountsData, loading: accountsLoading } = useQuery(GET_USER_ACCOUNTS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION, {
    onCompleted: () => {
      setCreateDialogOpen(false);
      setTransactionFormData({
        accountId: '',
        amount: 0,
        type: TransactionType.DEPOSIT,
        description: '',
        category: '',
      });
      refetchTransactions();
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
    },
  });

  const [transferFunds, { loading: transferring }] = useMutation(TRANSFER_FUNDS, {
    onCompleted: () => {
      setTransferDialogOpen(false);
      setTransferFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: 0,
        description: '',
      });
      refetchTransactions();
    },
    onError: (error) => {
      console.error('Error transferring funds:', error);
    },
  });

  const handleCreateTransaction = async () => {
    try {
      await createTransaction({
        variables: {
          input: {
            ...transactionFormData,
            amount: Number(transactionFormData.amount),
          },
        },
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleTransferFunds = async () => {
    try {
      await transferFunds({
        variables: {
          input: {
            ...transferFormData,
            amount: Number(transferFormData.amount),
          },
        },
      });
    } catch (error) {
      console.error('Error transferring funds:', error);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.REFUND:
        return <TrendingUp color="success" />;
      case TransactionType.WITHDRAWAL:
      case TransactionType.PAYMENT:
        return <TrendingDown color="error" />;
      case TransactionType.TRANSFER:
        return <SwapHoriz color="primary" />;
      default:
        return <SwapHoriz />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.REFUND:
        return 'success';
      case TransactionType.WITHDRAWAL:
      case TransactionType.PAYMENT:
        return 'error';
      case TransactionType.TRANSFER:
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'success';
      case TransactionStatus.PENDING:
        return 'warning';
      case TransactionStatus.FAILED:
        return 'error';
      case TransactionStatus.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  if (transactionsLoading || accountsLoading) return <LinearProgress />;
  if (transactionsError) return <Alert severity="error">Error loading transactions: {transactionsError.message}</Alert>;

  const transactions = transactionsData?.userTransactions || [];
  const accounts = accountsData?.userAccounts || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Transactions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<SwapHoriz />}
            onClick={() => setTransferDialogOpen(true)}
          >
            Transfer
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Transaction
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="All Transactions" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {transactions.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <SwapHoriz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No transactions yet
              </Typography>
              <Typography color="text.secondary" paragraph>
                Start by creating your first transaction or transfer
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<SwapHoriz />}
                  onClick={() => setTransferDialogOpen(true)}
                >
                  Transfer Funds
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  New Transaction
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTransactionIcon(transaction.type)}
                        <Chip
                          label={transaction.type}
                          color={getTransactionColor(transaction.type) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                      {transaction.category && (
                        <Typography variant="caption" color="text.secondary">
                          {transaction.category}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={
                          ['DEPOSIT', 'REFUND'].includes(transaction.type) 
                            ? 'success.main' 
                            : ['WITHDRAWAL', 'PAYMENT'].includes(transaction.type)
                            ? 'error.main'
                            : 'text.primary'
                        }
                        sx={{ fontWeight: 'medium' }}
                      >
                        {['DEPOSIT', 'REFUND'].includes(transaction.type) ? '+' : '-'}
                        ${transaction.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(transaction.createdAt), 'HH:mm')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Analytics
            </Typography>
            <Typography color="text.secondary">
              Analytics dashboard coming soon. This will include spending trends, category analysis, and financial insights.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Create Transaction Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={transactionFormData.accountId}
                label="Account"
                onChange={(e) => setTransactionFormData({ ...transactionFormData, accountId: e.target.value })}
              >
                {accounts.map((account: Account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountType} - {account.accountNumber} (${account.balance.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={transactionFormData.type}
                label="Transaction Type"
                onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value as TransactionType })}
              >
                <MenuItem value={TransactionType.DEPOSIT}>Deposit</MenuItem>
                <MenuItem value={TransactionType.WITHDRAWAL}>Withdrawal</MenuItem>
                <MenuItem value={TransactionType.PAYMENT}>Payment</MenuItem>
                <MenuItem value={TransactionType.REFUND}>Refund</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={transactionFormData.amount}
              onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: Number(e.target.value) })}
              InputProps={{
                startAdornment: '$',
              }}
            />

            <TextField
              fullWidth
              label="Description"
              value={transactionFormData.description}
              onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
            />

            <TextField
              fullWidth
              label="Category (Optional)"
              value={transactionFormData.category}
              onChange={(e) => setTransactionFormData({ ...transactionFormData, category: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTransaction} variant="contained" disabled={creating}>
            {creating ? 'Creating...' : 'Create Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Funds Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Funds</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>From Account</InputLabel>
              <Select
                value={transferFormData.fromAccountId}
                label="From Account"
                onChange={(e) => setTransferFormData({ ...transferFormData, fromAccountId: e.target.value })}
              >
                {accounts.map((account: Account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountType} - {account.accountNumber} (${account.balance.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>To Account</InputLabel>
              <Select
                value={transferFormData.toAccountId}
                label="To Account"
                onChange={(e) => setTransferFormData({ ...transferFormData, toAccountId: e.target.value })}
              >
                {accounts.filter(account => account.id !== transferFormData.fromAccountId).map((account: Account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountType} - {account.accountNumber} (${account.balance.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={transferFormData.amount}
              onChange={(e) => setTransferFormData({ ...transferFormData, amount: Number(e.target.value) })}
              InputProps={{
                startAdornment: '$',
              }}
            />

            <TextField
              fullWidth
              label="Description"
              value={transferFormData.description}
              onChange={(e) => setTransferFormData({ ...transferFormData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTransferFunds} variant="contained" disabled={transferring}>
            {transferring ? 'Transferring...' : 'Transfer Funds'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
