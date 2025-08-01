import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Database types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  company?: string
  subscription_tier: "starter" | "professional" | "enterprise"
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  title: string
  description?: string
  analysis_type: string
  priority: "standard" | "urgent"
  status: "pending" | "processing" | "completed" | "failed"
  price: number
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  order_id: string
  filename: string
  original_name: string
  file_size: number
  file_type: string
  storage_path: string
  created_at: string
}

export interface Analysis {
  id: string
  order_id: string
  analysis_type: string
  results: any
  confidence_score?: number
  processing_time?: number
  created_at: string
}
