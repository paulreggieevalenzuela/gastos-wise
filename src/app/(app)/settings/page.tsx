"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccentPicker } from "@/components/theme/accent-picker";
import { useAccent } from "@/components/theme/accent-provider";

interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    currency: string;
    themeMode: string;
    accentColor: string;
  };
}

export default function SettingsPage() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => api.get<MeResponse>("/api/auth/me") });
  const { theme } = useTheme();
  const { accent } = useAccent();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("PHP");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name);
      setCurrency(data.user.currency);
    }
  }, [data]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/api/v1/settings", { name, currency });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function saveAppearance() {
    await api.patch("/api/v1/settings", { themeMode: theme, accentColor: accent });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl text-ink">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={data?.user.email ?? ""} disabled />
              <p className="mt-1 text-xs text-ink-muted">This is your login username, set during setup.</p>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="PHP">PHP — Philippine Peso</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="SGD">SGD — Singapore Dollar</option>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </Button>
              {saved && <span className="text-sm text-positive">Saved.</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Theme</Label>
            <ThemeToggle />
          </div>
          <div>
            <Label>Accent color</Label>
            <AccentPicker onChange={saveAppearance} />
          </div>
          <p className="text-xs text-ink-muted">
            Your theme and accent are remembered on this device instantly, and saved to your account
            so they follow you if you sign in elsewhere.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
