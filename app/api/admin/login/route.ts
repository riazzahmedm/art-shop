import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { password?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', process.env.ADMIN_SESSION_SECRET!, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
