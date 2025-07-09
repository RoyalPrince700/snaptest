import { API_CONFIG, PROMPTS, ERROR_MESSAGES, calculateWordCount, getMaxQuestionsForWordCount } from '@/config/api';

export interface Question {
  id: string;
  question: string;
  options?: string[];
  answer?: string;
  type: 'objective' | 'theory';
}

export interface GenerationRequest {
  text: string;
  questionType: 'objective' | 'theory';
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GenerationResponse {
  questions: Question[];
  success: boolean;
  error?: string;
}

class FireworksAIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = API_CONFIG.FIREWORKS_AI.API_KEY;
    this.baseUrl = API_CONFIG.FIREWORKS_AI.BASE_URL;
    this.model = API_CONFIG.FIREWORKS_AI.MODEL;
  }

  private async makeRequest(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(ERROR_MESSAGES.NO_API_KEY);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Fireworks AI API error:', error);
      throw new Error(`Failed to generate questions: ${error}`);
    }
  }

  private parseObjectiveQuestions(text: string): Question[] {
    const questions: Question[] = [];
    const questionBlocks = text.split(/\d+\./).filter(block => block.trim());
    
    questionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n').filter(line => line.trim());
      if (lines.length === 0) return;

      const questionText = lines[0].trim();
      const options: string[] = [];
      let answer = '';

      // Extract options (A, B, C, D)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^A\./)) {
          options[0] = line.substring(2).trim();
        } else if (line.match(/^B\./)) {
          options[1] = line.substring(2).trim();
        } else if (line.match(/^C\./)) {
          options[2] = line.substring(2).trim();
        } else if (line.match(/^D\./)) {
          options[3] = line.substring(2).trim();
        } else if (line.startsWith('Answer:')) {
          answer = line.substring(7).trim();
        }
      }

      // Only include questions with all 4 options and an answer
      if (
        questionText &&
        options.length === 4 &&
        options.every(opt => !!opt) &&
        answer &&
        ['A', 'B', 'C', 'D'].includes(answer)
      ) {
        questions.push({
          id: `q_${Date.now()}_${index}`,
          question: questionText,
          options,
          answer,
          type: 'objective',
        });
      } else {
        // Log skipped question for debugging
        console.warn('Skipped malformed question:', {
          questionText,
          options,
          answer
        });
      }
    });

    return questions;
  }

  private parseTheoryQuestions(text: string): Question[] {
    const questions: Question[] = [];
    const questionBlocks = text.split(/\d+\./).filter(block => block.trim());
    
    questionBlocks.forEach((block, index) => {
      const questionText = block.trim();
      if (questionText) {
        questions.push({
          id: `q_${Date.now()}_${index}`,
          question: questionText,
          type: 'theory',
        });
      }
    });

    return questions;
  }

  async generateQuestions(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const { text, questionType, count, difficulty } = request;
      
      // Calculate word count and validate
      const wordCount = calculateWordCount(text);
      const maxQuestionsAllowed = getMaxQuestionsForWordCount(wordCount);
      
      // Check if there are enough words
      if (wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS) {
        return {
          questions: [],
          success: false,
          error: ERROR_MESSAGES.INSUFFICIENT_WORDS,
        };
      }
      
      // Check if requested count exceeds word-based limit
      if (count > maxQuestionsAllowed) {
        return {
          questions: [],
          success: false,
          error: `${ERROR_MESSAGES.TOO_MANY_QUESTIONS} Maximum ${maxQuestionsAllowed} questions allowed for ${wordCount} words.`,
        };
      }
      
      // Check global limit
      if (count > API_CONFIG.APP.MAX_QUESTIONS_PER_GENERATION) {
        throw new Error(`Maximum ${API_CONFIG.APP.MAX_QUESTIONS_PER_GENERATION} questions allowed per generation`);
      }

      const prompt = questionType === 'objective' 
        ? PROMPTS.OBJECTIVE(text, count, difficulty)
        : PROMPTS.THEORY(text, count, difficulty);

      const response = await this.makeRequest(prompt);
      
      const questions = questionType === 'objective' 
        ? this.parseObjectiveQuestions(response)
        : this.parseTheoryQuestions(response);

      return {
        questions,
        success: true,
      };
    } catch (error) {
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERATION_FAILED,
      };
    }
  }

  // Method to test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('Hello, please respond with "OK" if you can see this message.');
      return true;
    } catch (error) {
      console.error('Fireworks AI connection test failed:', error);
      return false;
    }
  }
}

export const fireworksAIService = new FireworksAIService(); 