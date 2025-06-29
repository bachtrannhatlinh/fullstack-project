import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Add } from '@mui/icons-material';

export const AccountsPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Accounts
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Create Account
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Management
          </Typography>
          <Typography color="text.secondary">
            This page will show account management functionality. Implementation coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
