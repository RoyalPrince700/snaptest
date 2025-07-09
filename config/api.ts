// API Configuration for SnapTest
export const API_CONFIG = {
  // Fireworks AI Configuration
  FIREWORKS_AI: {
    API_KEY: process.env.EXPO_PUBLIC_FIREWORKS_API_KEY || '',
    BASE_URL: 'https://api.fireworks.ai/inference/v1',
    MODEL: 'accounts/fireworks/models/llama4-maverick-instruct-basic', // Updated to correct model path
  },
  
  // Supabase Configuration
  SUPABASE: {
    URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Google OAuth Configuration
  GOOGLE_OAUTH: {
    CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    REDIRECT_URI: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || '',
  },
  
  // App Configuration
  APP: {
    MAX_QUESTIONS_PER_GENERATION: 50,
    MAX_FILE_SIZE_MB: 10,
    SUPPORTED_FILE_TYPES: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    // Word count limits for question generation
    WORD_COUNT_LIMITS: {
      0: 10,     // 0-100 words: max 10 questions
      101: 20,   // 101-200 words: max 20 questions
      201: 30,   // 201-300 words: max 30 questions
      301: 40,   // 301-500 words: max 40 questions
      501: 50,   // 501+ words: max 50 questions
    } as { [key: number]: number },
    MIN_WORDS_FOR_QUESTIONS: 20, // Minimum words required to generate questions
  }
};

// Utility function to calculate word count
export const calculateWordCount = (text: string): number => {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove extra whitespace and split by spaces
  const words = text.trim().split(/\s+/);
  
  // Filter out empty strings and common stop words (optional)
  const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with']);
  
  return words.filter(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    return cleanWord.length > 0 && !stopWords.has(cleanWord);
  }).length;
};

// Utility function to get maximum questions allowed based on word count
export const getMaxQuestionsForWordCount = (wordCount: number): number => {
  const limits = API_CONFIG.APP.WORD_COUNT_LIMITS;
  
  if (wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS) {
    return 0; // Not enough words
  }
  
  // Find the appropriate limit based on word count
  const thresholds = Object.keys(limits).map(Number).sort((a, b) => a - b);
  
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (wordCount >= thresholds[i]) {
      return limits[thresholds[i]];
    }
  }
  
  return limits[0]; // Default to minimum
};

// Question generation prompts
export const PROMPTS = {
  OBJECTIVE: (text: string, count: number, difficulty: 'easy' | 'medium' | 'hard') => `You are an expert tutor. Generate exactly ${count} objective questions of ${difficulty} difficulty with 4 options (A-D) and an answer for each, based strictly on the following text. If you cannot generate a question with all 4 options and an answer, skip it. Do not include explanations or any extra text. Only output the questions in the following format:

1. [Question text]
   A. [Option A]
   B. [Option B]
   C. [Option C]
   D. [Option D]
   Answer: [Correct letter]

Text:
"""
${text}
"""

Format and output ONLY the questions as shown above. Do not include any explanations, comments, or extra text.`,

  THEORY: (text: string, count: number, difficulty: 'easy' | 'medium' | 'hard') => `You are an expert tutor. Generate exactly ${count} theory/essay questions of ${difficulty} difficulty based on the following text. These should be open-ended questions that require critical thinking and understanding of the material.

Text:
"""
${text}
"""

Format each question exactly like this:
1. [Question text]

Generate exactly ${count} questions. Do not include any explanations, comments, or extra text.`
};

// Error messages
export const ERROR_MESSAGES = {
  NO_API_KEY: 'Fireworks AI API key not configured',
  NO_SUPABASE_CONFIG: 'Supabase configuration not found',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  UNSUPPORTED_FILE_TYPE: 'File type not supported',
  OCR_FAILED: 'Failed to extract text from file',
  GENERATION_FAILED: 'Failed to generate questions',
  AUTH_FAILED: 'Authentication failed',
  INSUFFICIENT_WORDS: 'Please add more text to generate questions (minimum 20 words)',
  TOO_MANY_QUESTIONS: 'Too many questions requested for the amount of text provided.',
}; 