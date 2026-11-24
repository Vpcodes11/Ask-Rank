import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { appUrl } from '@/lib/util';

export async function POST() {
  await destroySession();
  return NextResponse.redirect(`${appUrl()}/`, 303);
}
