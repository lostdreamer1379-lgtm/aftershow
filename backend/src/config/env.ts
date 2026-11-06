import 'dotenv/config'

interface EnvConfig {
  port: number
  frontendUrl: string
  databaseUrl: string | undefined
  supabaseUrl: string | undefined
  supabaseAnonKey: string | undefined
  supabaseServiceRoleKey: string | undefined
  tmdbReadAccessToken: string | undefined
}

function warnIfMissing(name: string, value: string | undefined) {
  if (!value) {
    console.warn(`[AFTERSHOW] Warning: environment variable ${name} is not set. Related features will not work until it is configured.`)
  }
}

export const env: EnvConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  tmdbReadAccessToken: process.env.TMDB_API_READ_ACCESS_TOKEN,
}

warnIfMissing('DATABASE_URL', env.databaseUrl)
warnIfMissing('SUPABASE_URL', env.supabaseUrl)
warnIfMissing('SUPABASE_ANON_KEY', env.supabaseAnonKey)
warnIfMissing('SUPABASE_SERVICE_ROLE_KEY', env.supabaseServiceRoleKey)
warnIfMissing('TMDB_API_READ_ACCESS_TOKEN', env.tmdbReadAccessToken)
