const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database setup...\n');

  try {
    // Check if question_sets table exists
    console.log('1. Checking if question_sets table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'question_sets');

    if (tableError) {
      console.error('❌ Error checking tables:', tableError);
    } else if (tables.length === 0) {
      console.log('❌ question_sets table does not exist!');
      console.log('💡 Run the SQL from SETUP.md to create the tables');
    } else {
      console.log('✅ question_sets table exists');
    }

    // Check if there are any question sets
    console.log('\n2. Checking for question sets...');
    const { data: questionSets, error: qsError } = await supabase
      .from('question_sets')
      .select('*')
      .limit(5);

    if (qsError) {
      console.error('❌ Error fetching question sets:', qsError);
    } else {
      console.log(`📊 Found ${questionSets.length} question sets:`);
      questionSets.forEach((set, index) => {
        console.log(`   ${index + 1}. ${set.title} (${set.question_type}) - User: ${set.user_id}`);
      });
    }

    // Check if user_profiles table exists
    console.log('\n3. Checking if user_profiles table exists...');
    const { data: userProfiles, error: upError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (upError) {
      console.error('❌ Error checking user_profiles:', upError);
    } else {
      console.log(`✅ user_profiles table exists with ${userProfiles.length} users`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabase(); 