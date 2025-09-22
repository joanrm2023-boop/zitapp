// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qyjyuhpjbffdnnurfmza.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5anl1aHBqYmZmZG5udXJmbXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjUxNDEsImV4cCI6MjA2NTM0MTE0MX0.94JsRV-vsYSN8oqB1t82R8TfGVnSDaBr6PZ4IoRR2ic'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
