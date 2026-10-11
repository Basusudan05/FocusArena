// This file must be the first module loaded.
// It populates process.env from .env before any other module
// (including config/supabase.js) is evaluated.
import { config } from 'dotenv'

const result = config()

if (result.error) {
  console.warn('[env] .env file not found or could not be parsed:', result.error.message)
} else {
  console.log('[env] .env loaded successfully')
}

// On Windows dev machines Node's bundled CA store may not trust the local
// certificate chain, causing fetch to fail with "unable to verify the first
// certificate". Disable strict TLS verification in non-production environments only.
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.log('[env] TLS verification relaxed for development')
}
