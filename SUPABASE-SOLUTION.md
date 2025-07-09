# Document Extraction Solution (Vercel-based)

## Overview

This solution uses a Vercel serverless function for document extraction. Files are sent directly from the app to the Vercel endpoint, which extracts text and returns it to the app.

## What Changed

### 1. File Upload & Extraction Process
- **Before**: Files uploaded to Supabase Storage, text extracted by Supabase Edge Function
- **Now**: Files sent directly to Vercel serverless function for extraction

### 2. Architecture
```
Before: App → Supabase Storage → Edge Function → Text Response
Now:    App → Vercel Serverless Function → Text Response
```

## Files Modified

### Core Services
- `services/documentExtract.ts` - Now uses Vercel endpoint for extraction
- `app/text-preview.tsx` - Calls Vercel-based extraction for all document types
- `services/supabase.ts` - Removed all document extraction/upload logic

### Removed/Deprecated
- Supabase Edge Function for extraction
- Supabase-based extraction scripts

## Benefits

- **More robust extraction** (can use any Node.js library)
- **No Deno/Supabase Edge limitations**
- **Easier to extend and debug**

## Setup Instructions

### 1. Deploy Vercel Serverless Function
- Create `/api/extract-text.ts` in your Vercel project (see below for sample code)
- Deploy to Vercel
- Copy your deployment URL (e.g., `https://your-app.vercel.app/api/extract-text`)

### 2. Update App
- In `services/documentExtract.ts`, set the Vercel endpoint URL
- Test document upload and extraction in your app

## Sample Vercel Serverless Function

```ts
// /api/extract-text.ts
import type { VercelRequest, VercelResponse } from 'vercel';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, file } = req.body;
    if (!name || !file) {
      return res.status(400).json({ error: 'Missing name or file' });
    }
    const buffer = Buffer.from(file, 'base64');
    let text = '';
    if (name.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      text = buffer.toString('utf-8');
    }
    text = text.replace(/\s+/g, ' ').trim();
    if (!text || text.length < 10) {
      return res.status(400).json({ error: 'No meaningful text could be extracted' });
    }
    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Extraction failed' });
  }
}
```

## Supported File Types
- PDF (.pdf)
- DOCX (.docx)
- TXT (.txt)

## Error Handling
- Errors are returned as `{ error: string }` in the response
- The app displays a user-friendly error message if extraction fails

## Monitoring and Logs
- Use Vercel dashboard to view function logs and monitor usage

## Security Considerations
- Files are sent directly to the Vercel function and not stored
- No user data is persisted on the server

## Future Improvements
- Add support for more file types
- Add authentication to the Vercel endpoint if needed
- Optimize extraction for large files

## Migration Checklist
- [x] App uses Vercel for extraction
- [x] Supabase extraction code removed
- [x] Documentation updated

## Conclusion

This Vercel-based solution provides a more robust, secure, and cost-effective approach to document extraction. By eliminating the dependency on Supabase, you gain better control over your data and reduce potential points of failure.

The solution is production-ready and can be easily extended to support additional file types and features as needed. 