# Saraha-App

Anonymous messaging application backend built with Node.js, Express, and MongoDB.

## 📁 Project Structure

```
saraha-app/
├── src/
│   ├── app.controller.js    # Express app bootstrap
│   ├── Config/              # Environment configurations (.env.dev, .env.prod)
│   ├── DB/                  # Database models and connection
│   │   ├── Models/          # User, Message, Token models
│   │   └── dbConnection.js
│   ├── Middlewares/         # Auth, validation middlewares
│   ├── Modules/             # Feature modules
│   │   ├── Auth/            # Authentication (signup, signin, OAuth)
│   │   ├── User/            # User management
│   │   └── Message/         # Anonymous messaging
│   ├── Utils/               # Utilities
│   │   ├── Security/        # JWT, encryption, hashing
│   │   ├── Email/           # Email templates and sending
│   │   ├── Multer/          # File uploads (Cloudinary)
│   │   └── ...              # Logger, CORS, rate limiting
│   ├── Uploads/             # Local file uploads
│   └── Logs/                # Application logs
├── index.js                 # Entry point
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.0.0
- MongoDB (local or cloud)
- npm >= 7.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/Mohamd-Abdelkreem/Saraha-App.git
cd Saraha-App

# Install dependencies
npm install
```

### Configuration

Create/update `src/Config/.env.dev`:

```env
# Database
DB_URL_LOCAL = "mongodb://127.0.0.1:27017/SarahaApp"
PORT = 3000

# Authentication
SALT_ROUNDS = 10
JWT_SECRET = "your_jwt_secret_key"
ACCESS_TOKEN_EXPIRES_IN = "1h"
REFRESH_TOKEN_EXPIRES_IN = 31536000

# Token Signatures
ACCESS_USER_TOKEN_SIGNATURE = "user_access_secret_key_minimum_32_characters_required_123456"
REFRESH_USER_TOKEN_SIGNATURE = "user_refresh_secret_key_minimum_32_characters_required_654321"
ACCESS_ADMIN_TOKEN_SIGNATURE = "admin_access_secret_key_minimum_32_characters_required_789012"
REFRESH_ADMIN_TOKEN_SIGNATURE = "admin_refresh_secret_key_minimum_32_characters_required_210987"

# Google OAuth (optional)
WEB_CLIENT_ID = "your_google_client_id"

# Email
EMAIL_USER = "your_email@gmail.com"
EMAIL_PASS = "your_app_password"
EMAIL_FROM = "your_email@gmail.com"

# Cloudinary (for image uploads)
CLOUD_NAME = "your_cloud_name"
CLOUD_API_KEY = "your_api_key"
CLOUD_API_SECRET = "your_api_secret"

# Encryption
ENCRYPTION_SECRET_KEY = "12345678901234567890123456789012"

# CORS
WHITELISTED_DOMAINS = "http://localhost:3000"

# Cookie
COOKIE_EXPIRES_IN_MS = 2629746000
```

### Running

```bash
# Development mode (auto-reload with nodemon)
npm run dev

# Production mode
npm start
```

Server runs on: **http://localhost:3000**

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run tests |

## 🔐 Features

### Authentication
- ✅ Email/Password registration with OTP verification
- ✅ Google OAuth integration
- ✅ JWT token-based authentication (access + refresh tokens)
- ✅ Password reset with OTP
- ✅ Token revocation on logout
- ✅ Credential change detection

### Messaging
- ✅ Send anonymous messages to users
- ✅ View received messages
- ✅ Delete messages
- ✅ Message validation

### User Management
- ✅ User profile management
- ✅ Photo/cover image uploads (Cloudinary)
- ✅ Soft delete/restore accounts
- ✅ Account freeze functionality
- ✅ Change password with logout options

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Google Auth Library** - OAuth integration
- **Nodemailer** - Email service
- **Cloudinary** - Image storage
- **Multer** - File uploads
- **Joi** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP logging
- **Express Rate Limit** - Rate limiting

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/signup                         # Register with email
POST   /api/auth/signin                         # Login with email
POST   /api/auth/signup/gmail                   # Register with Google
POST   /api/auth/signin/gmail                   # Login with Google
PATCH  /api/auth/confirm                        # Verify email with OTP
GET    /api/auth/refresh-token                  # Refresh access token
PATCH  /api/auth/forgot-password/request-otp    # Request password reset OTP
PATCH  /api/auth/forgot-password/confirm-otp    # Confirm reset OTP
PATCH  /api/auth/forgot-password/reset-password # Reset password
```

### Users

```
GET    /api/user/profile                        # Get current user profile
GET    /api/user/share/:userId                  # Get public user profile
PATCH  /api/user/update                         # Update profile
PATCH  /api/user/logout                         # Logout (with flag options)
PATCH  /api/user/change-password                # Change password
PATCH  /api/user/freeze/:userId?                # Freeze account
PATCH  /api/user/restore/:userId?               # Restore account
DELETE /api/user/delete/:userId?                # Soft delete account
PATCH  /api/user/upload-photo                   # Upload profile photo
PATCH  /api/user/upload-cover                   # Upload cover images
```

### Messages

```
POST   /api/message/send/:userId                # Send anonymous message
GET    /api/message/received                    # Get received messages
DELETE /api/message/:messageId                  # Delete message
```

## 🧪 Testing

Use tools like Postman, Thunder Client, or curl:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"password123",
    "confirmPassword":"password123",
    "age":25,
    "gender":"male",
    "phone":"1234567890"
  }'
```

## 🐛 Troubleshooting

### Port already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### MongoDB not running
```bash
sudo systemctl start mongod
```

### Check MongoDB status
```bash
sudo systemctl status mongod
```

## 📦 Dependencies

- bcrypt (^6.0.0) - Password hashing
- cloudinary (^2.8.0) - Image hosting
- cors (^2.8.5) - CORS handling
- dotenv (^17.2.3) - Environment variables
- express (^5.1.0) - Web framework
- express-rate-limit (^8.2.1) - Rate limiting
- google-auth-library (^10.4.2) - Google OAuth
- helmet (^8.1.0) - Security headers
- joi (^18.0.1) - Validation
- jsonwebtoken (^9.0.2) - JWT tokens
- mongoose (^8.19.2) - MongoDB ODM
- morgan (^1.10.1) - HTTP logging
- multer (^2.0.2) - File uploads
- nanoid (^5.1.6) - ID generation
- nodemailer (^7.0.9) - Email sending
- nodemon (^3.1.10) - Development auto-reload

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use `src/Config/.env.prod` for production
3. Update MongoDB connection string
4. Secure all secrets and API keys

### Recommended Platforms
- Heroku
- AWS (EC2, Elastic Beanstalk)
- DigitalOcean
- Railway
- Render

## 📄 License

ISC

## 👤 Author

Mohamed Abdelkreem
- GitHub: [@Mohamd-Abdelkreem](https://github.com/Mohamd-Abdelkreem)

---

Made with ❤️ using Node.js and Express.js
