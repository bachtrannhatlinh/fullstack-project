# Deployment Guide

## Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform installed (v1.6+)
- Docker installed
- Node.js 18+ installed
- Git repository set up

## 🔐 Secrets Setup

### GitHub Secrets (Required for CI/CD)

Add these secrets to your GitHub repository:

```
AWS_ACCESS_KEY_ID          # AWS access key for deployment
AWS_SECRET_ACCESS_KEY      # AWS secret key for deployment
DB_PASSWORD                # PostgreSQL database password
DOCDB_PASSWORD            # DocumentDB password
JWT_SECRET                # JWT signing secret
REACT_APP_API_URL         # Backend API URL (set after deployment)
S3_BUCKET_NAME            # S3 bucket for frontend hosting
CLOUDFRONT_DISTRIBUTION_ID # CloudFront distribution ID
```

### Local Environment Variables

Create `.env` files for local development:

**backend/.env**:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/financial_db
MONGODB_URL=mongodb://localhost:27017/financial_docs
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**:
```env
REACT_APP_API_URL=http://localhost:4000/graphql
```

## 🏗️ Infrastructure Deployment

### 1. Initialize Terraform

```bash
cd infrastructure
terraform init
```

### 2. Create terraform.tfvars

```hcl
aws_region = "us-east-1"
environment = "prod"
project_name = "financehub"
db_password = "your-secure-db-password"
docdb_password = "your-secure-docdb-password"
jwt_secret = "your-super-secret-jwt-key"
allowed_origins = ["https://yourdomain.com"]
```

### 3. Deploy Infrastructure

```bash
# Review the plan
terraform plan -var-file="terraform.tfvars"

# Apply if everything looks good
terraform apply -var-file="terraform.tfvars"
```

### 4. Note the Outputs

After successful deployment, note these outputs:
- `alb_dns_name`: Load balancer DNS name for the backend
- `rds_endpoint`: Database endpoint
- `docdb_endpoint`: DocumentDB endpoint
- `redis_endpoint`: Redis endpoint

## 🐳 Container Registry Setup

### 1. Create ECR Repositories

```bash
# Create backend repository
aws ecr create-repository --repository-name financehub-backend

# Create frontend repository  
aws ecr create-repository --repository-name financehub-frontend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### 2. Update ECS Task Definition

Update the image URIs in `infrastructure/ecs.tf`:

```hcl
image = "<account-id>.dkr.ecr.us-east-1.amazonaws.com/financehub-backend:latest"
```

## 🚀 Application Deployment

### Option 1: GitHub Actions (Recommended)

1. Push code to the `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build and push Docker images
   - Update ECS services
   - Deploy frontend to S3/CloudFront

### Option 2: Manual Deployment

#### Backend Deployment

```bash
cd backend

# Build and tag image
docker build -t financehub-backend .
docker tag financehub-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/financehub-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/financehub-backend:latest

# Update ECS service
aws ecs update-service --cluster financehub-prod-cluster --service financehub-prod-backend --force-new-deployment
```

#### Frontend Deployment

```bash
cd frontend

# Build for production
REACT_APP_API_URL=https://your-alb-dns-name/graphql npm run build

# Deploy to S3
aws s3 sync build/ s3://your-s3-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🗄️ Database Setup

### 1. Database Migration

Connect to your RDS instance and create the initial schema:

```sql
-- Connect to PostgreSQL
CREATE DATABASE financial_db;

-- Create tables (example)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

### 2. Seed Data (Optional)

```bash
cd backend
npm run db:seed
```

## 🔍 Health Checks

### Verify Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-alb-dns-name/health
   ```

2. **Frontend Access**: 
   Open your CloudFront domain in a browser

3. **Database Connectivity**:
   ```bash
   # From ECS task
   curl https://your-alb-dns-name/metrics
   ```

## 📊 Monitoring Setup

### CloudWatch Dashboards

Create dashboards for:
- ECS service metrics
- RDS performance metrics
- Application logs
- Error rates

### Alarms

Set up CloudWatch alarms for:
- High CPU usage
- Database connection errors
- Application errors
- High response times

## 🔄 Rolling Updates

### Backend Updates

```bash
# Build new image
docker build -t financehub-backend:v2.0.0 .
docker tag financehub-backend:v2.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/financehub-backend:v2.0.0

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/financehub-backend:v2.0.0

# Update task definition and service
aws ecs update-service --cluster financehub-prod-cluster --service financehub-prod-backend --force-new-deployment
```

### Zero-Downtime Deployments

The ECS service is configured for rolling deployments with health checks to ensure zero downtime.

## 🛡️ Security Hardening

### Post-Deployment Security

1. **Update Security Groups**: Restrict access to databases
2. **Enable VPC Flow Logs**: Monitor network traffic
3. **Set up AWS Config**: Compliance monitoring
4. **Enable GuardDuty**: Threat detection
5. **Configure WAF**: Web application firewall

### SSL/TLS Configuration

1. **ACM Certificate**: Create SSL certificate for your domain
2. **CloudFront**: Configure HTTPS redirects
3. **ALB**: Enable HTTPS listeners

## 🔧 Troubleshooting

### Common Issues

1. **ECS Task Won't Start**:
   - Check CloudWatch logs
   - Verify environment variables
   - Ensure ECR permissions

2. **Database Connection Failed**:
   - Check security group rules
   - Verify connection strings
   - Test from ECS task

3. **Frontend Not Loading**:
   - Check S3 bucket policy
   - Verify CloudFront configuration
   - Check CORS settings

### Debug Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster financehub-prod-cluster --services financehub-prod-backend

# View task logs
aws logs tail /ecs/financehub-prod-backend --follow

# Test database connection
aws rds describe-db-instances --db-instance-identifier financehub-prod-postgres
```

## 📱 Environment Management

### Multiple Environments

Create separate Terraform workspaces:

```bash
# Development environment
terraform workspace new dev
terraform apply -var="environment=dev"

# Staging environment  
terraform workspace new staging
terraform apply -var="environment=staging"

# Production environment
terraform workspace new prod
terraform apply -var="environment=prod"
```

## 🎯 Performance Optimization

### Production Optimizations

1. **Enable RDS Performance Insights**
2. **Configure ElastiCache**: Redis for session storage
3. **Set up CDN**: CloudFront for static assets
4. **Database Connection Pooling**: Configure in application
5. **Auto Scaling**: Configure ECS service auto scaling

This completes the full deployment setup for the Financial Services Platform!
