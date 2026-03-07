import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers.js'

// For server components
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// For client components
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// For API routes (uses service role key - full access)
export const createServiceSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Database types (you can generate these with: npx supabase gen types typescript)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          employment_status: string
          target_role: string | null
          biggest_obstacle: string
          timeline: string
          target_salary_range: string | null
          coached_before: boolean
          breakthrough_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          employment_status: string
          target_role?: string | null
          biggest_obstacle: string
          timeline: string
          target_salary_range?: string | null
          coached_before?: boolean
          breakthrough_type?: string | null
          created_at?: string
        }
      }
      module_progress: {
        Row: {
          id: string
          user_id: string
          module_name: string
          is_unlocked: boolean
          is_completed: boolean
          progress_percent: number
          unlocked_at: string | null
          completed_at: string | null
        }
        Update: {
          is_unlocked?: boolean
          is_completed?: boolean
          progress_percent?: number
          completed_at?: string | null
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          module_name: string
          amount_paid: number
          stripe_payment_intent_id: string | null
          stripe_customer_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_name: string
          amount_paid: number
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          created_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          original_filename: string
          file_url: string | null
          file_text: string | null
          analysis_result: any
          strengths: string[] | null
          improvement_areas: string[] | null
          ats_score: number | null
          analysis_status: string
          created_at: string
          analyzed_at: string | null
        }
      }
    }
  }
}
