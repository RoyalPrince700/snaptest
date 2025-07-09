# SnapTest Setup Guide

## Prerequisites

1. **Fireworks AI Account**: Sign up at [fireworks.ai](https://fireworks.ai) and get your API key
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com) and create a new project
3. **Google Cloud Console**: Set up OAuth for Google Sign-In

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Fireworks AI Configuration
EXPO_PUBLIC_FIREWORKS_API_KEY=your_fireworks_ai_api_key_here

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
EXPO_PUBLIC_GOOGLE_REDIRECT_URI=your_google_redirect_uri_here
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the following SQL to create the required tables:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question sets table
CREATE TABLE question_sets (
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
CREATE TABLE quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  score INTEGER,
  total_questions INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for question_sets
CREATE POLICY "Users can view their own question sets" ON question_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question sets" ON question_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question sets" ON question_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question sets" ON question_sets
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz sessions" ON quiz_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

4. Get your Supabase URL and anon key from Settings > API

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your app's redirect URI (e.g., `com.yourcompany.snaptest://oauth2redirect`)

### 4. Configure Fireworks AI

1. Sign up at [fireworks.ai](https://fireworks.ai)
2. Get your API key from the dashboard
3. Optionally, change the model in `config/api.ts` if you want to use a different model

### 5. Run the App

```bash
npm start
```

## Features Implemented

- ✅ Fireworks AI integration for question generation
- ✅ Supabase database setup with proper schema
- ✅ Google OAuth authentication structure
- ✅ File upload and OCR preparation
- ✅ Question parsing and management
- ✅ Quiz session tracking

## Next Steps

1. Implement the UI screens for:
   - File upload/camera capture
   - Question generation interface
   - Quiz taking interface
   - Question management
2. Add OCR functionality for text extraction
3. Implement Google Sign-In flow
4. Add file handling for PDFs and documents

## Troubleshooting

- **API Key Issues**: Make sure your Fireworks AI API key is valid and has sufficient credits
- **Supabase Connection**: Verify your Supabase URL and anon key are correct
- **Google OAuth**: Ensure your redirect URI matches exactly what's configured in Google Cloud Console 