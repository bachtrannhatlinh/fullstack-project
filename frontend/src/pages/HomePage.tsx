import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  AccountBalance,
  Security,
  TrendingUp,
  Payment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: 'Account Management',
      description: 'Manage multiple accounts including checking, savings, and investment accounts.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure Transactions',
      description: 'Bank-level security for all your financial transactions and data.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Financial Analytics',
      description: 'Track your spending patterns and financial growth with detailed analytics.',
    },
    {
      icon: <Payment sx={{ fontSize: 40 }} />,
      title: 'Easy Payments',
      description: 'Send and receive payments quickly and securely with our platform.',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Welcome to FinanceHub
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          paragraph
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Your comprehensive financial services platform. Manage accounts, track transactions,
          and grow your wealth with confidence.
        </Typography>

        <Box sx={{ mb: 6 }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2, mb: 2 }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ mr: 2, mb: 2 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ mb: 2 }}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Chip
            label="Secure"
            color="primary"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label="Fast"
            color="secondary"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label="Reliable"
            color="success"
            sx={{ mr: 1, mb: 1 }}
          />
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          bgcolor: 'grey.50',
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to get started?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Join thousands of users who trust FinanceHub with their financial management.
        </Typography>
        {!isAuthenticated && (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
          >
            Create Account
          </Button>
        )}
      </Box>
    </Container>
  );
};
