import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ApiAccount } from "@/types/api";
import type { AccountFormPayload } from "@/types/forms";

const KEY = ["accounts"];

export function useAccounts(includeInactive = false) {
  return useQuery({
    queryKey: [...KEY, { includeInactive }],
    queryFn: () => api.get<{ accounts: ApiAccount[] }>(`/api/v1/accounts?includeInactive=${includeInactive}`),
    select: (data) => data.accounts,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountFormPayload) => api.post("/api/v1/accounts", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AccountFormPayload> & { isActive?: boolean } }) =>
      api.patch(`/api/v1/accounts/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
