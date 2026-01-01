# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install     # Install dependencies
npm run dev     # Start dev server on http://localhost:3000
npm run build   # Production build
npm run preview # Preview production build
```

## Environment Setup

Set `GEMINI_API_KEY` in `.env.local` for the Gemini AI-powered DJ feature in the music player.

### ⚠️ SECURITY WARNING

**This is a demo application with known security limitations:**

1. **API Key Exposure**: The `GEMINI_API_KEY` is bundled into the client-side JavaScript and exposed in the browser. Anyone can extract it from the network requests or source code. **Never use production API keys** or keys with billing enabled in this application.

2. **Plaintext Password Storage**: Wish passwords are stored in plaintext in browser localStorage without encryption or hashing. This is **NOT suitable for production use**. Passwords can be easily extracted via:
   - Browser DevTools (Application → Local Storage)
   - XSS attacks
   - Physical access to the device

3. **Client-Side Security**: All authentication and data validation happens client-side, which can be bypassed by anyone with basic developer tools knowledge.

**For production use, you would need:**
- Backend server to securely store API keys
- Proper password hashing (bcrypt, Argon2)
- Server-side authentication and authorization
- HTTPS-only cookie-based sessions
- Rate limiting and CSRF protection

## Architecture Overview

This is a React 19 + TypeScript + Vite app called "MM Python Tree" — an interactive wish tree where users click to hang wish cards. Data persists in browser localStorage.

### Core Data Flow

- **App.tsx**: Root component managing all state (`wishes`, `decorations`, `isMusicPlayerOpen`). Handles CRUD operations for wishes with `sanitizeWish()` helper that strictly reconstructs objects to prevent reference pollution.
- **localStorage keys**: `mm-wishes` (wish data), `mm-tree-img-settings` (image rotation/fit preferences)

### Component Structure

- **WishTree**: Main canvas displaying `image.png` with click-to-add-wish functionality. Calculates click position as percentage coordinates. Contains decorations overlay (lights, gifts) and hidden speaker trigger for music player.
- **WishCard**: Individual wish positioned absolutely via percentage-based `x`/`y`. Includes password-protected edit/delete with inline password prompt.
- **WishModal**: Form for creating/editing wishes with color picker from predefined pastel palette.
- **Controls**: Fixed overlay toggles for lights/gifts decorations.
- **MusicPlayer**: Hidden feature accessed via speaker icon in bottom-left of tree. Uses Gemini AI to generate DJ responses for song requests.

### Key Types (types.ts)

```typescript
Wish { id, x, y, message, author, password?, color, createdAt }
DecorationType { LIGHTS, GIFTS }
```

### Services

**geminiService.ts**: Wraps `@google/genai` client. `requestSongFromDJ()` sends song name to Gemini for a fun DJ intro message. Note: actual song playback doesn't change (frontend demo limitation).

### Styling

Uses Tailwind CSS utility classes. Custom animations include `animate-twinkle` for lights. Font class `font-christmas` used for festive text styling.
