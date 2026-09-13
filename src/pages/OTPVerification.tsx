import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useTranslation } from '../utils/useTranslation';
import OTPInput from '../components/OTPInput';
import { Lock, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const OTPVerification = () => {
  const { orderRef } = useParams<{ orderRef: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => console.error('Failed to load Razorpay script');
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  // Fetch order total to display on page
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderRef) return;
      try {
        const orderData = await api.trackOrder(orderRef);
        setOrderTotal(orderData.total);
      } catch (error) {
        console.error('Failed to fetch order total:', error);
      }
    };
    fetchOrderDetails();
  }, [orderRef]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const lastOtp = sessionStorage.getItem('lastOrderOtp');
    if (lastOtp) {
      setOtpHint(lastOtp);
    }
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      alert('Payment gateway is loading. Please wait and try again.');
      return;
    }

    try {
      setLoading(true);
      // Create payment order
      const paymentOrder = await api.createPaymentOrder(orderRef!);
      const config = await api.getPaymentConfig();

      // Handle demo mode
      if (paymentOrder.demo) {
        console.log('DEMO: Simulating payment success');
        await api.verifyPayment(
          orderRef!,
          `demo_order_${Date.now()}`,
          `demo_payment_${Date.now()}`,
          'demo_signature'
        );
        navigate(`/track/${orderRef}`);
        return;
      }

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: config.name,
        description: config.description,
        image: config.image,
        order_id: paymentOrder.orderId,
        prefill: {
          name: paymentOrder.customer.name,
          email: paymentOrder.customer.email,
        },
        theme: config.theme,
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
          paylater: true,
          emi: true
        },
        config: {
          display: {
            language: 'en',
            hide: [
              { method: 'paylater' },
              { method: 'emi' }
            ],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async (response: any) => {
          try {
            await api.verifyPayment(
              orderRef!,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            navigate(`/track/${orderRef}`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            // If they cancel payment, keep them here or redirect to tracking
            // Since order is verified, they can pay later from order tracking page if supported
            navigate(`/track/${orderRef}`);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment gateway. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      await api.verifyOtp(orderRef!, otp);
      
      // Fetch order details to know the selected payment method
      const orderData = await api.trackOrder(orderRef!);

      if (orderData.paymentMethod === 'cod') {
        // COD orders bypass payment gateway and go directly to tracking
        navigate(`/track/${orderRef}`);
      } else {
        // Online payments proceed immediately to launch Razorpay gateway
        await handlePayment();
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('Invalid OTP or verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await api.resendOtp(orderRef!);
      setCooldown(30);
      alert('A new 6-digit OTP code has been resent to your phone.');
    } catch (error) {
      console.error('Resend OTP failed:', error);
      setCooldown(30); // Simulate cooldown on error
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-[34px] p-8 shadow-2xl border border-white/10 max-w-md w-full relative overflow-hidden group">
        
        {/* Glow overlay */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-500 via-fuchsia-500 to-cyan-400 opacity-60" />

        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={12} />
          Back to Shopping
        </Link>

        {/* Verification UI */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-purple-400" size={24} />
          </div>
          
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            {t('verifyOtp')}
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Enter the 6-digit security code sent to your phone for Order <span className="font-bold text-gray-200">#{orderRef}</span>
          </p>

          {orderTotal !== null && (
            <div className="mt-3.5 inline-block bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-xs text-purple-300 font-bold">
              Total Payable: ₹{orderTotal}
            </div>
          )}

          {otpHint && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-xs text-green-300 font-medium leading-none">
              Demo OTP Hint: <span className="font-bold text-white tracking-wider">{otpHint}</span>
            </div>
          )}
        </div>

        {/* OTP Input Boxes */}
        <div className="my-6">
          <OTPInput value={otp} onChange={setOtp} />
        </div>

        {/* Verification CTAs */}
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6 || loading}
            className="w-full py-4 bg-linear-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-base transition-all shadow-[0_12px_36px_-10px_rgba(124,111,233,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Confirm & Proceed</span>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className="w-full py-3.5 bg-white/5 text-gray-300 rounded-2xl text-sm font-semibold hover:bg-white/10 hover:text-white transition-all border border-white/10 disabled:opacity-50"
          >
            {t('resendOtp')} {cooldown > 0 && `(${cooldown}s)`}
          </button>
        </div>

        {/* Trust information */}
        <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500">
          <ShieldCheck size={12} className="text-purple-500" />
          <span>Verified checkout powered by Razorpay Security</span>
        </div>

      </div>
    </div>
  );
};

export default OTPVerification;