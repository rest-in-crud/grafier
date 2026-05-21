import { useQuery } from '@tanstack/react-query';
import { api } from '@/features/auth/api';
import { userQueryKey } from '@/features/auth/query-keys';

export const userQueryOptions = {
  queryKey: userQueryKey,
  queryFn: () => api.me(),
  staleTime: Infinity,
};

export function useUser() {
  const { data, isPending, isError } = useQuery(userQueryOptions);
  return { user: data ?? null, isPending, isError };
}
