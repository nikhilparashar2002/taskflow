'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/authService';
import { APP_ROUTES } from '@/lib/constants';
import type { LoginInput, RegisterInput } from '@/types/user';

const CURRENT_USER_KEY = ['auth', 'me'] as const;

/** Fetch the currently authenticated user (used in the dashboard header). */
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: () => {
      router.replace(APP_ROUTES.dashboard);
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    // Register, then transparently log in so the user lands authenticated.
    mutationFn: async (input: RegisterInput) => {
      await authService.register(input);
      await authService.login({ email: input.email, password: input.password });
    },
    onSuccess: () => {
      router.replace(APP_ROUTES.dashboard);
      router.refresh();
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.replace(APP_ROUTES.login);
      router.refresh();
    },
  });
}
