"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccentPicker } from "@/components/theme/accent-picker";

interface MeResponse {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    currency: string;
    themeMode: string;
    accentColor: string;
  };
}

export default function SettingsPage() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => api.get<MeResponse>("/api/auth/me") });

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

  // The picker/toggle pass the *new* value — reading it from context here
  // would still see the previous one during this render.
  async function saveAccent(hex: string) {
    await api.patch("/api/v1/settings", { accentColor: hex });
  }

  async function saveThemeMode(mode: string) {
    await api.patch("/api/v1/settings", { themeMode: mode });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-bold text-accent">Account</p>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Settings</h1>
      </div>

      <Card id="profile" className="scroll-mt-20">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={data?.user.username ?? ""} disabled />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={data?.user.email ?? ""} disabled />
              </div>
            </div>
            <p className="-mt-2 text-xs text-ink-faint">You can sign in with either one.</p>
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
              {saved && <span className="gw-fade text-sm font-semibold text-positive">Saved.</span>}
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
            <ThemeToggle onChange={saveThemeMode} className="max-w-sm" />
          </div>
          <div>
            <Label>Accent color</Label>
            <div className="max-w-sm">
              <AccentPicker onChange={saveAccent} />
            </div>
          </div>
          <p className="text-xs text-ink-faint">
            Changes apply instantly and are saved to your account, so they follow you to other devices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
