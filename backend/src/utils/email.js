// Email utility using Resend
const RESEND_API_KEY = 'your_resend_api_key_here'; // Will be overridden by env.RESEND_API_KEY

export async function sendEmail(env, { to, subject, html, from }) {
  const apiKey = env.RESEND_API_KEY || RESEND_API_KEY;
  const fromEmail = from || env.EMAIL_FROM || 'noreply@yourstore.com';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);
    return result;

  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// SMS utility using Twilio
const TWILIO_ACCOUNT_SID = 'your_twilio_account_sid_here'; // Will be overridden by env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = 'your_twilio_auth_token_here'; // Will be overridden by env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = 'your_twilio_phone_number_here'; // Will be overridden by env.TWILIO_PHONE_NUMBER

export async function sendSMS(env, { to, message }) {
  const accountSid = env.TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN;
  const fromNumber = env.TWILIO_PHONE_NUMBER || TWILIO_PHONE_NUMBER;

  // Demo mode - log SMS instead of sending
  if (!accountSid || accountSid === 'your_twilio_account_sid_here') {
    console.log('🚨 DEMO MODE: SMS to', to, ':', message);

    // If this looks like an OTP message, extract and log the OTP clearly
    const otpMatch = message.match(/Your OTP for order ([A-Z0-9]+) is ([0-9]{6})/);
    if (otpMatch) {
      console.log('🔑 OTP CODE:', otpMatch[2], 'for order', otpMatch[1]);
    }

    return { success: true, demo: true };
  }

  try {
    const credentials = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: to,
        Body: message
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('SMS sent successfully:', result.sid);
    return result;

  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(env, orderId, userEmail, orderDetails) {
  const subject = `Order Confirmation - Order #${orderId}`;

  const htmlContent = `
    <h2>Thank you for your order!</h2>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>

    <h3>Order Items:</h3>
    <ul>
      ${orderDetails.items.map(item =>
        `<li>${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price}</li>`
      ).join('')}
    </ul>

    <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>

    <p>We will process your order shortly. You will receive updates on your order status.</p>

    <p>Thank you for shopping with BuyinHome!</p>
  `;

  return await sendEmail(env, {
    to: userEmail,
    subject,
    html: htmlContent
  });
}

// Send OTP via SMS
export async function sendOTPSMS(env, phoneNumber, otpCode, orderRef) {
  const message = `BuyinHome: Your OTP for order ${orderRef} is ${otpCode}. Valid for 10 minutes. Do not share this code.`;

  return await sendSMS(env, {
    to: phoneNumber,
    message
  });
}

// Send OTP via Email (fallback)
export async function sendOTPEmail(env, email, otpCode, orderRef) {
  const subject = `Your OTP for Order ${orderRef}`;
  const htmlContent = `
    <h2>Your Order Verification Code</h2>
    <p><strong>Order Reference:</strong> ${orderRef}</p>
    <p><strong>Your OTP:</strong> <span style="font-size: 24px; font-weight: bold; color: #007bff;">${otpCode}</span></p>
    <p>This code is valid for 10 minutes. Please enter it to verify your order.</p>
    <p>If you didn't place this order, please ignore this email.</p>
    <br>
    <p>Thank you for shopping with BuyinHome!</p>
  `;

  return await sendEmail(env, {
    to: email,
    subject,
    html: htmlContent
  });
}

// Simple template renderer
function renderTemplate(template, data) {
  let rendered = template;

  // Replace simple variables
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key]);
  });

  // Handle loops {{#each items}} ... {{/each}}
  const eachRegex = /{{#each (\w+)}}([\s\S]*?){{\/each}}/g;
  rendered = rendered.replace(eachRegex, (match, arrayName, content) => {
    const array = data[arrayName] || [];
    return array.map(item => {
      let itemContent = content;
      Object.keys(item).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        itemContent = itemContent.replace(regex, item[key]);
      });
      return itemContent;
    }).join('');
  });

  return rendered;
}

// Send templated email
export async function sendTemplatedEmail(env, { to, subject, templateName, templateData, from }) {
  try {
    // Read template file (in production, you'd cache these)
    const templatePath = `../templates/${templateName}.html`;
    const templateResponse = await fetch(new URL(templatePath, import.meta.url));
    const template = await templateResponse.text();

    const htmlContent = renderTemplate(template, templateData);

    return await sendEmail(env, {
      to,
      subject,
      html: htmlContent,
      from
    });
  } catch (error) {
    console.error('Failed to send templated email:', error);
    throw error;
  }
}