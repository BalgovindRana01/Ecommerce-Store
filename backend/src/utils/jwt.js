// Simple JWT implementation for Cloudflare Workers
// import { base64url, utf8 } from 'itty-router';

function base64urlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

function utf8Encode(str) {
  return new TextEncoder().encode(str);
}

function utf8Decode(bytes) {
  return new TextDecoder().decode(bytes);
}

export async function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(data, secret);

  return `${data}.${signature}`;
}

export async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = await sign(data, secret);
  if (signature !== expectedSignature) throw new Error('Invalid signature');

  const payload = JSON.parse(utf8Decode(base64urlDecode(encodedPayload)));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');

  return payload;
}

async function sign(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    utf8Encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, utf8Encode(data));
  return base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));
}