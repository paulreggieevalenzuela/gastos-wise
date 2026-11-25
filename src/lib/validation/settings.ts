import { z } from "zod";

// Legacy preset keys from before the custom color picker -- still accepted
// so old clients / already-stored rows don't fail validation.
export const LEGACY_ACCENT_COLORS = ["emerald", "navy", "plum", "rust"] as const;
export const THEME_MODES = ["light", "dark", "system"] as const;

const hexColor = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #1F6F54");

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  currency: z.string().trim().length(3).optional(),
  timezone: z.string().trim().min(1).max(60).optional(),
  themeMode: z.enum(THEME_MODES).optional(),
  accentColor: z.union([hexColor, z.enum(LEGACY_ACCENT_COLORS)]).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
