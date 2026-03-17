import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// TODO: @supabase/supabase-js is not installed.
// To enable actual file uploads, run: npm install @supabase/supabase-js
// and replace the stub implementation below with the Supabase upload logic.

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'PDF uniquement' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 })

  try {
    // Stub: store filename only (no actual file storage since @supabase/supabase-js is not installed)
    // When Supabase is configured, replace this with actual upload and store the public URL
    const cvUrl = `/api/user/cv/download` // placeholder URL
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
