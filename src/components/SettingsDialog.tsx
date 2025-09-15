"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettingsStore } from "@/stores/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Palette, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function SettingsDialog() {
  const { open, closeSettings } = useSettingsStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "light" || detail === "dark" || detail === "system") {
        setTheme(detail);
      }
    };
    document.addEventListener("avai:set-theme", handler as EventListener);
    return () => document.removeEventListener("avai:set-theme", handler as EventListener);
  }, [setTheme]);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : closeSettings())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient-cyber">
            <Palette className="h-5 w-5" />
            Appearance Settings
          </DialogTitle>
          <DialogDescription>
            Choose how AVAI looks on your device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Theme</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1" onClick={() => document.dispatchEvent(new CustomEvent("avai:set-theme", { detail: "light" }))}>
                <Sun className="h-4 w-4 mr-2" /> Light
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => document.dispatchEvent(new CustomEvent("avai:set-theme", { detail: "dark" }))}>
                <Moon className="h-4 w-4 mr-2" /> Dark
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => document.dispatchEvent(new CustomEvent("avai:set-theme", { detail: "system" }))}>
                <Monitor className="h-4 w-4 mr-2" /> System
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">You can change this anytime in Settings.</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Quick Toggle</div>
            <div>
              <ThemeToggle variant="button" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
