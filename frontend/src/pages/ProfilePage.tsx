import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

export const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Profile
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User Profile
          </Typography>
          <Typography color="text.secondary">
            This page will show user profile management. Implementation coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
