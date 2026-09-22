import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ApiCategory } from "@/types/api";
import type { CategoryFormPayload, CategoryUpdatePayload } from "@/types/forms";

const KEY = ["categories"];

export function useCategories(includeArchived = false) {
  return useQuery({
    queryKey: [...KEY, { includeArchived }],
    queryFn: () =>
      api.get<{ categories: ApiCategory[] }>(`/api/v1/categories?includeArchived=${includeArchived}`),
    select: (data) => data.categories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryFormPayload) => api.post("/api/v1/categories", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryUpdatePayload }) =>
      api.patch(`/api/v1/categories/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
