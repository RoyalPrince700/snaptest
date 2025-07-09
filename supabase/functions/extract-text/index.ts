import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = (typeof Deno !== "undefined" && Deno.env && Deno.env.get)
      ? Deno.env.get('SUPABASE_URL')
      : undefined;
    const supabaseServiceKey = (typeof Deno !== "undefined" && Deno.env && Deno.env.get)
      ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      : undefined;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not set');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { filePath } = await req.json()

    if (!filePath) {
      throw new Error('filePath is required')
    }

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    if (!fileData) {
      throw new Error('No file data received')
    }

    // Convert to array buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    let extractedText = ''
    let deleteError = null;

    // Extract text based on file type
    try {
      if (filePath.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(uint8Array)
      } else if (filePath.toLowerCase().endsWith('.docx')) {
        extractedText = await extractTextFromDOCX(uint8Array)
      } else if (filePath.toLowerCase().endsWith('.doc')) {
        extractedText = '[DOC file format not supported yet. Please convert to PDF or DOCX.]'
      } else if (filePath.toLowerCase().endsWith('.txt')) {
        const decoder = new TextDecoder('utf-8')
        extractedText = decoder.decode(uint8Array)
      } else {
        const decoder = new TextDecoder('utf-8')
        extractedText = decoder.decode(uint8Array)
      }
    } catch (extractErr) {
      throw extractErr;
    } finally {
      // Always attempt to delete the file after processing
      const { error: delError } = await supabase.storage
        .from('documents')
        .remove([filePath]);
      if (delError) {
        deleteError = delError;
      }
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()

    if (!extractedText || extractedText.length < 10) {
      throw new Error('No meaningful text could be extracted from the document')
    }

    return new Response(
      JSON.stringify({ 
        text: extractedText,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    return new Response(
      JSON.stringify({ 
        error: message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

// Function to extract text from PDF
async function extractTextFromPDF(uint8Array: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder('utf-8').decode(uint8Array)
    const textMatches = text.match(/\(([^)]+)\)/g)
    if (textMatches) {
      return textMatches.map(match => match.slice(1, -1)).join(' ')
    }
    const readableText = text.replace(/[^\w\s\.\,\!\?\;\:\-\(\)]/g, ' ')
    return readableText
  } catch (error) {
    return '[PDF text extraction failed]'
  }
}

// Function to extract text from DOCX
async function extractTextFromDOCX(uint8Array: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder('utf-8').decode(uint8Array)
    const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g)
    if (textMatches) {
      return textMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .join(' ')
    }
    const readableText = text.replace(/[^\w\s\.\,\!\?\;\:\-\(\)]/g, ' ')
    return readableText
  } catch (error) {
    return '[DOCX text extraction failed]'
  }
} 