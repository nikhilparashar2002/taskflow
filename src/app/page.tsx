import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { AUTH_COOKIE, APP_ROUTES } from '@/lib/constants';

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthed = Boolean(cookieStore.get(AUTH_COOKIE)?.value);
  redirect(isAuthed ? APP_ROUTES.dashboard : APP_ROUTES.login);
}
