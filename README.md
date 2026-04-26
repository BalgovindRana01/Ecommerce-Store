# BuyinHome - Khadrido Ecommerce Store

A complete production-ready React + TypeScript ecommerce frontend for the local Indian store "BuyinHome - Khadrido".

## Features

- **Store Details**: BuyinHome - Khadrido with tagline "Everything on this platform for you"
- **Categories**: Grocery, Dairy, Snacks, Beverages, Household, Lifestyles
- **Delivery**: ₹20 flat for delivery, free for self-pickup
- **Products**: 20 sample products with emoji placeholders
- **Dark Theme**: Glassmorphism cards with purple accent (#7C6FE9) and green success (#34D399)
- **Responsive**: Mobile-first design (2-col grid on mobile, 3-4 on desktop)
- **i18n**: Hindi/English toggle with custom translations
- **State Management**: Zustand for cart with localStorage persistence
- **Routing**: Lazy-loaded routes with React Router v6
- **Confetti**: Animation on successful payment

## Pages

1. **Product Catalog (Home)**: Grid with category filters, search, add-to-cart with quantity stepper, floating cart button
2. **Product Detail**: Full info + related products from same category
3. **Checkout**: Order summary, delivery vs pickup toggle, customer form, live total calculation
4. **OTP Verification**: 6-digit input with auto-focus, resend with cooldown
5. **Order Tracking**: Visual status timeline (Verified → Accepted → Paid → Shipped → Delivered), payment button when accepted

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router DOM
- Canvas Confetti
- Lucide React

## API Endpoints

- `GET /api/catalog` - Product list
- `GET /api/catalog/:id` - Single product + related
- `POST /api/order` - Place order
- `POST /api/order/verify` - Verify OTP
- `POST /api/order/resend-otp` - Resend OTP
- `GET /api/track/:order_ref` - Order status

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set API URL in `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── store/              # Zustand stores
├── types/              # TypeScript interfaces
├── utils/              # Utilities and API functions
├── data/               # Sample data
└── App.tsx             # Main app component
```

## Features Implemented

- ✅ Complete product catalog with filtering and search
- ✅ Product detail pages with related products
- ✅ Shopping cart with persistence
- ✅ Checkout process with form validation
- ✅ OTP verification flow
- ✅ Order tracking with visual timeline
- ✅ Dark theme with glassmorphism
- ✅ Mobile-responsive design
- ✅ Hindi/English language toggle
- ✅ Lazy loading for performance
- ✅ Confetti animation on payment success
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
