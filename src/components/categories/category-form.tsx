"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { CATEGORY_COLOR_OPTIONS, getCategoryColorClasses } from "@/lib/category-colors";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "@/lib/icons";
import type { ApiCategory, CategoryType } from "@/types/api";

export function CategoryForm({
  category,
  defaultType = "EXPENSE",
  onDone,
}: {
  category?: ApiCategory;
  defaultType?: CategoryType;
  onDone: () => void;
}) {
  const isEdit = Boolean(category);
  const { data: categories } = useCategories();
  const [name, setName] = useState(category?.name ?? "");
  const [type] = useState<CategoryType>(category?.type ?? defaultType);
  const [icon, setIcon] = useState(category?.icon ?? "circle");
  const [color, setColor] = useState(category?.color ?? "slate");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const parentOptions = (categories ?? []).filter(
    (c) => c.type === type && !c.parentId && c.id !== category?.id,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          input: { name: name.trim(), icon, color, parentId: parentId || null },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          type,
          icon,
          color,
          parentId: parentId || null,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
      </div>

      <div>
        <Label htmlFor="parent">Parent category (optional)</Label>
        <Select id="parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">None — top level</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Icon</Label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORY_ICON_OPTIONS.map((opt) => {
            const Icon = getCategoryIcon(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setIcon(opt)}
                aria-pressed={icon === opt}
                className={`flex h-10 items-center justify-center rounded-md border ${
                  icon === opt ? "border-accent bg-accent-soft text-accent" : "border-border text-ink-muted"
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLOR_OPTIONS.map((opt) => {
            const classes = getCategoryColorClasses(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setColor(opt)}
                aria-pressed={color === opt}
                className={`h-7 w-7 rounded-full ${classes.dot} ${
                  color === opt ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
                }`}
                title={opt}
              />
            );
          })}
        </div>
      </div>

      <FieldError>{error ?? undefined}</FieldError>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add category"}
        </Button>
      </div>
    </form>
  );
}
