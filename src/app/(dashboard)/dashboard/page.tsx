import type { Metadata } from 'next';

import { DashboardClient } from '@/features/tasks/components/DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard · TaskFlow',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
