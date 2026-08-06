# 🚀 Deployment Checklist

Your Sequence game is ready to deploy! Follow these steps in order.

## ✅ Step 1: Configure GitHub Secrets (2 minutes)

Your GitHub Actions workflow needs Supabase credentials to build the app.

1. **Open this link:** https://github.com/koinoyokan1/sequence/settings/secrets/actions

2. **Click "New repository secret"** and add **TWO** secrets:

   ### Secret #1: VITE_SUPABASE_URL
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://fccmiuryjimjcqrhclmy.supabase.co`

   ### Secret #2: VITE_SUPABASE_ANON_KEY
   - **Name:** `VITE_SUPABASE_ANON_KEY`  
   - **Value:** `sb_publishable_P5auUwMI75DT6kX6TSCUmw_c6oLmx7T`

3. **Verify:** You should see 2 secrets listed

---

## ✅ Step 2: Enable GitHub Pages (1 minute)

Tell GitHub to use Actions for deployment.

1. **Open this link:** https://github.com/koinoyokan1/sequence/settings/pages

2. **Under "Source":** Select **"GitHub Actions"** from the dropdown

3. **Click Save**

---

## ✅ Step 3: Check Deployment Status (3 minutes)

The deployment started automatically when you pushed the code.

1. **Open this link:** https://github.com/koinoyokan1/sequence/actions

2. **Look for:** "Deploy to GitHub Pages" workflow

3. **Status:**
   - 🟡 Yellow = Running
   - 🟢 Green = Success!
   - 🔴 Red = Failed (check the logs)

4. **Wait:** Usually takes 2-3 minutes

---

## ✅ Step 4: Update Database (1 minute)

Run the migration to set sequences_required = 3.

1. **Open this link:** https://supabase.com/dashboard/project/fccmiuryjimjcqrhclmy/sql/new

2. **Paste this SQL** (from `supabase/migrations/004_update_sequences_required.sql`):

   Copy-paste the entire contents of that file, or just run this:

   ```sql
   -- Update create_game function
   CREATE OR REPLACE FUNCTION create_game(player_name TEXT, team INTEGER)
   RETURNS TABLE (game_id UUID, invite_code TEXT, player_id UUID) AS $$
   DECLARE
     v_game_id UUID;
     v_player_id UUID;
     v_invite_code TEXT;
     v_board_state JSONB;
     v_user_id UUID;
   BEGIN
     v_user_id := auth.uid();
     LOOP
       v_invite_code := upper(substring(md5(random()::text) from 1 for 6));
       EXIT WHEN NOT EXISTS (SELECT 1 FROM games WHERE games.invite_code = v_invite_code);
     END LOOP;
     v_board_state := '[]'::jsonb;
     INSERT INTO games (invite_code, board_state, player_count, sequences_required)
     VALUES (v_invite_code, v_board_state, 0, 3)
     RETURNING id INTO v_game_id;
     INSERT INTO players (game_id, user_id, name, team, position, is_host, is_ready)
     VALUES (v_game_id, v_user_id, player_name, team, 0, true, false)
     RETURNING id INTO v_player_id;
     INSERT INTO player_hands (player_id, game_id, cards)
     VALUES (v_player_id, v_game_id, '[]'::jsonb);
     RETURN QUERY SELECT v_game_id, v_invite_code, v_player_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Update start_game function
   CREATE OR REPLACE FUNCTION start_game(p_game_id UUID, p_player_id UUID)
   RETURNS TABLE (success BOOLEAN) AS $$
   DECLARE
     v_is_host BOOLEAN;
     v_all_ready BOOLEAN;
     v_player_count INTEGER;
   BEGIN
     SELECT is_host INTO v_is_host FROM players WHERE id = p_player_id AND game_id = p_game_id;
     IF NOT v_is_host THEN RAISE EXCEPTION 'Only the host can start the game'; END IF;
     SELECT COUNT(*) = COUNT(*) FILTER (WHERE is_ready), COUNT(*)
     INTO v_all_ready, v_player_count FROM players WHERE game_id = p_game_id;
     IF NOT v_all_ready THEN RAISE EXCEPTION 'Not all players are ready'; END IF;
     UPDATE games SET status = 'playing', started_at = NOW(), sequences_required = 3 WHERE id = p_game_id;
     RETURN QUERY SELECT true;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

3. **Click "RUN"**

4. **Success message should appear**

---

## 🎉 Your App is Live!

**URL:** https://koinoyokan1.github.io/sequence/

**Test it:**
1. Create a new game
2. Open incognito window
3. Join the game
4. Play and verify:
   - Shows "0 / 3" sequences
   - Can discard dead cards
   - Board stays visible after win
   - Jack types are labeled (REMOVE/WILD)

---

## 📝 Future Deployments

Every time you push to `main`, GitHub Actions will automatically:
1. Build the app
2. Deploy to GitHub Pages
3. Update the live site

**No manual steps needed!** ✨
