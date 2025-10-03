import { NextResponse } from 'next/server';

export function middleware(request) {
  // Just pass through - no locale handling
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
