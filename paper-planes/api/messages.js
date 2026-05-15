// /api/messages.js
// Vercel Serverless Function
// Uses Vercel KV (Redis) for persistent storage — free tier available.
// Set up: https://vercel.com/docs/storage/vercel-kv

import { Redis } from '@upstash/redis';
   const kv = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL,
     token: process.env.UPSTASH_REDIS_REST_TOKEN,
   });

const MAX_NAME = 50;
const MAX_MESSAGE = 200;
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 5;     // max messages per window per IP

function sanitize(str, maxLen) {
  return String(str || '').trim().slice(0, maxLen);
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---- GET: list messages ----
  if (req.method === 'GET') {
    const page = Math.max(0, parseInt(req.query.page) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const start = page * limit;
    const end = start + limit - 1;

    try {
      // Messages stored as a sorted set, score = timestamp DESC
      const total = await kv.zcard('planes');
      const ids = await kv.zrange('planes', start, end, { rev: true });

      const messages = ids.length > 0
        ? await Promise.all(ids.map(id => kv.hgetall(`plane:${id}`)))
        : [];

      return res.status(200).json({
        messages: messages.filter(Boolean).map(m => ({
          id: m.id,
          name: m.name,
          message: m.message,
          createdAt: parseInt(m.createdAt),
        })),
        total: parseInt(total) || 0,
        page,
        limit,
      });
    } catch (err) {
      console.error('GET error', err);
      return res.status(500).json({ error: 'Could not load messages' });
    }
  }

  // ---- POST: submit message ----
  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';

    // Rate limiting
    const ratKey = `rate:${ip}`;
    const count = await kv.incr(ratKey);
    if (count === 1) await kv.expire(ratKey, RATE_LIMIT_WINDOW);
    if (count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Too many messages — take a breath and try again soon ✈' });
    }

    const { name: rawName, message: rawMsg } = req.body || {};
    const name = sanitize(rawName, MAX_NAME) || 'Anonymous';
    const message = sanitize(rawMsg, MAX_MESSAGE);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = Date.now();

    try {
      await kv.hset(`plane:${id}`, { id, name, message, createdAt: String(createdAt) });
      await kv.zadd('planes', { score: createdAt, member: id });

      return res.status(201).json({ id, name, message, createdAt });
    } catch (err) {
      console.error('POST error', err);
      return res.status(500).json({ error: 'Could not save message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
