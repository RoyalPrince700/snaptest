const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabaseStorage() {
  console.log('🚀 Setting up Supabase Storage for document extraction...\n');

  try {
    // 1. Create storage bucket
    console.log('📦 Creating storage bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('documents', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      fileSizeLimit: 52428800 // 50MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Storage bucket created successfully');
    }

    // 2. Create storage policies
    console.log('\n🔒 Creating storage policies...');
    
    const policies = [
      {
        name: 'Users can upload files to their own folder',
        definition: `
          CREATE POLICY "Users can upload files to their own folder" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'documents' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: 'Users can view their own files',
        definition: `
          CREATE POLICY "Users can view their own files" ON storage.objects
          FOR SELECT USING (
            bucket_id = 'documents' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: 'Users can delete their own files',
        definition: `
          CREATE POLICY "Users can delete their own files" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'documents' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.definition });
        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`✅ Policy "${policy.name}" already exists`);
          } else {
            console.log(`⚠️  Could not create policy "${policy.name}": ${error.message}`);
          }
        } else {
          console.log(`✅ Policy "${policy.name}" created successfully`);
        }
      } catch (error) {
        console.log(`⚠️  Could not create policy "${policy.name}": ${error.message}`);
      }
    }

    console.log('\n🎉 Supabase Storage setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy the Edge Function: supabase functions deploy extract-text');
    console.log('2. Test file upload in your app');
    console.log('3. Check the Supabase dashboard to verify everything is working');

  } catch (error) {
    console.error('❌ Error setting up Supabase Storage:', error);
    process.exit(1);
  }
}

// Run the setup
setupSupabaseStorage(); 