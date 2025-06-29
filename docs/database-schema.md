# Database Schema Documentation

## PostgreSQL Schema (Primary Database)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Accounts Table
```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT')),
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REFUND')),
    description TEXT NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    reference VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Account indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_number ON accounts(account_number);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- Transaction indexes
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_amount ON transactions(amount);
```

## MongoDB Schema (Document Storage)

### User Documents Collection
```javascript
{
  _id: ObjectId,
  userId: String, // Reference to PostgreSQL user ID
  profile: {
    avatar: String,
    preferences: {
      theme: String,
      language: String,
      notifications: {
        email: Boolean,
        sms: Boolean,
        push: Boolean
      }
    }
  },
  documents: [{
    type: String, // 'id', 'passport', 'driver_license', etc.
    url: String,
    verified: Boolean,
    uploadedAt: Date
  }],
  auditLog: [{
    action: String,
    timestamp: Date,
    ip: String,
    userAgent: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Metadata Collection
```javascript
{
  _id: ObjectId,
  transactionId: String, // Reference to PostgreSQL transaction ID
  metadata: {
    geolocation: {
      lat: Number,
      lng: Number,
      address: String
    },
    device: {
      type: String,
      os: String,
      browser: String
    },
    riskScore: Number,
    tags: [String],
    notes: String
  },
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Redis Schema (Caching)

### Session Storage
```
Key: session:{userId}
Value: {
  userId: string,
  email: string,
  lastActivity: timestamp,
  loginTime: timestamp
}
TTL: 24 hours
```

### Rate Limiting
```
Key: rate_limit:{ip}:{endpoint}
Value: request_count
TTL: 15 minutes
```

### Cache Keys
```
Key: user:{userId}
Value: Cached user data
TTL: 1 hour

Key: account:{accountId}
Value: Cached account data
TTL: 30 minutes

Key: balance:{accountId}
Value: Cached balance
TTL: 5 minutes
```

## Data Relationships

### One-to-Many Relationships
- User → Accounts (1:N)
- Account → Transactions (1:N)

### Data Flow
1. User data stored in PostgreSQL
2. User metadata and documents stored in MongoDB
3. Frequently accessed data cached in Redis
4. Transaction processing updates all three systems

## Security Considerations

### Data Encryption
- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- TLS encryption in transit

### Data Access
- Row-level security in PostgreSQL
- User isolation in MongoDB
- Secure Redis configuration

### Backup Strategy
- PostgreSQL: Daily automated backups
- MongoDB: Replica set with backup
- Redis: AOF persistence with snapshots
