<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kzJvWIAN1f6xELXyyQbpQyq5QTWJ4-D3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## ⚠️ Security Notice

**This is a demo application with known security limitations. Do NOT use in production without addressing these issues:**

- **API keys are exposed** in the client-side bundle (visible in browser dev tools)
- **Passwords are stored in plaintext** in localStorage (not hashed or encrypted)
- **No backend authentication** - all security is client-side only

See [SECURITY.md](SECURITY.md) for detailed security information and recommendations for production deployment.
