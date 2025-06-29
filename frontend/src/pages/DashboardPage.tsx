import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Receipt,
  Add,
  TrendingDown,
  SwapHoriz,
  Payment,
  Savings,
  Analytics,
  Refresh,
} from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { GET_ME, GET_USER_TRANSACTIONS } from '../graphql/queries';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AccountType, TransactionStatus, TransactionType, Transaction } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { SpendingAnalytics } from '../components/Analytics/SpendingAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
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

export const DashboardPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const { data, loading, error, refetch } = useQuery(GET_ME);
  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useQuery(GET_USER_TRANSACTIONS, {
    variables: { userId: data?.me?.id, limit: 50, offset: 0 },
    skip: !data?.me?.id,
  });

  const transactions = transactionsData?.userTransactions || [];
  
  // Calculate analytics
  const analytics = useMemo(() => {
    if (transactions.length === 0) return null;

    const currentMonth = new Date();
    const lastMonth = subMonths(currentMonth, 1);
    
    const currentMonthTransactions = transactions.filter((t: Transaction) => {
      const date = new Date(t.createdAt);
      return date >= startOfMonth(currentMonth) && date <= endOfMonth(currentMonth);
    });

    const lastMonthTransactions = transactions.filter((t: Transaction) => {
      const date = new Date(t.createdAt);
      return date >= startOfMonth(lastMonth) && date <= endOfMonth(lastMonth);
    });

    const currentMonthIncome = currentMonthTransactions
      .filter((t: Transaction) => ['DEPOSIT', 'REFUND'].includes(t.type))
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter((t: Transaction) => ['WITHDRAWAL', 'PAYMENT'].includes(t.type))
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const lastMonthIncome = lastMonthTransactions
      .filter((t: Transaction) => ['DEPOSIT', 'REFUND'].includes(t.type))
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter((t: Transaction) => ['WITHDRAWAL', 'PAYMENT'].includes(t.type))
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = currentMonthTransactions.reduce((acc: any, t: Transaction) => {
      const category = t.category || 'Other';
      if (['WITHDRAWAL', 'PAYMENT'].includes(t.type)) {
        acc[category] = (acc[category] || 0) + t.amount;
      }
      return acc;
    }, {});

    return {
      currentMonth: {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        net: currentMonthIncome - currentMonthExpenses,
      },
      lastMonth: {
        income: lastMonthIncome,
        expenses: lastMonthExpenses,
        net: lastMonthIncome - lastMonthExpenses,
      },
      categoryBreakdown,
    };
  }, [transactions]);

  const handleRefresh = () => {
    refetch();
    refetchTransactions();
  };

  if (loading || transactionsLoading) return <LinearProgress />;
  if (error) return <Typography color="error">Error loading dashboard</Typography>;

  const user = data?.me;
  const accounts = user?.accounts || [];
  
  const totalBalance = accounts.reduce((sum: number, account: any) => sum + account.balance, 0);
  const activeAccounts = accounts.filter((account: any) => account.isActive);
  const recentTransactions = transactions.slice(0, 5);

  const getAccountTypeColor = (type: AccountType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
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

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return <TrendingUp color="success" />;
      case TransactionType.WITHDRAWAL:
        return <TrendingDown color="error" />;
      case TransactionType.TRANSFER:
        return <SwapHoriz color="info" />;
      case TransactionType.PAYMENT:
        return <Payment color="warning" />;
      case TransactionType.REFUND:
        return <TrendingUp color="success" />;
      default:
        return <Receipt />;
    }
  };

  // Chart data for expenses by category
  const expenseChartData = analytics?.categoryBreakdown ? {
    labels: Object.keys(analytics.categoryBreakdown),
    datasets: [{
      data: Object.values(analytics.categoryBreakdown) as number[],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
      ],
    }],
  } : null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Welcome back, {user?.firstName}!
        </Typography>
        <IconButton onClick={handleRefresh} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Financial Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AccountBalance color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  ${totalBalance.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Balance
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Savings color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {activeAccounts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  ${analytics?.currentMonth?.income?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Month Income
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingDown color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                  ${analytics?.currentMonth?.expenses?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Month Expenses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Accounts and Recent Transactions */}
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
                  Recent Transactions
                </Typography>
                {recentTransactions.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No recent transactions
                  </Typography>
                ) : (
                  <List>
                    {recentTransactions.map((transaction: Transaction, index: number) => (
                      <React.Fragment key={transaction.id}>
                        <ListItem disableGutters>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'transparent' }}>
                              {getTransactionIcon(transaction.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={transaction.description}
                            secondary={format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                          />
                          <Typography
                            variant="body2"
                            color={['DEPOSIT', 'REFUND'].includes(transaction.type) ? 'success.main' : 'error.main'}
                            sx={{ fontWeight: 600 }}
                          >
                            {['DEPOSIT', 'REFUND'].includes(transaction.type) ? '+' : '-'}
                            ${transaction.amount.toLocaleString()}
                          </Typography>
                        </ListItem>
                        {index < recentTransactions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" fullWidth href="/transactions">
                    View All Transactions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Expense Chart */}
        {expenseChartData && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    This Month's Expenses by Category
                  </Typography>
                  <Doughnut 
                    data={expenseChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button variant="outlined" fullWidth href="/accounts" startIcon={<Add />}>
                      Create New Account
                    </Button>
                    <Button variant="outlined" fullWidth href="/transactions" startIcon={<SwapHoriz />}>
                      Transfer Funds
                    </Button>
                    <Button variant="outlined" fullWidth href="/transactions" startIcon={<Receipt />}>
                      View All Transactions
                    </Button>
                    <Button variant="outlined" fullWidth href="/profile" startIcon={<AccountBalance />}>
                      Update Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SpendingAnalytics />
      </TabPanel>
    </Box>
  );
};
