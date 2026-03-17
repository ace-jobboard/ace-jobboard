import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local'), override: true })

// NOTE: @supabase/supabase-js is not installed.
// To use this script, first run: npm install @supabase/supabase-js
// Then uncomment the code below.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Also ensure @supabase/supabase-js is installed: npm install @supabase/supabase-js')
  process.exit(1)
}

console.log('Supabase env vars found. To create the cvs bucket, install @supabase/supabase-js and update this script.')
console.log('Alternatively, create the "cvs" bucket manually in your Supabase dashboard:')
console.log('  - Bucket name: cvs')
console.log('  - Public: false')
console.log('  - Max file size: 5MB')
console.log('  - Allowed MIME types: application/pdf')
