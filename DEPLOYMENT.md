# Deployment Guide

This guide covers deploying the Sequence game to GitHub Pages (frontend) and Supabase (backend).

## Prerequisites

- GitHub account
- Supabase account
- Git installed locally
- Node.js 18+ installed

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `sequence-game`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"
6. Wait for project to be ready (~2 minutes)

### 2. Run Database Migrations

1. Go to your project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click "Run"
6. Repeat for `002_rls_policies.sql`
7. Repeat for `003_functions.sql`

### 3. Enable Realtime

1. Go to "Database" > "Replication"
2. Find the following tables and enable replication:
   - `games`
   - `players`
   - `game_moves`
   - `presence`
3. Click the toggle to enable for each table

### 4. Configure Authentication

1. Go to "Authentication" > "Providers"
2. Ensure "Anonymous sign-ins" is enabled
3. Save changes

### 5. Get API Credentials

1. Go to "Settings" > "API"
2. Copy the following values:
   - Project URL
   - Anon (public) key
3. Save these for the next step

## GitHub Pages Deployment

### 1. Prepare Repository

1. Create a new repository on GitHub
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - Name: `VITE_SUPABASE_URL`
     Value: (your Supabase project URL)
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: (your Supabase anon key)

### 3. Enable GitHub Pages

1. Go to "Settings" > "Pages"
2. Under "Build and deployment":
   - Source: Select "GitHub Actions"
3. Save

### 4. Update Base Path (if needed)

If your repo name is not "sequence", update `vite.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  base: '/your-repo-name/', // Change this
})
```

And update `src/App.tsx`:

```typescript
<BrowserRouter basename="/your-repo-name">
```

### 5. Deploy

1. Push to main branch:

```bash
git add .
git commit -m "Configure for deployment"
git push
```

2. Go to "Actions" tab on GitHub
3. Watch the deployment workflow run
4. Once complete, your site will be live at:
   `https://your-username.github.io/your-repo-name/`

## Environment Variables

### Development (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Production (GitHub Secrets)

Set these in GitHub repository settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Testing Deployment

### 1. Test Create Game

1. Go to your deployed URL
2. Click "Create Game"
3. Enter a name and team
4. Verify game is created and you see a code

### 2. Test Join Game

1. Open in incognito/another browser
2. Click "Join Game"
3. Enter the code from step 1
4. Verify you join the lobby

### 3. Test Gameplay

1. Both players click "Ready"
2. Host clicks "Start Game"
3. Verify board loads with cards
4. Take turns playing cards
5. Verify chips appear and turns advance

## Troubleshooting

### Issue: Build Fails in GitHub Actions

**Solution**: Check that secrets are set correctly
1. Go to Settings > Secrets and variables > Actions
2. Verify both secrets exist with correct values
3. Re-run the workflow

### Issue: "Missing Supabase environment variables"

**Solution**: Environment variables not set
- In development: Create `.env` file
- In production: Set GitHub secrets

### Issue: 404 on Deployed Site

**Solution**: Base path mismatch
1. Check `vite.config.ts` base path matches repo name
2. Check `App.tsx` basename matches repo name
3. Rebuild and deploy

### Issue: Database Connection Errors

**Solution**: Check Supabase setup
1. Verify migrations ran successfully
2. Check RLS policies are enabled
3. Verify API credentials are correct

### Issue: Realtime Not Working

**Solution**: Enable replication
1. Go to Database > Replication in Supabase
2. Enable for all game tables
3. Test again

### Issue: Anonymous Auth Not Working

**Solution**: Enable anonymous sign-ins
1. Go to Authentication > Providers
2. Enable "Anonymous sign-ins"
3. Save and test

## Custom Domain (Optional)

### 1. Add Custom Domain to GitHub Pages

1. Go to Settings > Pages
2. Enter your custom domain
3. Wait for DNS check

### 2. Configure DNS

Add these DNS records at your domain provider:

```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

Or for subdomain:

```
Type: CNAME
Name: www (or your subdomain)
Value: your-username.github.io
```

### 3. Update Configuration

1. Update `vite.config.ts`:
   ```typescript
   base: '/', // For custom domain
   ```
2. Update `App.tsx`:
   ```typescript
   <BrowserRouter basename="/">
   ```

## Performance Optimization

### Enable GZIP Compression

Already enabled by GitHub Pages automatically.

### Enable Caching

Set cache headers in `vite.config.ts`:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        supabase: ['@supabase/supabase-js'],
      },
    },
  },
},
```

## Monitoring

### Supabase Dashboard

- Monitor database queries
- Check real-time connections
- View error logs
- Monitor API usage

### GitHub Actions

- Check deployment status
- View build logs
- Monitor deployment time

## Scaling Considerations

### Database

- Supabase free tier: 500MB database, unlimited API requests
- Upgrade as needed for more players

### Bandwidth

- GitHub Pages: 100GB/month soft limit
- Use CDN for assets if needed

### Realtime Connections

- Supabase free tier: 200 concurrent connections
- Upgrade for more simultaneous games

## Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ API keys in environment variables (never in code)
- ✅ Anonymous auth enabled only
- ✅ Input validation on all forms
- ✅ Server-side move validation
- ✅ HTTPS enabled (automatic on GitHub Pages)

## Backup

### Database Backup

1. Go to Supabase dashboard
2. Settings > Database
3. Download backup
4. Store securely

### Code Backup

- Code is on GitHub (automatic backup)
- Tag releases: `git tag v1.0.0 && git push --tags`

## Updates

### Update Application

```bash
git add .
git commit -m "Update: description"
git push
```

GitHub Actions automatically deploys updates.

### Update Database Schema

1. Create new migration file
2. Run in Supabase SQL editor
3. Document changes
4. Test thoroughly before production

## Support

For issues:
1. Check this guide
2. Review error logs
3. Check Supabase status
4. Verify GitHub Actions logs
