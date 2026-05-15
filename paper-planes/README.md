# ✈ Paper Planes

> Fold your words & let them fly to someone who needs them.

A dreamy, poetic message board where anyone can write an encouraging note, "throw" it as a paper plane, and let it drift to others. Built for Vercel — deploys in under 2 minutes.

---

## ✨ Features

- Write a short encouraging note & animate it into the sky
- Shared message board — everyone sees everyone's planes
- Soft pastel sky aesthetic with handwritten font
- Animated floating paper planes
- Rate limiting (5 messages/minute per IP)
- Auto-refreshes every 30 seconds

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "paper planes ✈"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USER/paper-planes.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Click **Deploy** (no build settings needed)

### 3. Add a Database (Vercel KV)

Messages are stored in **Vercel KV** (Redis), which has a generous free tier.

1. In your Vercel project dashboard → **Storage** tab
2. Click **Create Database** → choose **KV**
3. Name it `paper-planes-kv` → Create
4. Go to **Settings** of the KV store → **Connect to Project** → select your project
5. Vercel automatically adds the `KV_URL`, `KV_REST_API_URL`, and `KV_REST_API_TOKEN` environment variables

**That's it — redeploy and your app is live!**

---

## 📁 Project Structure

```
paper-planes/
├── public/
│   └── index.html        # The whole frontend (one file)
├── api/
│   └── messages.js       # Serverless API (GET + POST messages)
├── vercel.json           # Routing config
├── package.json
└── README.md
```

---

## 🛠 Local Development

```bash
npm install -g vercel
npm install
vercel dev
```

You'll need to link the KV store locally too:
```bash
vercel link
vercel env pull .env.local
```

---

## ⚙️ Customization

| What | Where |
|------|-------|
| Max message length | `MAX_MESSAGE` in `api/messages.js` |
| Rate limit | `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` in `api/messages.js` |
| Color palette | `CARD_COLORS` array in `public/index.html` |
| Sky gradient | CSS `:root` variables in `public/index.html` |
| Auto-refresh interval | `setInterval` at bottom of `public/index.html` |

---

## 💜 Stack

- **Frontend**: Vanilla HTML/CSS/JS — zero build step
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Vercel KV (Redis)
- **Fonts**: Caveat + Lora (Google Fonts)
- **Deployment**: Vercel (free tier works perfectly)
