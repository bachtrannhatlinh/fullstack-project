import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TransactionType, TransactionStatus } from '../../types';

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  category?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  description?: string;
}

interface TransactionFilterDialogProps {
  open: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  categories: string[];
}

export const TransactionFilterDialog: React.FC<TransactionFilterDialogProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange,
  categories,
}) => {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: TransactionFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleFieldChange = (field: keyof TransactionFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Filter Transactions
          {getActiveFiltersCount() > 0 && (
            <Chip 
              label={`${getActiveFiltersCount()} active`} 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={localFilters.type || ''}
                    onChange={(e) => handleFieldChange('type', e.target.value as TransactionType)}
                    label="Transaction Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value={TransactionType.DEPOSIT}>Deposit</MenuItem>
                    <MenuItem value={TransactionType.WITHDRAWAL}>Withdrawal</MenuItem>
                    <MenuItem value={TransactionType.TRANSFER}>Transfer</MenuItem>
                    <MenuItem value={TransactionType.PAYMENT}>Payment</MenuItem>
                    <MenuItem value={TransactionType.REFUND}>Refund</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={localFilters.status || ''}
                    onChange={(e) => handleFieldChange('status', e.target.value as TransactionStatus)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value={TransactionStatus.PENDING}>Pending</MenuItem>
                    <MenuItem value={TransactionStatus.COMPLETED}>Completed</MenuItem>
                    <MenuItem value={TransactionStatus.FAILED}>Failed</MenuItem>
                    <MenuItem value={TransactionStatus.CANCELLED}>Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={localFilters.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Description Contains"
                  value={localFilters.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Amount"
                  type="number"
                  value={localFilters.amountMin || ''}
                  onChange={(e) => handleFieldChange('amountMin', parseFloat(e.target.value) || undefined)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Amount"
                  type="number"
                  value={localFilters.amountMax || ''}
                  onChange={(e) => handleFieldChange('amountMax', parseFloat(e.target.value) || undefined)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date From"
                  value={localFilters.dateFrom || null}
                  onChange={(newValue: Date | null) => handleFieldChange('dateFrom', newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date To"
                  value={localFilters.dateTo || null}
                  onChange={(newValue: Date | null) => handleFieldChange('dateTo', newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClearFilters} color="secondary">
            Clear All
          </Button>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

// Helper function to apply filters to transactions
export const applyTransactionFilters = (
  transactions: any[],
  filters: TransactionFilters
): any[] => {
  return transactions.filter(transaction => {
    // Type filter
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status && transaction.status !== filters.status) {
      return false;
    }

    // Category filter
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    // Description filter
    if (filters.description && 
        !transaction.description.toLowerCase().includes(filters.description.toLowerCase())) {
      return false;
    }

    // Amount filters
    if (filters.amountMin && transaction.amount < filters.amountMin) {
      return false;
    }
    if (filters.amountMax && transaction.amount > filters.amountMax) {
      return false;
    }

    // Date filters
    const transactionDate = new Date(transaction.createdAt);
    if (filters.dateFrom && transactionDate < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && transactionDate > filters.dateTo) {
      return false;
    }

    return true;
  });
};
