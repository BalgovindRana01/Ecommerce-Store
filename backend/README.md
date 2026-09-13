# BuyinHome - Indian Ecommerce Store

A complete ecommerce solution built with Cloudflare Workers, D1 Database, and KV storage for the backend, and vanilla JavaScript for the frontend.

## Features

### Backend (Cloudflare Workers)
- **Authentication**: JWT-based user registration and login
- **Product Management**: CRUD operations for products and categories
- **Order Processing**: Complete order lifecycle management
- **Rate Limiting**: KV-based API rate limiting
- **AI Fraud Detection**: Automated order fraud analysis with Claude AI or Workers AI
- **AI Stock Analysis**: Automated inventory management and purchase order generation
- **Database**: D1 SQLite database for data persistence
- **Security**: CORS, input validation, and secure headers
- **Email Notifications**: Order confirmations and admin alerts via Resend

### Frontend (Vanilla JavaScript)
- The backend is API-only in this repository.
- The React frontend is available in the parent project folder.
- Product browsing, cart, checkout, and order tracking are handled by the frontend app.

### AI Features
- **Fraud Detection Agent**: Analyzes orders for suspicious patterns, flags high-risk orders
- **Stock Analysis Agent**: Generates daily business summaries, low-stock alerts, and auto-creates purchase orders
- **Automated Cron Jobs**: Daily stock analysis at 11:30 PM IST
- **Multi-language Support**: AI responses in Hindi/Hinglish
- **Dual AI Providers**: Claude API (premium) or Cloudflare Workers AI (free)

## Project Structure

```
store1/
├── src/
│   ├── index.js          # Main router and request handler
│   ├── routes/
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── products.js   # Product management
│   │   └── orders.js     # Order processing
│   ├── middleware/
│   │   ├── auth.js       # JWT authentication middleware
│   │   └── rateLimit.js  # Rate limiting middleware
│   └── utils/
│       └── jwt.js        # JWT token utilities
├── frontend/
│   ├── index.html        # Main HTML page
│   ├── styles.css        # CSS styling
│   └── app.js            # Frontend JavaScript
├── wrangler.toml         # Cloudflare Workers configuration
├── schema.sql            # Database schema
├── seed.sql              # Sample data
└── README.md             # This file
```

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- Cloudflare account with Workers enabled
- Wrangler CLI installed (`npm install -g wrangler`)

### Backend Setup

1. **Clone and navigate to the project**:
   ```bash
   cd store/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Cloudflare**:
   - Update `wrangler.toml` with your account details
   - Create D1 database and KV namespace
   - Update the database and KV IDs in `wrangler.toml`

4. **Initialize database**:
   ```bash
   wrangler d1 execute ecommerce-db --file=schema.sql
   wrangler d1 execute ecommerce-db --file=seed.sql
   ```

5. **Run migration for AI features**:
   ```bash
   wrangler d1 execute ecommerce-db --file=migration.sql
   ```

6. **Deploy to Cloudflare**:
   ```bash
   wrangler deploy
   ```

### Frontend Setup

The frontend is a static HTML/CSS/JS application that can be served from any web server or even opened directly in a browser.

1. **Open the frontend**:
   - Open `frontend/index.html` in your browser
   - Or serve it with any static server

2. **Update API endpoint** (if needed):
   - Edit the `API_BASE` constant in `frontend/app.js`
   - Point it to your deployed Workers URL

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products/categories` - Get all categories
- `GET /products/category/:categoryId` - Get products by category

### Orders
- `POST /orders` - Create new order (requires auth)
- `GET /orders` - Get user's orders (requires auth)

### Admin (AI-Powered Features)
- `POST /admin/stock-analysis` - Run AI stock analysis manually
- `GET /admin/daily-summaries` - Get daily business summaries
- `GET /admin/purchase-orders` - Get AI-generated purchase orders
- `POST /admin/purchase-orders/:id/status` - Update PO status
- `GET /admin/flagged-orders` - Get orders flagged for fraud review
- `POST /admin/orders/:id/review` - Approve/reject flagged orders

## Usage

### For Customers
1. **Browse Products**: View products by category or all products
2. **Register/Login**: Create account or login to existing account
3. **Add to Cart**: Click "Add to Cart" on any product
4. **Checkout**: Review cart and place order with shipping address
5. **View Orders**: Check order history and status

### For Developers
- **Local Development**: Use `wrangler dev` to run locally
- **Testing**: Use the provided test data or add your own
- **Customization**: Modify frontend styles and functionality as needed

## Security Features

- JWT token-based authentication
- Password hashing with PBKDF2
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Secure headers

## AI Agents

### Fraud Detection Agent
- **Trigger**: Automatically runs after every order placement
- **Purpose**: Analyzes orders for fraudulent patterns
- **Checks**: Duplicate orders, quantity limits, suspicious amounts, delivery notes
- **Actions**: Flags suspicious orders, sends admin alerts, updates order status
- **Fallback**: Defaults to approved if AI fails (never blocks legitimate orders)

### Stock Analysis Agent
- **Trigger**: Manual (admin button) or automatic (daily cron at 11:30 PM IST)
- **Purpose**: Business intelligence and inventory management
- **Features**:
  - Daily sales summaries in Hindi
  - Low stock alerts with urgency levels
  - Auto-generated purchase orders grouped by supplier
  - Business insights and trend analysis
- **Output**: Saves to `daily_summaries` table, creates draft POs, sends email alerts

### Cron Jobs
- **Daily Stock Analysis**: Runs at 17:30 UTC (11:30 PM IST) via Cloudflare Cron Triggers
- **Email Alerts**: Sends critical stock alerts to admin
- **Logging**: Tracks last run timestamp in KV storage

## AI Providers

### Option 1: Anthropic Claude (Recommended)
- **Model**: claude-3-sonnet-20240229
- **Cost**: Paid API calls
- **Setup**: Add `ANTHROPIC_API_KEY` to wrangler.toml vars
- **Features**: Higher accuracy, better Hindi language support

### Option 2: Cloudflare Workers AI (Free)
- **Model**: @cf/meta/llama-3.1-8b-instruct
- **Cost**: Free (within Workers limits)
- **Setup**: Add `[[ai]]` binding to wrangler.toml
- **Features**: Zero-cost alternative, good performance

## Database Schema

### Users Table
- id, name, email, password_hash, address, phone, created_at

### Products Table
- id, name, description, price, category_id, stock, image_url, created_at

### Categories Table
- id, name, description

### Orders Table
- id, user_id, total_amount, status, shipping_address, fraud_decision, fraud_reasoning, fraud_flags, created_at

### Order_Items Table
- id, order_id, product_id, quantity, price

### Purchase_Orders Table (AI-Generated)
- id, supplier_name, supplier_email, supplier_phone, items (JSON), total_items, status, created_at, processed_at

### Daily_Summaries Table (AI-Generated)
- id, date, total_orders, total_revenue, top_products (JSON), low_stock_alerts (JSON), business_summary, insights, created_at

## Environment Variables

- `JWT_SECRET` - Secret for JWT signing
- `EMAIL_FROM` - From email address for notifications
- `ANTHROPIC_API_KEY` - API key for Claude AI (optional)
- `RESEND_API_KEY` - API key for Resend email service

## Deployment

The application is deployed on Cloudflare Workers with:
- **Domain**: https://store1.buyinhome.workers.dev
- **Database**: Cloudflare D1
- **Storage**: Cloudflare KV
- **CDN**: Cloudflare's global network

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.