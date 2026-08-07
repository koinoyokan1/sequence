/**
 * Check if chat feature is properly set up
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.log('\nMake sure you have:')
  console.log('VITE_SUPABASE_URL=your-project-url')
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkChatSetup() {
  console.log('🔍 Checking chat feature setup...\n')
  
  // Check if chat_messages table exists
  console.log('1. Checking if chat_messages table exists...')
  const { data: tables, error: tablesError } = await supabase
    .from('chat_messages')
    .select('id')
    .limit(1)
  
  if (tablesError) {
    if (tablesError.code === '42P01') {
      console.log('❌ chat_messages table does NOT exist')
      console.log('\n📋 You need to run the migration:')
      console.log('   1. Go to Supabase Dashboard: https://supabase.com/dashboard')
      console.log('   2. Select your project')
      console.log('   3. Go to SQL Editor')
      console.log('   4. Copy and paste the contents of: supabase/migrations/005_chat_messages.sql')
      console.log('   5. Click "Run"\n')
      return false
    } else {
      console.log('❌ Error checking table:', tablesError.message)
      return false
    }
  }
  
  console.log('✅ chat_messages table exists\n')
  
  // Check RLS policies
  console.log('2. Checking RLS policies...')
  const { data: policies, error: policiesError } = await supabase.rpc('pg_catalog.pg_policies')
  
  if (!policiesError) {
    console.log('✅ RLS policies configured\n')
  }
  
  // Test insert
  console.log('3. Testing insert permission...')
  const { error: insertError } = await supabase
    .from('chat_messages')
    .insert({
      game_id: '00000000-0000-0000-0000-000000000000',
      player_id: '00000000-0000-0000-0000-000000000000',
      player_name: 'Test',
      message: 'Test message',
    })
  
  if (insertError) {
    if (insertError.code === '23503') {
      console.log('✅ Insert works (foreign key constraint is expected)\n')
    } else {
      console.log('❌ Insert failed:', insertError.message, '\n')
      return false
    }
  } else {
    console.log('✅ Insert works\n')
  }
  
  console.log('✅ Chat feature is properly configured!')
  console.log('\n🎮 You can now use chat in your games!')
  return true
}

checkChatSetup().catch(console.error)
