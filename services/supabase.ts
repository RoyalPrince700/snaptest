import { createClient } from '@supabase/supabase-js';
import { API_CONFIG, ERROR_MESSAGES } from '@/config/api';
import { Question } from './fireworksAI';
import * as FileSystem from 'expo-file-system';

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface QuestionSet {
  id: string;
  user_id: string;
  title: string;
  questions: Question[];
  question_type: 'objective' | 'theory';
  source_text: string;
  created_at: string;
  updated_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  question_set_id: string;
  score?: number;
  total_questions: number;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

class SupabaseService {
  public supabase;

  constructor() {
    const url = API_CONFIG.SUPABASE.URL;
    const anonKey = API_CONFIG.SUPABASE.ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(ERROR_MESSAGES.NO_SUPABASE_CONFIG);
    }

    this.supabase = createClient(url, anonKey);
  }

  // User management
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error || !user) {
        return null;
      }
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email || '',
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
      };
    } catch (error) {
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
    }
  }

  // Question set management
  async saveQuestionSet(
    title: string,
    questions: Question[],
    questionType: 'objective' | 'theory',
    sourceText: string
  ): Promise<QuestionSet | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('question_sets')
        .insert({
          user_id: user.id,
          title,
          questions: JSON.stringify(questions),
          question_type: questionType,
          source_text: sourceText,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        questions: JSON.parse(data.questions),
      };
    } catch (error) {
      return null;
    }
  }

  async getUserQuestionSets(): Promise<QuestionSet[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return [];
      }

      const { data, error } = await this.supabase
        .from('question_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const parsedSets = data.map(set => ({
        ...set,
        questions: JSON.parse(set.questions),
      }));
      
      return parsedSets;
    } catch (error) {
      return [];
    }
  }

  async getQuestionSet(id: string): Promise<QuestionSet | null> {
    try {
      const { data, error } = await this.supabase
        .from('question_sets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        questions: JSON.parse(data.questions),
      };
    } catch (error) {
      return null;
    }
  }

  async deleteQuestionSet(id: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      const { error } = await this.supabase
        .from('question_sets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Quiz session management
  async createQuizSession(questionSetId: string, totalQuestions: number): Promise<QuizSession | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await this.supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          question_set_id: questionSetId,
          total_questions: totalQuestions,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return null;
    }
  }

  async completeQuizSession(sessionId: string, score: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('quiz_sessions')
        .update({
          score,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserQuizSessions(): Promise<QuizSession[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await this.supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return [];
    }
  }

  // Database schema setup (run this once to create tables)
  async setupDatabase(): Promise<void> {
    // This would typically be done via Supabase migrations
    // For now, we'll just log the required schema
  }
}

export const supabaseService = new SupabaseService(); 