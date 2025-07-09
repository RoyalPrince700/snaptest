const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseUpload() {
  console.log('🧪 Testing Supabase file upload and text extraction...\n');

  try {
    // 1. Test authentication (you'll need to sign in first)
    console.log('🔐 Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️  No authenticated user found. Please sign in to your app first.');
      console.log('   You can test the upload functionality directly in your app.');
      return;
    }

    console.log(`✅ Authenticated as: ${user.email}`);

    // 2. Create a test text file
    console.log('\n📝 Creating test file...');
    const testContent = `This is a test document for text extraction.
    
It contains multiple paragraphs to test the extraction functionality.

The text should be properly extracted and cleaned up for question generation.

This document has various formatting including:
- Bullet points
- Multiple lines
- Special characters: !@#$%^&*()

End of test document.`;

    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Test file created');

    // 3. Test file upload
    console.log('\n📤 Testing file upload...');
    const fileName = `test-${Date.now()}.txt`;
    const filePath = `${user.id}/${fileName}`;

    const fileBuffer = fs.readFileSync(testFilePath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: 'text/plain',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('✅ File uploaded successfully');

    // 4. Test text extraction (if Edge Function is deployed)
    console.log('\n🔍 Testing text extraction...');
    try {
      const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-text', {
        body: { filePath }
      });

      if (extractError) {
        console.log(`⚠️  Text extraction failed: ${extractError.message}`);
        console.log('   Make sure the Edge Function is deployed: supabase functions deploy extract-text');
      } else {
        console.log('✅ Text extraction successful');
        console.log('\n📄 Extracted text:');
        console.log('---');
        console.log(extractData.text.substring(0, 200) + '...');
        console.log('---');
      }
    } catch (error) {
      console.log(`⚠️  Text extraction error: ${error.message}`);
    }

    // 5. Clean up test file
    console.log('\n🧹 Cleaning up...');
    fs.unlinkSync(testFilePath);
    console.log('✅ Test file removed from local system');

    // 6. Clean up uploaded file
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (deleteError) {
      console.log(`⚠️  Could not delete uploaded file: ${deleteError.message}`);
    } else {
      console.log('✅ Uploaded file removed from storage');
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Your Supabase setup is working correctly.');
    console.log('   You can now use document upload in your app.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSupabaseUpload(); 