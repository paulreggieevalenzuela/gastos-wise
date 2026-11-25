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
import { Archive, ArchiveRestore, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function RowActions({
  category,
  onEdit,
  onArchive,
  onDelete,
  small = false,
}: {
  category: ApiCategory;
  onEdit: (c: ApiCategory) => void;
  onArchive: (c: ApiCategory) => void;
  onDelete: (c: ApiCategory) => void;
  small?: boolean;
}) {
  const size = small ? 14 : 16;
  const btn = cn(
    "gw-press flex items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink",
    small ? "h-8 w-8" : "h-9 w-9",
  );
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={btn} onClick={() => onEdit(category)} title="Edit" aria-label={`Edit ${category.name}`}>
        <Pencil size={size} />
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => onArchive(category)}
        title={category.isArchived ? "Restore" : "Archive"}
        aria-label={`${category.isArchived ? "Restore" : "Archive"} ${category.name}`}
      >
        {category.isArchived ? <ArchiveRestore size={size} /> : <Archive size={size} />}
      </button>
      <button
        type="button"
        className={cn(btn, "hover:bg-negative-soft hover:text-negative")}
        onClick={() => onDelete(category)}
        title="Delete"
        aria-label={`Delete ${category.name}`}
      >
        <Trash2 size={size} />
      </button>
    </div>
  );
}

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
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">{title}</h2>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {topLevel.map((parent) => {
            const children = categories.filter((c) => c.parentId === parent.id);
            const Icon = getCategoryIcon(parent.icon, parent.name);
            const colors = getCategoryColorClasses(parent.color);
            return (
              <div key={parent.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}>
                      <Icon size={19} />
                    </div>
                    <span className="truncate font-bold text-ink">{parent.name}</span>
                    {parent.isArchived && <Badge tone="neutral">Archived</Badge>}
                  </div>
                  <RowActions category={parent} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
                </div>
                {children.length > 0 && (
                  <ul className="ml-14 mt-1.5 space-y-0.5">
                    {children.map((child) => {
                      const ChildIcon = getCategoryIcon(child.icon, child.name);
                      return (
                      <li key={child.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2 font-semibold text-ink-muted">
                          <ChildIcon size={15} className={`shrink-0 ${colors.text}`} />
                          <span className="truncate">{child.name}</span>
                        </span>
                        <RowActions category={child} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} small />
                      </li>
                      );
                    })}
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-accent">Organize</p>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Categories</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalType("INCOME")}>
            <Plus size={16} /> Income
          </Button>
          <Button onClick={() => setModalType("EXPENSE")}>
            <Plus size={16} /> Expense
          </Button>
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
