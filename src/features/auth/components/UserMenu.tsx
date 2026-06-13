'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser, useLogout } from '@/features/auth/hooks/useAuth';

export function UserMenu() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex items-center gap-3">
      {isLoading ? (
        <Skeleton className="h-5 w-28" />
      ) : (
        user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm leading-tight font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-tight">{user.email}</p>
          </div>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
