# SnapTest Architecture & Logic Explained

This document provides a comprehensive, step-by-step explanation of how SnapTest handles document upload, text extraction, and question generation. It is designed to help you (or any future developer) quickly understand what each part of the system does and how they work together.

---

## 1. **User Flow Overview**

1. **User uploads or selects a document/image/text in the app.**
2. **The app processes the file and sends it to the appropriate extraction service.**
3. **Text is extracted from the document (via Vercel API for documents, or on-device for images).**
4. **Extracted text is previewed in the app.**
5. **User can generate questions from the extracted text.**
6. **Questions are displayed and can be saved or used for a quiz.**

---

## 2. **Key Components & Their Responsibilities**

### **A. React Native App (Expo)**
- **UI/UX:** Handles all user interactions, file selection, previews, and navigation.
- **File Handling:** Uses Expo libraries to pick documents or images, and to read file contents as base64 for upload.
- **API Integration:** Sends files to the Vercel API for extraction and receives extracted text.
- **Question Generation:** Sends extracted text to an AI service to generate questions.

### **B. Vercel Serverless API**
- **Endpoint:** `/api/extract-text`
- **Purpose:** Receives files (as base64) and filenames from the app, extracts text from PDF, DOCX, or TXT files, and returns the extracted text.
- **Libraries Used:** Utilizes robust Node.js libraries (`pdf-parse` for PDFs, `mammoth` for DOCX) for accurate extraction.
- **Stateless:** Does not store files or user data; processes and returns results immediately.

### **C. Supabase (Optional/Legacy)**
- **Authentication:** Handles user authentication and session management for the app.
- **Storage (Legacy):** Previously used for file storage and extraction, now replaced by Vercel for extraction.
- **Database:** Stores user data, question sets, and quiz results.

---

## 3. **Step-by-Step: Document Extraction Flow**

1. **User Action:**
   - User selects or uploads a document (PDF, DOCX, TXT) in the app.

2. **File Preparation:**
   - The app reads the file as a base64 string using Expo FileSystem.
   - The app collects the file name and type.

3. **API Request:**
   - The app sends a POST request to the Vercel API endpoint (`/api/extract-text`) with the file name and base64 content in the request body.

4. **Vercel API Processing:**
   - The serverless function receives the request.
   - It decodes the base64 file and determines the file type by extension.
   - It uses the appropriate library to extract text:
     - **PDF:** Uses `pdf-parse` to extract text.
     - **DOCX:** Uses `mammoth` to extract text.
     - **TXT:** Reads as plain text.
     - **Other:** Attempts to read as plain text.
   - Cleans up the extracted text (removes extra whitespace, trims).
   - Returns the extracted text as a JSON response.

5. **App Receives Extracted Text:**
   - The app displays a preview of the extracted text to the user.
   - If extraction fails, an error message is shown.

6. **Question Generation:**
   - The user can request question generation from the extracted text.
   - The app sends the text to an AI service (e.g., FireworksAI) to generate questions.
   - The generated questions are displayed and can be saved or used for quizzes.

---

## 4. **Image and Pasted Text Handling**

- **Images:**
  - The app uses on-device OCR (e.g., `react-native-mlkit-ocr`) to extract text from images.
  - No server/API is involved for image text extraction.

- **Pasted Text:**
  - Users can paste or type text directly into the app.
  - This text is used directly for preview and question generation.

---

## 5. **Error Handling & User Feedback**

- The app provides clear error messages if extraction fails (e.g., unsupported file type, unreadable file, network issues).
- The Vercel API returns error messages in JSON if extraction fails or if the request is malformed.
- The app disables actions and shows loading indicators during processing.

---

## 6. **Extensibility & Maintenance**

- **Adding New File Types:**
  - To support more file types, update the Vercel API to handle new extensions and add the necessary extraction logic.
- **Changing Extraction Logic:**
  - All extraction logic is centralized in the Vercel API, making it easy to update or enhance.
- **Authentication & Security:**
  - The Vercel API is public for extraction; Supabase handles user authentication for app features.
- **Separation of Concerns:**
  - The app handles UI, user actions, and API integration.
  - The Vercel API handles all document extraction logic.
  - Supabase handles authentication and data storage.

---

## 7. **Summary Table: What Handles What?**

| Responsibility                | Handled By         | Notes                                  |
|-------------------------------|--------------------|----------------------------------------|
| User authentication           | Supabase           | App login, session, user data          |
| File selection/upload         | React Native App   | Expo FileSystem, DocumentPicker        |
| Image text extraction         | React Native App   | On-device OCR (MLKit)                  |
| Document text extraction      | Vercel API         | PDF/DOCX/TXT via serverless function   |
| Question generation           | AI Service         | FireworksAI or similar                 |
| Data storage (questions, etc) | Supabase           | User question sets, quiz results       |
| Error handling                | App & Vercel API   | User feedback, API error responses     |

---

This document should give you a clear, high-level understanding of how SnapTest works, what each part is responsible for, and how the pieces fit together. If you update the architecture or add new features, update this file to keep it current! 