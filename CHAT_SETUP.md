# Chat Feature - Quick Setup Guide

## 🚀 Messages Not Sending? You Need This!

The chat feature requires a database table that must be created in Supabase.

## ⚡ Quick Fix (5 minutes)

### 1️⃣ Open Supabase Dashboard
Go to: **https://supabase.com/dashboard**
- Select your Sequence project
- Click **"SQL Editor"** in sidebar

### 2️⃣ Copy the Migration SQL
Open this file: **`supabase/migrations/005_chat_messages.sql`**

Or copy directly from here:
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

### 3️⃣ Run the SQL
1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** (or press Cmd/Ctrl + Enter)
3. You should see: `Success. No rows returned`

### 4️⃣ Test It!
1. Start your local dev server: `npm run dev`
2. Create a game and start playing
3. Look for the chat button (💬) in bottom-right
4. Send a message - it should work now! 🎉

## ✅ Verification

To verify the table was created, run this in SQL Editor:
```sql
SELECT * FROM chat_messages;
```

Should show an empty table (no errors).

## 🐛 Still Not Working?

See the full troubleshooting guide: **`CHAT_TROUBLESHOOTING.md`**

Common issues:
- Migration not run → Run the SQL above
- Game not started → Start the game (not just lobby)
- Console errors → Check browser F12 console

## 📸 Visual Guide

**Before Migration:**
```
Try to send message → ❌ Error: relation "chat_messages" does not exist
```

**After Migration:**
```
Send message → ✅ Message appears instantly for all players!
```

---

**That's it!** Once you run the migration, chat will work perfectly. 💬
