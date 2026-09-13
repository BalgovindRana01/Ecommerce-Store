// Payment utility using Razorpay
const RAZORPAY_KEY_ID = 'your_razorpay_key_id_here'; // Will be overridden by env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = 'your_razorpay_key_secret_here'; // Will be overridden by env.RAZORPAY_KEY_SECRET

// Create Razorpay order
export async function createRazorpayOrder(env, amount, currency = 'INR', orderId) {
  const keyId = env.RAZORPAY_KEY_ID || RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET;

  // Demo mode - simulate payment order creation
  if (!keyId || keyId === 'your_razorpay_key_id_here') {
    console.log('DEMO: Creating Razorpay order for amount:', amount, currency);
    return {
      id: `demo_order_${Date.now()}`,
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      status: 'created',
      demo: true
    };
  }

  try {
    const auth = btoa(`${keyId}:${keySecret}`);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paisa
        currency,
        receipt: `order_${orderId}`,
        payment_capture: 1
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Razorpay API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('Razorpay order created:', result.id);
    return result;

  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    throw error;
  }
}

// Verify Razorpay payment
export async function verifyRazorpayPayment(env, paymentId, orderId, signature) {
  const keySecret = env.RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET;

  // Demo mode - simulate payment verification
  if (!keySecret || keySecret === 'your_razorpay_key_secret_here') {
    console.log('DEMO: Verifying payment', paymentId, 'for order', orderId);
    return { verified: true, demo: true };
  }

  try {
    const crypto = await import('crypto');

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verified = expectedSignature === signature;
    console.log('Payment verification:', verified ? 'SUCCESS' : 'FAILED');

    return { verified };

  } catch (error) {
    console.error('Payment verification failed:', error);
    return { verified: false, error: error.message };
  }
}

// Get Razorpay configuration for frontend
export function getRazorpayConfig(env) {
  const keyId = env.RAZORPAY_KEY_ID || RAZORPAY_KEY_ID;

  // Use test key in demo mode
  const demoKey = 'rzp_test_demo_key_that_works_locally';

  return {
    key: (!keyId || keyId === 'your_razorpay_key_id_here') ? demoKey : keyId,
    name: 'BuyinHome',
    description: 'Online Grocery Store',
    image: 'https://yourstore.com/logo.png',
    theme: {
      color: '#3399cc'
    }
  };
}