# Financial Services Platform

A comprehensive financial services platform built with modern technologies.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- Apollo Client (GraphQL)

### Backend
- Node.js
- Express.js
- GraphQL (Apollo Server)
- TypeScript

### Databases
- PostgreSQL (Primary database)
- MongoDB (Document storage)

### Infrastructure
- AWS (Cloud platform)
- Terraform (Infrastructure as Code)
- Docker (Containerization)

## Project Structure

```
├── frontend/          # React TypeScript application
├── backend/           # Node.js GraphQL API
├── infrastructure/    # Terraform AWS configuration
└── docs/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- AWS CLI
- Terraform

### Development Setup

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Infrastructure Setup**
   ```bash
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

## Features

- User Authentication & Authorization
- Account Management
- Transaction Processing
- Financial Analytics
- Payment Gateway Integration
- Real-time Notifications
- Secure Data Handling

## Environment Variables

See individual service README files for specific environment configurations.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
