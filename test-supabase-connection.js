require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('Supabase URL:', url);
console.log('Anon Key:', anon ? 'Loaded' : 'Missing');

if (!url || !anon) {
  console.error('❌ Supabase URL or Anon Key missing from .env');
  process.exit(1);
}

const supabase = createClient(url, anon);

async function runTest() {
  try {
    const { data, error } = await supabase.from('question_sets').select('*').limit(1);
    if (error) {
      console.error('❌ Error querying question_sets:', error.message);
    } else {
      console.log('✅ question_sets query succeeded:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

runTest(); 