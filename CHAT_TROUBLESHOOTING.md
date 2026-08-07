# Chat Feature Troubleshooting Guide

## ❌ Messages Not Sending?

### Most Common Issue: Database Migration Not Applied

The chat feature requires a new database table that needs to be created in your Supabase database.

## ✅ Solution: Apply the Migration

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your Sequence project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration SQL
1. Click **"New Query"**
2. Copy the entire contents of `supabase/migrations/005_chat_messages.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** or press `Cmd/Ctrl + Enter`

### Step 3: Verify Success
You should see:
```
Success. No rows returned
```

This means the table was created successfully!

## 🔍 Detailed Migration Instructions

### The Migration SQL (copy this):

```sql
-- Chat messages table for in-game communication
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast game-based queries
CREATE INDEX idx_chat_messages_game_id ON chat_messages(game_id, created_at DESC);

-- RLS policies for chat messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view chat messages for a game
CREATE POLICY "Anyone can view chat messages"
  ON chat_messages FOR SELECT
  USING (true);

-- Anyone can insert chat messages
CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- No updates or deletes allowed (chat is append-only)
CREATE POLICY "No updates allowed"
  ON chat_messages FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed"
  ON chat_messages FOR DELETE
  USING (false);
```

## 🧪 Test the Setup

### Option 1: Check via SQL Editor
Run this query in Supabase SQL Editor:
```sql
SELECT * FROM chat_messages LIMIT 1;
```

**Success:** Returns empty table or rows (no error)
**Failure:** Error: `relation "chat_messages" does not exist`

### Option 2: Check via Script (requires Node.js)
```bash
npm install @supabase/supabase-js
npx tsx scripts/check-chat-setup.ts
```

## 🐛 Debugging Steps

### 1. Open Browser Console (F12)
When you try to send a message, check for errors:

**Common Errors:**

#### Error: "relation 'chat_messages' does not exist"
**Solution:** Run the migration (see above)

#### Error: "permission denied for table chat_messages"
**Solution:** 
1. Go to Supabase Dashboard → Authentication → Policies
2. Make sure RLS policies are created (run migration again)

#### Error: "Failed to send message"
**Solution:**
1. Check browser console for specific error
2. Verify Supabase credentials in `.env` file
3. Make sure you're connected to the internet

### 2. Check Network Tab
1. Press F12 → Network tab
2. Try sending a message
3. Look for request to `/rest/v1/chat_messages`
4. Click on it to see response

**Success:** Status 201 Created
**Failure:** Status 400/500 with error message

### 3. Verify Game is Playing
Chat only appears when `game.status === 'playing'`

**Check:**
1. Make sure you've started the game (not in lobby)
2. Look for chat button in bottom-right corner
3. Button should have chat icon (💬)

### 4. Check Console Logs
Look for these messages:
```
✅ Good: "Subscribed to chat:{gameId}"
❌ Bad: Any errors about WebSocket or subscriptions
```

## 🔧 Manual Verification

### Check Table Exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'chat_messages';
```
Should return 1 row.

### Check Policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'chat_messages';
```
Should return 4 policies.

### Test Insert:
```sql
INSERT INTO chat_messages (game_id, player_id, player_name, message)
VALUES (
  (SELECT id FROM games LIMIT 1),
  (SELECT id FROM players LIMIT 1),
  'Test User',
  'Test message'
);
```
Should succeed or give foreign key error (which is fine if no games exist).

## 📋 Checklist

Before reporting an issue, verify:

- [ ] Migration SQL has been run in Supabase
- [ ] `chat_messages` table exists
- [ ] RLS policies are enabled
- [ ] Game status is 'playing' (not 'waiting')
- [ ] Chat button appears in bottom-right
- [ ] Browser console shows no errors
- [ ] Internet connection is working
- [ ] Supabase project is not paused

## 🆘 Still Not Working?

### Get Detailed Error Info:

1. Open browser console (F12)
2. Go to Console tab
3. Try sending a message
4. Copy the full error message
5. Check the error against common issues above

### Common Solutions:

**"Cannot read property 'name' of undefined"**
- The current player object is not loaded
- Refresh the page
- Make sure you joined the game properly

**"Network error"**
- Check internet connection
- Verify Supabase project is active
- Check Supabase status page

**No error, but message doesn't appear**
- Check if migration was run
- Verify real-time subscription is working
- Check browser console for subscription errors

## 📞 Getting Help

If still stuck, provide:
1. Browser console errors (screenshot)
2. Network tab showing failed request
3. Confirmation that migration was run
4. Supabase project region (for debugging)

---

**Most issues are solved by running the migration!** 🎯
