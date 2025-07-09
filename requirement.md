SnapTest Project Documentation

Project Overview
SnapTest is a mobile application that helps students generate exam practice questions (MCQs and Theory) by uploading or snapping pages of their textbooks, PDFs, or Word documents. The app extracts text using OCR and leverages the Fireworks AI API to generate intelligent, contextual questions.
The app allows users to sign in using Google. After generating questions from uploaded content, students can choose to answer the objective questions and receive a score at the end. They also have the ability to regenerate questions, and all generated questions are saved and accessible for later via Supabase storage. Users can delete their stored questions at any time.

Target Users
Students in high school, college, or university
Learners preparing for exams

Core Features
1.Google Sign-In Authentication
2.File Upload: Users can upload multiple images, PDFs, and DOC/DOCX files
3.OCR (Text Extraction) for retrieving readable content from uploaded files
4.Question Customization:
oSelect question type: Objective (MCQ) or Theory
oChoose how many questions to generate (e.g., 5, 10, 20), with a maximum limit (e.g., 30)
5.AI Question Generation using Fireworks AI APIworks Ai
6.Quiz Mode:
oMCQs: User can answer and get auto-scored
oTheory: Displayed for study/reference, no scoring
7.Regenerate Questions: Option to generate more questions from the same or additional material
8.Question Management:
oAll questions saved to Supabase (per user)
oUsers can revisit their stored questions later
oUsers can delete previously generated questions

Workflow Summary
1.User Login: Sign in via Google
2.Upload Files: User uploads multiple images or documents (PDF/DOC)
3.Extract Text: App runs OCR to extract readable content from the files
4.Customize Generation:
oUser selects question type: Objective or Theory
oUser inputs desired number of questions (within defined limit)
5.Generate Questions:
oExtracted text is sent to Fireworks AI with a dynamic prompt
oApp receives and renders generated questions
6.Interactive Quiz:
oObjective questions allow user input
oScoring shown at the end
7.Save or Regenerate:
oQuestions saved to Supabase for later access
oUser may request more questions from the same content
8.Manage Saved Questions:
oView question history
oDelete stored question sets

Example Prompt to Fireworks AI (Objective)
You are a tutor. Generate 10 objective questions with 4 options (A-D) based on the text:
"""
<extracted text>
"""
Format:
1. Question...
   A.
   B.
   C.
   D.
   Answer: C

Future Improvements
Offline OCR & caching
Advanced performance analytics and progress tracking
Teacher/admin mode for creating curated tests and sharing with students

Status
Project Name: SnapTest
Type: Mobile App
Stage: Development
Storage: Supabase
AI Provider: Fireworks AI

