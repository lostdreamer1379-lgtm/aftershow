import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

// Service-role client — backend only. Never expose this key to the frontend.
// Used to verify JWTs issued by Supabase Auth for incoming requests.
export const supabaseAdmin = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseServiceRoleKey || 'placeholder-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
