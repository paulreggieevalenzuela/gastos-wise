import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ApiTransaction } from "@/types/api";
import type { TransactionFormPayload, TransactionUpdatePayload } from "@/types/forms";

const KEY = ["transactions"];

export interface TransactionListParams {
  type?: string;
  accountId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useTransactions(params: TransactionListParams) {
  const query = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== "") acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();

  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () =>
      api.get<{ items: ApiTransaction[]; total: number; page: number; pageSize: number }>(
        `/api/v1/transactions?${query}`,
      ),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionFormPayload) => api.post("/api/v1/transactions", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionUpdatePayload }) =>
      api.patch(`/api/v1/transactions/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
