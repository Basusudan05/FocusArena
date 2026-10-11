import { createClient } from '@supabase/supabase-js'

// Fix TLS certificate verification issues on Windows dev environments.
// Node's bundled CA store doesn't always trust corporate/system certs.
// This must be set before any fetch calls are made.
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// Validate presence without exposing values
const urlPresent = Boolean(process.env.SUPABASE_URL)
const keyPresent = Boolean(process.env.SUPABASE_KEY)

console.log('[supabase] SUPABASE_URL present:', urlPresent)
console.log('[supabase] SUPABASE_KEY present:', keyPresent)

if (!urlPresent || !keyPresent) {
  throw new Error(
    `Missing environment variables — SUPABASE_URL: ${urlPresent}, SUPABASE_KEY: ${keyPresent}`
  )
}

const supabaseUrl = process.env.SUPABASE_URL

if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('SUPABASE_URL does not look like a valid Supabase project URL')
}

console.log('[supabase] Creating client for project:', supabaseUrl)

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default supabase
