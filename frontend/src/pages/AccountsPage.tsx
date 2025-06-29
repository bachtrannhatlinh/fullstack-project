import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
  IconButton,
  Menu,
  MenuProps,
} from '@mui/material';
import { 
  Add, 
  MoreVert,
  AccountBalance,
  Savings,
  TrendingUp,
  CreditCard,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_ACCOUNTS } from '../graphql/queries';
import { CREATE_ACCOUNT, DEACTIVATE_ACCOUNT } from '../graphql/mutations';
import { useAuth } from '../hooks/useAuth';
import { AccountType, Account, CreateAccountInput } from '../types';
import { format } from 'date-fns';

export const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAccountInput>({
    accountType: AccountType.CHECKING,
    currency: 'USD',
    initialDeposit: 0,
  });

  const { data, loading, error, refetch } = useQuery(GET_USER_ACCOUNTS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  const [createAccount, { loading: creating }] = useMutation(CREATE_ACCOUNT, {
    onCompleted: () => {
      setCreateDialogOpen(false);
      setFormData({
        accountType: AccountType.CHECKING,
        currency: 'USD',
        initialDeposit: 0,
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error creating account:', error);
    },
  });

  const [deactivateAccount] = useMutation(DEACTIVATE_ACCOUNT, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deactivating account:', error);
    },
  });

  const handleCreateAccount = async () => {
    try {
      await createAccount({
        variables: {
          input: {
            ...formData,
            initialDeposit: Number(formData.initialDeposit) || 0,
          },
        },
      });
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleDeactivateAccount = async () => {
    if (selectedAccountId) {
      try {
        await deactivateAccount({
          variables: { id: selectedAccountId },
        });
        setAccountMenuAnchor(null);
        setSelectedAccountId(null);
      } catch (error) {
        console.error('Error deactivating account:', error);
      }
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.CHECKING:
        return <AccountBalance color="primary" />;
      case AccountType.SAVINGS:
        return <Savings color="success" />;
      case AccountType.INVESTMENT:
        return <TrendingUp color="secondary" />;
      case AccountType.CREDIT:
        return <CreditCard color="warning" />;
      default:
        return <AccountBalance />;
    }
  };

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case AccountType.CHECKING:
        return 'primary';
      case AccountType.SAVINGS:
        return 'success';
      case AccountType.INVESTMENT:
        return 'secondary';
      case AccountType.CREDIT:
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">Error loading accounts: {error.message}</Alert>;

  const accounts = data?.userAccounts || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Accounts
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Account
        </Button>
      </Box>

      {accounts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No accounts yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              Create your first account to start managing your finances
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account: Account) => (
            <Grid item xs={12} md={6} lg={4} key={account.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getAccountIcon(account.accountType)}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6">
                          {account.accountType.charAt(0) + account.accountType.slice(1).toLowerCase()} Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {account.accountNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={(e) => {
                        setAccountMenuAnchor(e.currentTarget);
                        setSelectedAccountId(account.id);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                    {account.currency} {account.balance.toLocaleString()}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={account.accountType}
                      color={getAccountTypeColor(account.accountType) as any}
                      size="small"
                    />
                    <Chip
                      label={account.isActive ? 'Active' : 'Inactive'}
                      color={account.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Created: {format(new Date(account.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Account Menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={() => setAccountMenuAnchor(null)}
      >
        <MenuItem onClick={handleDeactivateAccount}>
          Deactivate Account
        </MenuItem>
      </Menu>

      {/* Create Account Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={formData.accountType}
                label="Account Type"
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as AccountType })}
              >
                <MenuItem value={AccountType.CHECKING}>Checking Account</MenuItem>
                <MenuItem value={AccountType.SAVINGS}>Savings Account</MenuItem>
                <MenuItem value={AccountType.INVESTMENT}>Investment Account</MenuItem>
                <MenuItem value={AccountType.CREDIT}>Credit Account</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                label="Currency"
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
                <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                <MenuItem value="VND">VND - Vietnamese Dong</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Initial Deposit (Optional)"
              type="number"
              value={formData.initialDeposit}
              onChange={(e) => setFormData({ ...formData, initialDeposit: Number(e.target.value) })}
              InputProps={{
                startAdornment: formData.currency,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAccount} variant="contained" disabled={creating}>
            {creating ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
