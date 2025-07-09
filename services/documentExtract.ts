// documentExtract.ts
// Service to upload a document to Supabase and get extracted text

import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Sends a file to the Vercel serverless function for text extraction
export async function extractTextWithVercel(fileUri: string, fileName: string): Promise<string> {
  // Read file as base64
  const fileBase64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

  // Use the deployed Vercel endpoint
  const response = await axios.post('https://snap-im1ulml3r-josephs-projects-566b8af7.vercel.app/api/extract-text', {
    name: fileName,
    file: fileBase64,
  });

  if (response.data && response.data.text) {
    return response.data.text;
  } else {
    throw new Error(response.data.error || 'Failed to extract text');
  }
} 