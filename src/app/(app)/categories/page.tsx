"use client";

import { useState } from "react";
import { useCategories, useDeleteCategory, useUpdateCategory } from "@/hooks/use-categories";
import { CategoryForm } from "@/components/categories/category-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import type { ApiCategory, CategoryType } from "@/types/api";

function CategoryGroup({
  title,
  categories,
  onEdit,
  onArchive,
  onDelete,
}: {
  title: string;
  categories: ApiCategory[];
  onEdit: (c: ApiCategory) => void;
  onArchive: (c: ApiCategory) => void;
  onDelete: (c: ApiCategory) => void;
}) {
  const topLevel = categories.filter((c) => !c.parentId);

  if (topLevel.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">{title}</h2>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {topLevel.map((parent) => {
            const children = categories.filter((c) => c.parentId === parent.id);
            const Icon = getCategoryIcon(parent.icon);
            const colors = getCategoryColorClasses(parent.color);
            return (
              <div key={parent.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colors.bg} ${colors.text}`}>
                      <Icon size={16} />
                    </div>
                    <span className="font-medium text-ink">{parent.name}</span>
                    {parent.isArchived && <Badge tone="neutral">Archived</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(parent)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onArchive(parent)}>
                      {parent.isArchived ? "Restore" : "Archive"}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-negative" onClick={() => onDelete(parent)}>
                      Delete
                    </Button>
                  </div>
                </div>
                {children.length > 0 && (
                  <ul className="ml-12 mt-2 space-y-1.5">
                    {children.map((child) => (
                      <li key={child.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink-muted">{child.name}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => onEdit(child)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onArchive(child)}>
                            {child.isArchived ? "Restore" : "Archive"}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-negative" onClick={() => onDelete(child)}>
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories(true);
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const [modalType, setModalType] = useState<CategoryType | null>(null);
  const [editing, setEditing] = useState<ApiCategory | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function archive(category: ApiCategory) {
    await updateMutation.mutateAsync({ id: category.id, input: { isArchived: !category.isArchived } });
  }

  async function remove(category: ApiCategory) {
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(category.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't delete this category.");
    }
  }

  const expense = (categories ?? []).filter((c) => c.type === "EXPENSE");
  const income = (categories ?? []).filter((c) => c.type === "INCOME");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Categories</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalType("INCOME")}>
            Add income category
          </Button>
          <Button onClick={() => setModalType("EXPENSE")}>Add expense category</Button>
        </div>
      </div>

      {actionError && (
        <p className="rounded-md bg-negative-soft px-3 py-2 text-sm text-negative">{actionError}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Categories group your transactions so dashboards and budgets make sense."
          action={<Button onClick={() => setModalType("EXPENSE")}>Add category</Button>}
        />
      ) : (
        <div className="space-y-6">
          <CategoryGroup title="Expense" categories={expense} onEdit={setEditing} onArchive={archive} onDelete={remove} />
          <CategoryGroup title="Income" categories={income} onEdit={setEditing} onArchive={archive} onDelete={remove} />
        </div>
      )}

      <Modal open={Boolean(modalType)} onClose={() => setModalType(null)} title="Add category">
        {modalType && <CategoryForm defaultType={modalType} onDone={() => setModalType(null)} />}
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit category">
        {editing && <CategoryForm category={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
