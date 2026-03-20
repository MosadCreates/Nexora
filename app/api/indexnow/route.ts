import { NextResponse } from 'next/server'

// Generate a key at https://www.bing.com/indexnow
// Add to env: INDEXNOW_KEY=your_key_here

export async function GET() {
  return new NextResponse(process.env.INDEXNOW_KEY || '', {
    headers: { 'Content-Type': 'text/plain' },
  })
}
