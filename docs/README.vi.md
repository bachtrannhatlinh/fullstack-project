# Financial Services Platform

Một platform dịch vụ tài chính được xây dựng với công nghệ hiện đại.

## Tính năng chính

- 🏦 **Quản lý tài khoản**: Tạo và quản lý nhiều loại tài khoản (Checking, Savings, Investment, Credit)
- 💳 **Xử lý giao dịch**: Gửi tiền, rút tiền, chuyển khoản an toàn
- 📊 **Phân tích tài chính**: Theo dõi chi tiêu và tăng trưởng tài chính
- 🔐 **Bảo mật cao**: Xác thực JWT, mã hóa dữ liệu
- 📱 **Giao diện responsive**: Thiết kế Material UI hiện đại

## Tech Stack

### Frontend
- **React 19** với TypeScript
- **Material-UI (MUI)** cho giao diện
- **Apollo Client** cho GraphQL
- **React Router** cho routing

### Backend
- **Node.js** với Express
- **GraphQL** với Apollo Server
- **TypeScript** cho type safety
- **JWT** cho authentication

### Database
- **PostgreSQL** (Primary database)
- **MongoDB** (Document storage)
- **Redis** (Caching)

### Infrastructure
- **AWS** (Cloud platform)
- **Terraform** (Infrastructure as Code)
- **Docker** (Containerization)
- **ECS** (Container orchestration)
- **CloudFront** (CDN)

## Cấu trúc dự án

```
├── frontend/          # React TypeScript app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── graphql/       # GraphQL queries/mutations
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   ├── public/
│   └── Dockerfile
├── backend/           # Node.js GraphQL API
│   ├── src/
│   │   ├── graphql/       # GraphQL schema & resolvers
│   │   ├── database/      # Database connections
│   │   └── utils/         # Utilities
│   └── Dockerfile
├── infrastructure/    # Terraform AWS config
└── docs/             # Documentation
```

## Bắt đầu phát triển

### Yêu cầu hệ thống
- Node.js 18+
- Docker & Docker Compose
- AWS CLI (cho production)
- Terraform (cho infrastructure)

### Cài đặt local

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd fullstack-project
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Docker development**
   ```bash
   docker-compose up -d
   ```

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/financial_db
MONGODB_URL=mongodb://admin:password@localhost:27017/financial_docs
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:4000/graphql
```

## Deployment

### Infrastructure Setup
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Application Deployment
1. Build và push Docker images lên ECR
2. Update ECS services
3. Deploy frontend lên S3/CloudFront

## API Documentation

GraphQL API endpoint: `http://localhost:4000/graphql`

### Queries chính
- `me`: Lấy thông tin user hiện tại
- `accounts`: Lấy danh sách tài khoản
- `transactions`: Lấy lịch sử giao dịch

### Mutations chính
- `register`: Đăng ký tài khoản
- `login`: Đăng nhập
- `createAccount`: Tạo tài khoản mới
- `createTransaction`: Tạo giao dịch

## Security Features

- JWT-based authentication
- Password hashing với bcrypt
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
