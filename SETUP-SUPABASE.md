# Supabase Setup Guide for Document Extraction

This guide will help you set up Supabase to handle document uploads and text extraction without relying on Vercel.

## 1. Supabase Storage Setup

### Create Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name it `documents`
5. Set it as **Private** (recommended for security)
6. Click **Create bucket**

### Storage Policies
Create the following RLS (Row Level Security) policies for the `documents` bucket:

```sql
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 2. Edge Function Setup

### Install Supabase CLI
If you haven't already, install the Supabase CLI:

```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy the Edge Function
```bash
supabase functions deploy extract-text
```

### Set Environment Variables
The Edge Function needs access to your Supabase project. These are automatically set when you deploy, but you can verify them in the Supabase dashboard under **Settings > API**.

## 3. Database Schema

Make sure you have the required database tables. Run this SQL in your Supabase SQL editor:

```sql
-- Question sets table
CREATE TABLE IF NOT EXISTS question_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('objective', 'theory')),
  source_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  score INTEGER,
  total_questions INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_sets
CREATE POLICY "Users can view their own question sets" ON question_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question sets" ON question_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question sets" ON question_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question sets" ON question_sets
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz sessions" ON quiz_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Testing the Setup

### Test File Upload
1. Upload a document through your app
2. Check the Supabase Storage dashboard to see if the file appears in the `documents` bucket
3. Verify the file is in a folder named with your user ID

### Test Text Extraction
1. After uploading, the app should automatically extract text
2. Check the browser console for any errors
3. Verify the extracted text appears in the text preview screen

## 5. Troubleshooting

### Common Issues

**File upload fails:**
- Check that the storage bucket exists and is named `documents`
- Verify RLS policies are correctly set
- Ensure the user is authenticated

**Text extraction fails:**
- Check the Edge Function logs in Supabase dashboard
- Verify the Edge Function is deployed and accessible
- Check that the file format is supported (PDF, DOCX, TXT)

**Permission errors:**
- Ensure RLS policies are enabled and correct
- Check that the user is properly authenticated
- Verify the service role key is set correctly

### Edge Function Logs
To view Edge Function logs:
1. Go to Supabase dashboard
2. Navigate to **Edge Functions**
3. Click on `extract-text`
4. View the **Logs** tab

## 6. Advanced Configuration

### Custom File Types
To support additional file types, modify the Edge Function in `supabase/functions/extract-text/index.ts`.

### File Size Limits
By default, Supabase has a 50MB file size limit. To change this, modify the storage bucket settings.

### Cleanup
Consider implementing automatic file cleanup by:
1. Adding a cleanup function to delete old files
2. Setting up a cron job or scheduled function
3. Deleting files after successful text extraction

## 7. Security Considerations

- Files are stored in user-specific folders for isolation
- RLS policies ensure users can only access their own files
- Consider implementing file type validation
- Set up proper error handling and logging
- Monitor storage usage and implement cleanup strategies 