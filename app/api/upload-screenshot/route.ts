import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()
  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  }
  const ext = MIME_TO_EXT[file.type] ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('payment-screenshots')
    .upload(filename, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[upload-screenshot]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data } = supabase.storage
    .from('payment-screenshots')
    .getPublicUrl(filename)

  return NextResponse.json({ url: data.publicUrl }, { status: 201 })
}
