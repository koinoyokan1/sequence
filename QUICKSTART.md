# Quick Start Guide

Get the Sequence game running in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier is fine)

## Step 1: Clone & Install (1 min)

```bash
git clone <your-repo-url>
cd sequence
npm install
```

## Step 2: Setup Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project initialization (~2 minutes)
3. Go to SQL Editor and run these migrations in order:
   - Copy/paste `supabase/migrations/001_initial_schema.sql` → Run
   - Copy/paste `supabase/migrations/002_rls_policies.sql` → Run
   - Copy/paste `supabase/migrations/003_functions.sql` → Run
4. Go to Settings > API and copy:
   - Project URL
   - Anon key

## Step 3: Configure Environment (30 sec)

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run! (10 sec)

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Test It Out

1. Click "Create Game"
2. Enter your name, choose a team
3. Copy the game code
4. Open in incognito/another browser
5. Click "Join Game", enter the code
6. Both players click "Ready"
7. Host clicks "Start Game"
8. Play!

## Next Steps

- Read [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment
- Check [TESTING.md](TESTING.md) for testing guide

## Troubleshooting

**Build errors?**
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Can't connect to Supabase?**
- Verify `.env` file exists and has correct values
- Check Supabase project is active
- Verify migrations ran successfully

**Game won't start?**
- Check browser console for errors
- Verify both players are in the lobby
- Ensure both players clicked "Ready"

**Need help?**
- Check the full [README.md](README.md)
- Review [DEPLOYMENT.md](DEPLOYMENT.md)
- Open an issue on GitHub
