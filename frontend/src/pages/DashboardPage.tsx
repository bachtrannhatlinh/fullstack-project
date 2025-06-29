import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Receipt,
  Add,
} from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { format } from 'date-fns';
import { AccountType, TransactionStatus } from '../types';

export const DashboardPage: React.FC = () => {
  const { data, loading, error } = useQuery(GET_ME);

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">Error loading dashboard</Typography>;

  const user = data?.me;
  const accounts = user?.accounts || [];
  
  const totalBalance = accounts.reduce((sum: number, account: any) => sum + account.balance, 0);
  const activeAccounts = accounts.filter((account: any) => account.isActive);

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Here's an overview of your financial accounts
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Balance</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                ${totalBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Accounts</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {activeAccounts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Transactions</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                sx={{ mb: 2 }}
                href="/accounts"
              >
                New Account
              </Button>
              <Typography variant="body2" color="text.secondary">
                Create a new account
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Accounts
              </Typography>
              {accounts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" paragraph>
                    You don't have any accounts yet
                  </Typography>
                  <Button variant="contained" href="/accounts">
                    Create Your First Account
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {accounts.map((account: any) => (
                    <Card key={account.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">
                              {account.accountType.replace('_', ' ')} Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {account.accountNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created {format(new Date(account.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              ${account.balance.toLocaleString()} {account.currency}
                            </Typography>
                            <Chip
                              label={account.accountType}
                              color={getAccountTypeColor(account.accountType)}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" fullWidth href="/accounts">
                  Manage Accounts
                </Button>
                <Button variant="outlined" fullWidth href="/transactions">
                  View Transactions
                </Button>
                <Button variant="outlined" fullWidth href="/profile">
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
