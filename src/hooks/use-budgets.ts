import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ApiBudget } from "@/types/api";
import type { BudgetFormPayload, BudgetUpdatePayload } from "@/types/forms";

const KEY = ["budgets"];

export function useBudgets() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<{ budgets: ApiBudget[] }>("/api/v1/budgets"),
    select: (data) => data.budgets,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetFormPayload) => api.post("/api/v1/budgets", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BudgetUpdatePayload }) =>
      api.patch(`/api/v1/budgets/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/budgets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
