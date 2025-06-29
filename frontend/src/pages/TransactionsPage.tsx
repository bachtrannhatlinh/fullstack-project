import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

export const TransactionsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Transactions
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transaction History
          </Typography>
          <Typography color="text.secondary">
            This page will show transaction history and management. Implementation coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
