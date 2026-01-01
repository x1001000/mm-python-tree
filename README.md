<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kzJvWIAN1f6xELXyyQbpQyq5QTWJ4-D3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your API keys
   ```

3. Run the app (starts both frontend and backend):
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

**Note:** The app now includes a backend server that securely stores API keys. You can also run the frontend and backend separately:
- `npm run dev:frontend` - Vite dev server only
- `npm run dev:backend` - Express API server only

## ✅ Security Improvements

**This version includes a backend server that addresses critical security issues:**

- ✅ **API keys are secured** on the backend (not exposed to browser)
- ✅ **Rate limiting** prevents API abuse (30 requests/minute)
- ✅ **CORS protection** restricts API access to your frontend
- ✅ **Security headers** (HSTS, X-Frame-Options, etc.)

**Still demo-only limitations:**
- ⚠️ **Passwords stored in plaintext** in localStorage (not hashed or encrypted)
- ⚠️ **No user authentication** - all wishes are public

See [SECURITY.md](SECURITY.md) for detailed security information and production recommendations.
