import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useQuery } from '@apollo/client';
import { GET_USER_TRANSACTIONS, GET_USER_ACCOUNTS } from '../../graphql/queries';
import { useAuth } from '../../hooks/useAuth';
import { Transaction, Account } from '../../types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsData {
  monthlySpending: { month: string; amount: number; income: number }[];
  categoryBreakdown: { category: string; amount: number }[];
  accountBalances: { accountType: string; balance: number }[];
}

export const SpendingAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6); // months
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    monthlySpending: [],
    categoryBreakdown: [],
    accountBalances: [],
  });

  const { data: transactionsData, loading: transactionsLoading } = useQuery(
    GET_USER_TRANSACTIONS,
    {
      variables: { userId: user?.id, limit: 1000 },
      skip: !user?.id,
    }
  );

  const { data: accountsData, loading: accountsLoading } = useQuery(
    GET_USER_ACCOUNTS,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  useEffect(() => {
    if (transactionsData?.userTransactions && accountsData?.userAccounts) {
      processAnalyticsData();
    }
  }, [transactionsData, accountsData, selectedPeriod]);

  const processAnalyticsData = () => {
    const transactions: Transaction[] = transactionsData.userTransactions;
    const accounts: Account[] = accountsData.userAccounts;

    // Monthly spending analysis
    const monthlyData = generateMonthlyData(transactions);
    
    // Category breakdown
    const categoryData = generateCategoryData(transactions);
    
    // Account balances
    const balanceData = generateBalanceData(accounts);

    setAnalyticsData({
      monthlySpending: monthlyData,
      categoryBreakdown: categoryData,
      accountBalances: balanceData,
    });
  };

  const generateMonthlyData = (transactions: Transaction[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const expenses = monthTransactions
        .filter(t => ['WITHDRAWAL', 'PAYMENT'].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0);

      const income = monthTransactions
        .filter(t => ['DEPOSIT', 'REFUND'].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: format(monthDate, 'MMM yyyy'),
        amount: expenses,
        income,
      });
    }
    
    return months;
  };

  const generateCategoryData = (transactions: Transaction[]) => {
    const categoryMap = new Map<string, number>();
    
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      const cutoffDate = subMonths(new Date(), selectedPeriod);
      return transactionDate >= cutoffDate && ['WITHDRAWAL', 'PAYMENT'].includes(t.type);
    });

    recentTransactions.forEach(t => {
      const category = t.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categories
  };

  const generateBalanceData = (accounts: Account[]) => {
    const balanceMap = new Map<string, number>();
    
    accounts.forEach(account => {
      const type = account.accountType;
      balanceMap.set(type, (balanceMap.get(type) || 0) + account.balance);
    });

    return Array.from(balanceMap.entries())
      .map(([accountType, balance]) => ({ accountType, balance }));
  };

  // Chart configurations
  const monthlyChartData = {
    labels: analyticsData.monthlySpending.map(d => d.month),
    datasets: [
      {
        label: 'Expenses',
        data: analyticsData.monthlySpending.map(d => d.amount),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Income',
        data: analyticsData.monthlySpending.map(d => d.income),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: analyticsData.categoryBreakdown.map(d => d.category),
    datasets: [
      {
        data: analyticsData.categoryBreakdown.map(d => d.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF',
          '#4BC0C0',
        ],
      },
    ],
  };

  const balanceChartData = {
    labels: analyticsData.accountBalances.map(d => d.accountType),
    datasets: [
      {
        label: 'Account Balance',
        data: analyticsData.accountBalances.map(d => d.balance),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (transactionsLoading || accountsLoading) {
    return (
      <Box p={3}>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Financial Analytics
      </Typography>
      
      <Box mb={3}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            label="Time Period"
          >
            <MenuItem value={3}>Last 3 months</MenuItem>
            <MenuItem value={6}>Last 6 months</MenuItem>
            <MenuItem value={12}>Last 12 months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Monthly Income vs Expenses */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Income vs Expenses
              </Typography>
              <Box height={400}>
                <Bar data={monthlyChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Balances */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Balances
              </Typography>
              <Box height={400}>
                <Bar data={balanceChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending by Category */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              <Box height={400}>
                <Pie data={categoryChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Summary */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      ${analyticsData.monthlySpending
                        .reduce((sum, d) => sum + d.income, 0)
                        .toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Income
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      ${analyticsData.monthlySpending
                        .reduce((sum, d) => sum + d.amount, 0)
                        .toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Expenses
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography 
                      variant="h4" 
                      color={
                        analyticsData.monthlySpending.reduce((sum, d) => sum + (d.income - d.amount), 0) >= 0 
                          ? 'success.main' 
                          : 'error.main'
                      }
                    >
                      ${analyticsData.monthlySpending
                        .reduce((sum, d) => sum + (d.income - d.amount), 0)
                        .toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Net Savings
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
