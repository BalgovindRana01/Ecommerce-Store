// AI Agent 2: Stock Analysis
// Trigger: Admin button OR daily cron job
// Input: Today's orders, full stock list, previous day summary
// Output: Daily summary, low stock alerts, auto-generated POs, insights

import { sendTemplatedEmail } from '../utils/email.js';

const ANTHROPIC_API_KEY = 'your_anthropic_api_key_here'; // Will be overridden by env.ANTHROPIC_API_KEY

// Claude API implementation
async function callClaudeStockAnalysis(apiKey, todayOrders, stockList, previousSummary) {
  const prompt = `आप एक ई-कॉमर्स स्टॉक विश्लेषण एआई हैं। कृपया आज के व्यवसाय का विश्लेषण करें और स्टॉक संबंधी सिफारिशें दें। सभी उत्तर हिंदी में दें।

आज के ऑर्डर:
${JSON.stringify(todayOrders, null, 2)}

संपूर्ण उत्पाद स्टॉक सूची:
${JSON.stringify(stockList, null, 2)}

${previousSummary ? `पिछले दिन का सारांश:\n${previousSummary}` : 'पिछले दिन का डेटा उपलब्ध नहीं'}

कृपया निम्नलिखित प्रदान करें:
1. आज के व्यवसाय का दैनिक सारांश
2. कम स्टॉक अलर्ट (critical/high/medium urgency levels)
3. सप्लायर द्वारा समूहीकृत ऑटो-जनरेटेड पर्चेज ऑर्डर
4. व्यवसाय अंतर्दृष्टि और पैटर्न

उत्तर दें JSON format में:
{
  "daily_summary": "व्यापार सारांश हिंदी में",
  "low_stock_alerts": [
    {
      "product_id": 123,
      "product_name": "Product Name",
      "current_stock": 5,
      "min_stock": 10,
      "urgency": "critical",
      "supplier": "Supplier Name"
    }
  ],
  "purchase_orders": [
    {
      "supplier_name": "ABC Suppliers",
      "supplier_email": "abc@supplier.com",
      "supplier_phone": "+91-9876543210",
      "items": [
        {
          "product_id": 123,
          "product_name": "Product Name",
          "quantity": 50,
          "urgency": "critical"
        }
      ],
      "total_items": 50
    }
  ],
  "insights": "अतिरिक्त व्यवसाय अंतर्दृष्टि"
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
        max_tokens: 2000,
        temperature: 0.3,
        system: "आप एक ई-कॉमर्स स्टॉक विश्लेषण विशेषज्ञ हैं। सटीक डेटा विश्लेषण और व्यावहारिक सिफारिशें दें।",
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
      return getFallbackStockAnalysis(todayOrders, stockList);
    }
  } catch (error) {
    console.error('Claude API error:', error);
    return getFallbackStockAnalysis(todayOrders, stockList);
  }
}

// Cloudflare Workers AI implementation
async function callWorkersAIStockAnalysis(env, todayOrders, stockList, previousSummary) {
  const prompt = `आप एक ई-कॉमर्स स्टॉक विश्लेषण एआई हैं। कृपया आज के व्यवसाय का विश्लेषण करें और स्टॉक संबंधी सिफारिशें दें। सभी उत्तर हिंदी में दें।

आज के ऑर्डर:
${JSON.stringify(todayOrders, null, 2)}

संपूर्ण उत्पाद स्टॉक सूची:
${JSON.stringify(stockList, null, 2)}

${previousSummary ? `पिछले दिन का सारांश:\n${previousSummary}` : 'पिछले दिन का डेटा उपलब्ध नहीं'}

कृपया निम्नलिखित प्रदान करें:
1. आज के व्यवसाय का दैनिक सारांश
2. कम स्टॉक अलर्ट (critical/high/medium urgency levels)
3. सप्लायर द्वारा समूहीकृत ऑटो-जनरेटेड पर्चेज ऑर्डर
4. व्यवसाय अंतर्दृष्टि और पैटर्न

उत्तर दें JSON format में:
{
  "daily_summary": "व्यापार सारांश हिंदी में",
  "low_stock_alerts": [
    {
      "product_id": 123,
      "product_name": "Product Name",
      "current_stock": 5,
      "min_stock": 10,
      "urgency": "critical",
      "supplier": "Supplier Name"
    }
  ],
  "purchase_orders": [
    {
      "supplier_name": "ABC Suppliers",
      "supplier_email": "abc@supplier.com",
      "supplier_phone": "+91-9876543210",
      "items": [
        {
          "product_id": 123,
          "product_name": "Product Name",
          "quantity": 50,
          "urgency": "critical"
        }
      ],
      "total_items": 50
    }
  ],
  "insights": "अतिरिक्त व्यवसाय अंतर्दृष्टि"
}`;

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'आप एक ई-कॉमर्स स्टॉक विश्लेषण विशेषज्ञ हैं। सटीक डेटा विश्लेषण और व्यावहारिक सिफारिशें दें। उत्तर JSON format में दें।' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.response;

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Workers AI response:', content);
      return getFallbackStockAnalysis(todayOrders, stockList);
    }
  } catch (error) {
    console.error('Workers AI error:', error);
    return getFallbackStockAnalysis(todayOrders, stockList);
  }
}

// Fallback analysis when AI fails
function getFallbackStockAnalysis(todayOrders, stockList) {
  const lowStockAlerts = [];
  const purchaseOrders = [];

  // Simple rule-based analysis
  stockList.forEach(product => {
    if (product.stock <= (product.min_stock || 5)) {
      const urgency = product.stock === 0 ? 'critical' :
                     product.stock <= 2 ? 'high' : 'medium';

      lowStockAlerts.push({
        product_id: product.id,
        product_name: product.name,
        current_stock: product.stock,
        min_stock: product.min_stock || 5,
        urgency,
        supplier: product.supplier_name || 'Unknown Supplier'
      });
    }
  });

  // Group by supplier for purchase orders
  const supplierGroups = {};
  lowStockAlerts.forEach(alert => {
    if (!supplierGroups[alert.supplier]) {
      supplierGroups[alert.supplier] = {
        supplier_name: alert.supplier,
        items: [],
        total_items: 0
      };
    }

    const orderQuantity = Math.max(20, (alert.min_stock - alert.current_stock) * 2);
    supplierGroups[alert.supplier].items.push({
      product_id: alert.product_id,
      product_name: alert.product_name,
      quantity: orderQuantity,
      urgency: alert.urgency
    });
    supplierGroups[alert.supplier].total_items += orderQuantity;
  });

  Object.values(supplierGroups).forEach(group => {
    purchaseOrders.push(group);
  });

  const totalOrders = todayOrders.length;
  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);

  return {
    daily_summary: `आज ${totalOrders} ऑर्डर प्राप्त हुए और कुल राजस्व ₹${totalRevenue.toFixed(2)} था।`,
    low_stock_alerts: lowStockAlerts,
    purchase_orders: purchaseOrders,
    insights: 'AI विश्लेषण विफल, नियम-आधारित विश्लेषण का उपयोग किया गया।'
  };
}

// Main stock analysis function
export async function analyzeStockAndBusiness(env, isCronJob = false) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's orders
    const { results: todayOrders } = await env.DB.prepare(`
      SELECT o.id, o.total_amount, o.created_at,
             oi.product_id, oi.quantity, p.name as product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE DATE(o.created_at) = ?
    `).bind(today).all();

    // Get full product stock list with supplier info
    const { results: stockList } = await env.DB.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `).all();

    // Get previous day's summary
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const previousSummary = await env.DB.prepare(`
      SELECT business_summary FROM daily_summaries WHERE date = ?
    `).bind(yesterday).first();

    // Call AI for analysis
    let aiResult;

    if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
      // Use Claude API
      aiResult = await callClaudeStockAnalysis(env.ANTHROPIC_API_KEY, todayOrders, stockList, previousSummary?.business_summary);
    } else {
      // Use Workers AI (free alternative)
      aiResult = await callWorkersAIStockAnalysis(env, todayOrders, stockList, previousSummary?.business_summary);
    }

    // Save to daily_summaries table
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const topProducts = getTopProducts(todayOrders);

    await env.DB.prepare(`
      INSERT OR REPLACE INTO daily_summaries
      (date, total_orders, total_revenue, top_products, low_stock_alerts, business_summary, insights)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      today,
      totalOrders,
      totalRevenue,
      JSON.stringify(topProducts),
      JSON.stringify(aiResult.low_stock_alerts),
      aiResult.daily_summary,
      aiResult.insights
    ).run();

    // Create draft purchase orders
    for (const po of aiResult.purchase_orders) {
      await env.DB.prepare(`
        INSERT INTO purchase_orders (supplier_name, supplier_email, supplier_phone, items, total_items, status)
        VALUES (?, ?, ?, ?, ?, 'draft')
      `).bind(
        po.supplier_name,
        po.supplier_email || null,
        po.supplier_phone || null,
        JSON.stringify(po.items),
        po.total_items
      ).run();
    }

    // Send email notification for critical stock items
    const criticalItems = aiResult.low_stock_alerts.filter(alert => alert.urgency === 'critical');
    if (criticalItems.length > 0 && isCronJob) {
      await sendCriticalStockAlertEmail(env, criticalItems, aiResult.daily_summary);
    }

    // Log cron job execution
    if (isCronJob) {
      await env.KV.put('last_cron_run', new Date().toISOString());
    }

    return aiResult;

  } catch (error) {
    console.error('Stock analysis error:', error);
    throw error;
  }
}

// Helper function to get top products
function getTopProducts(orders) {
  const productCounts = {};

  orders.forEach(order => {
    if (order.product_id && order.quantity) {
      if (!productCounts[order.product_id]) {
        productCounts[order.product_id] = {
          name: order.product_name,
          total_quantity: 0
        };
      }
      productCounts[order.product_id].total_quantity += order.quantity;
    }
  });

  return Object.entries(productCounts)
    .sort(([,a], [,b]) => b.total_quantity - a.total_quantity)
    .slice(0, 5)
    .map(([id, data]) => ({ product_id: parseInt(id), ...data }));
}

// Send critical stock alert email
async function sendCriticalStockAlertEmail(env, criticalItems, dailySummary) {
  const subject = `🚨 क्रिटिकल स्टॉक अलर्ट - आज का व्यवसाय सारांश`;

  const templateData = {
    dailySummary,
    criticalItems,
    purchaseOrders: [] // This would be populated with actual POs if needed
  };

  try {
    await sendTemplatedEmail(env, {
      to: 'admin@yourstore.com', // Configure admin email
      subject,
      templateName: 'stockAlert',
      templateData
    });
  } catch (error) {
    console.error('Failed to send critical stock alert email:', error);
  }
}