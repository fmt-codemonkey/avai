import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create standard Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a function to get Supabase client for Clerk integration
// Using standard client with manual user_id filtering instead of RLS
export const createClerkSupabaseClient = (_getToken?: (options?: {template?: string}) => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
};

// Database types
export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: number
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          session_id: number
          content: string
          sender: string
          created_at: string
        }
        Insert: {
          id?: number
          session_id: number
          content: string
          sender: string
          created_at?: string
        }
        Update: {
          id?: number
          session_id?: number
          content?: string
          sender?: string
          created_at?: string
        }
      }
    }
  }
}

export type ChatSession = Database['public']['Tables']['sessions']['Row']
export type ChatMessage = Database['public']['Tables']['messages']['Row']