import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(url, key)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'PDF uniquement' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 })

  try {
    const supabase = getSupabaseAdmin()
    const path = `${session.user.id}/cv.pdf`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Generate a signed URL (1 year TTL) for private buckets,
    // or use getPublicUrl if the bucket is public
    const { data: signed, error: signedError } = await supabase.storage
      .from('cvs')
      .createSignedUrl(path, 365 * 24 * 60 * 60)

    if (signedError) throw signedError
    const cvUrl = signed.signedUrl

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { cvUrl, cvFileName: file.name, cvUploadedAt: new Date() },
      select: { cvUrl: true, cvFileName: true, cvUploadedAt: true },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('[cv upload]', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    const path = `${session.user.id}/cv.pdf`
    await supabase.storage.from('cvs').remove([path])

    await prisma.user.update({
      where: { id: session.user.id },
      data: { cvUrl: null, cvFileName: null, cvUploadedAt: null },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[cv delete]', e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
