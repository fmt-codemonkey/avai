"use client";

import { create } from "zustand";

type SettingsState = {
  open: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  openSettings: () => set({ open: true }),
  closeSettings: () => set({ open: false }),
  toggleSettings: () => set((s) => ({ open: !s.open })),
}));
