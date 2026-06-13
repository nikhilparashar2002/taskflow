import { CheckSquare } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-muted/40 flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <CheckSquare className="text-primary size-6" />
        <span className="text-lg font-semibold">TaskFlow</span>
      </div>
      {children}
    </main>
  );
}
