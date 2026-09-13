// AI Agent 1: Order Fraud Detection
// Trigger: After successful OTP verification
// Input: New order details, last 24hrs orders from same email, stock levels
// Output: Decision (approved/flagged), reasoning in Hindi, flag reasons

import { sendTemplatedEmail } from '../utils/email.js';

const ANTHROPIC_API_KEY = 'your_anthropic_api_key_here'; // Will be overridden by env.ANTHROPIC_API_KEY

// Claude API implementation
async function callClaudeFraudDetection(apiKey, orderData, recentOrders, stockLevels) {
  const prompt = `आप एक ई-कॉमर्स धोखाधड़ी का पता लगाने वाला एआई हैं। कृपया इस नए ऑर्डर का विश्लेषण करें और धोखाधड़ी के संकेतों की जांच करें।

नया ऑर्डर विवरण:
${JSON.stringify(orderData, null, 2)}

पिछले 24 घंटों में इसी ईमेल से ऑर्डर:
${JSON.stringify(recentOrders, null, 2)}

उत्पाद स्टॉक स्तर:
${JSON.stringify(stockLevels, null, 2)}

कृपया निम्नलिखित की जांच करें:
1. पिछले 24 घंटों में इसी ईमेल से डुप्लिकेट ऑर्डर
2. उत्पाद की मात्रा सीमा से अधिक
3. असामान्य रूप से उच्च ऑर्डर मूल्य
4. संदिग्ध डिलीवरी नोट्स
5. एकल आइटम का थोक ऑर्डर

उत्तर दें JSON format में:
{
  "decision": "approved" या "flagged",
  "reasoning": "हिंदी में विस्तृत कारण",
  "flag_reasons": ["कारण 1", "कारण 2", ...]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.1,
        system: "आप एक ई-कॉमर्स धोखाधड़ी का पता लगाने वाला एआई हैं। हमेशा सटीक और निष्पक्ष निर्णय लें।",
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content);
      return { decision: 'approved', reasoning: 'AI प्रतिक्रिया पार्स नहीं हो सकी', flag_reasons: [] };
    }
  } catch (error) {
    console.error('Claude API error:', error);
    return { decision: 'approved', reasoning: 'AI सेवा उपलब्ध नहीं', flag_reasons: [] };
  }
}

// Cloudflare Workers AI implementation (zero-cost alternative)
async function callWorkersAIFraudDetection(env, orderData, recentOrders, stockLevels) {
  const prompt = `आप एक ई-कॉमर्स धोखाधड़ी का पता लगाने वाला एआई हैं। कृपया इस नए ऑर्डर का विश्लेषण करें और धोखाधड़ी के संकेतों की जांच करें। सभी उत्तर हिंदी में दें।

नया ऑर्डर विवरण:
${JSON.stringify(orderData, null, 2)}

पिछले 24 घंटों में इसी ईमेल से ऑर्डर:
${JSON.stringify(recentOrders, null, 2)}

उत्पाद स्टॉक स्तर:
${JSON.stringify(stockLevels, null, 2)}

कृपया निम्नलिखित की जांच करें:
1. पिछले 24 घंटों में इसी ईमेल से डुप्लिकेट ऑर्डर
2. उत्पाद की मात्रा सीमा से अधिक
3. असामान्य रूप से उच्च ऑर्डर मूल्य
4. संदिग्ध डिलीवरी नोट्स
5. एकल आइटम का थोक ऑर्डर

उत्तर दें JSON format में:
{
  "decision": "approved" या "flagged",
  "reasoning": "हिंदी में विस्तृत कारण",
  "flag_reasons": ["कारण 1", "कारण 2", ...]
}`;

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'आप एक ई-कॉमर्स धोखाधड़ी का पता लगाने वाला एआई हैं। हमेशा सटीक और निष्पक्ष निर्णय लें। उत्तर JSON format में दें।' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    const content = response.response;

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Workers AI response:', content);
      return { decision: 'approved', reasoning: 'AI प्रतिक्रिया पार्स नहीं हो सकी', flag_reasons: [] };
    }
  } catch (error) {
    console.error('Workers AI error:', error);
    return { decision: 'approved', reasoning: 'AI सेवा उपलब्ध नहीं', flag_reasons: [] };
  }
}

// Main fraud detection function
export async function detectOrderFraud(env, orderData, userEmail) {
  try {
    // Get last 24 hours orders from same email
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { results: recentOrders } = await env.DB.prepare(`
      SELECT o.id, o.total_amount, o.created_at, o.shipping_address,
             oi.product_id, oi.quantity, p.name as product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.created_at > ? AND o.user_id IN (
        SELECT id FROM users WHERE email = ?
      )
    `).bind(twentyFourHoursAgo, userEmail).all();

    // Get current stock levels for ordered items
    const productIds = orderData.items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const { results: stockLevels } = await env.DB.prepare(`
      SELECT id, name, stock, price FROM products WHERE id IN (${placeholders})
    `).bind(...productIds).all();

    // Call AI for fraud detection
    let aiResult;

    if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
      // Use Claude API
      aiResult = await callClaudeFraudDetection(env.ANTHROPIC_API_KEY, orderData, recentOrders, stockLevels);
    } else {
      // Use Workers AI (free alternative)
      aiResult = await callWorkersAIFraudDetection(env, orderData, recentOrders, stockLevels);
    }

    // If AI call fails, default to approved
    if (!aiResult || !aiResult.decision) {
      aiResult = {
        decision: 'approved',
        reasoning: 'AI विश्लेषण विफल, डिफॉल्ट रूप से स्वीकृत',
        flag_reasons: []
      };
    }

    // Send email notification for flagged orders
    if (aiResult.decision === 'flagged') {
      await sendFraudAlertEmail(env, orderData, aiResult);
    }

    return aiResult;

  } catch (error) {
    console.error('Fraud detection error:', error);
    // Default to approved on any error
    return {
      decision: 'approved',
      reasoning: 'तकनीकी त्रुटि के कारण डिफॉल्ट रूप से स्वीकृत',
      flag_reasons: []
    };
  }
}

// Send fraud alert email to admin
async function sendFraudAlertEmail(env, orderData, aiResult) {
  const subject = `🚨 धोखाधड़ी अलर्ट: ऑर्डर #${orderData.orderId} को फ्लैग किया गया`;

  const templateData = {
    orderId: orderData.orderId,
    customerEmail: orderData.customerEmail,
    total: orderData.total,
    orderDate: new Date().toLocaleString('hi-IN'),
    items: orderData.items,
    decision: aiResult.decision,
    reasoning: aiResult.reasoning,
    flagReasons: aiResult.flag_reasons,
    shippingAddress: orderData.shippingAddress
  };

  try {
    await sendTemplatedEmail(env, {
      to: 'admin@yourstore.com', // Configure admin email
      subject,
      templateName: 'fraudAlert',
      templateData
    });
  } catch (error) {
    console.error('Failed to send fraud alert email:', error);
  }
}