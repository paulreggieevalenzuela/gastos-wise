import { z } from "zod";

export const ACCENT_COLORS = ["emerald", "navy", "plum", "rust"] as const;
export const THEME_MODES = ["light", "dark", "system"] as const;

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  currency: z.string().trim().length(3).optional(),
  timezone: z.string().trim().min(1).max(60).optional(),
  themeMode: z.enum(THEME_MODES).optional(),
  accentColor: z.enum(ACCENT_COLORS).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
