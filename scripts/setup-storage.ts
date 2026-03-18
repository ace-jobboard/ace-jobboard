import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local'), override: true })

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data, error } = await supabase.storage.createBucket('cvs', {
    public: false,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['application/pdf'],
  })

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      console.log('✅ cvs bucket already exists — nothing to do')
    } else {
      console.error('❌ Error creating bucket:', error.message)
      process.exit(1)
    }
  } else {
    console.log('✅ cvs bucket created:', data.name)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
