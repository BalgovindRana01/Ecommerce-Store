import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OTPVerification from './pages/OTPVerification';
import OrderTracking from './pages/OrderTracking';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
          <div className="pointer-events-none absolute inset-0"></div>
          <div className="relative z-10">
            <Header />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/otp/:orderRef" element={<OTPVerification />} />
                <Route path="/track/:orderRef" element={<OrderTracking />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/orders" element={<OrderHistory />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
