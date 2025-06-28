import formidable from 'formidable';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Test this API route with the following curl command (use Git Bash, WSL, or Linux/macOS):
//
// curl -X POST https://snaptest-eight.vercel.app/api/extract \
//   -F "file=@/absolute/path/to/yourfile.pdf"
//
// Replace /absolute/path/to/yourfile.pdf with the path to a real PDF file on your system.
//
// On Windows, use Postman or a Node.js script for file upload testing.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create memory-only formidable instance for Vercel
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  // Disable file writing in Vercel environment
  if (process.env.VERCEL) {
    form.on('fileBegin', (name, file) => {
      file.open = () => {};
      file.end = () => {};
    });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ 
        error: 'File upload error', 
        details: err.message 
      });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      let text = '';
      const fileBuffer = await getFileBuffer(file);

      if (file.originalFilename.endsWith('.pdf')) {
        const data = await pdf(fileBuffer);
        text = data.text;
      } else if (file.originalFilename.endsWith('.docx')) {
        // Process DOCX directly from buffer without temp files
        const result = await mammoth.extractRawText({ 
          buffer: fileBuffer 
        });
        text = result.value;
      } else {
        return res.status(400).json({ error: 'Unsupported file type' });
      }

      res.status(200).json({ text });
    } catch (e) {
      console.error('Extraction error:', e);
      res.status(500).json({ 
        error: 'Extraction failed', 
        details: e.message 
      });
    }
  });
}

// Helper function to consistently get file buffer
async function getFileBuffer(file) {
  if (file.buffer) {
    return file.buffer;
  }
  if (file.toBuffer) {
    return await file.toBuffer();
  }
  if (file.filepath) {
    const fs = await import('fs');
    return fs.readFileSync(file.filepath);
  }
  throw new Error('Unable to access file buffer');
}