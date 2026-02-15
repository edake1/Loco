# Loco - Sound Like a Local 🌍

Transform your messages to sound native, warm, and authentic.

## Quick Start

```bash
# Install dependencies
bun install

# Configure OpenAI API Key
# Create a .env.local file and add:
# OPENAI_API_KEY=your_openai_api_key_here
# Get your key from: https://platform.openai.com/api-keys

# Run the dev server
bun run dev
```

Open http://localhost:3000 to see the app.

## Features

- **12 Languages** — Chinese, Spanish, Japanese, Korean, French, Portuguese, German, Italian, Arabic, Hindi, Thai, Vietnamese
- **5 Contexts** — Friend, Dating, Family, Professional, Traveler
- **5 Vibes** — Casual, Warm, Funny, Flirty, Slangy
- **Send Mode** — Transform your message to sound native
- **Receive Mode** — Understand what they really mean
- **History** — Auto-saved translations
- **Bookmarks** — Save your favorites

## Tech Stack

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- OpenAI API (gpt-4o-mini)

## Project Structure

```
src/
├── app/
│   ├── api/translate/route.ts  # AI translation API
│   ├── page.tsx                # Main app
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Warm coral theme
├── components/ui/              # UI components
├── hooks/                      # React hooks
└── lib/                        # Utilities
```

Made with 🧡 by Loco
