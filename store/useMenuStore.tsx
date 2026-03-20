// store/useMenuStore.ts
import { create } from "zustand";

type MenuState = {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (
    value: boolean | ((prev: boolean) => boolean)
  ) => void;
};

export const useMenuStore = create<MenuState>((set) => ({
    isMobileMenuOpen: false,
    setIsMobileMenuOpen: (value) =>
      set((state) => ({
        isMobileMenuOpen:
          typeof value === "function"
            ? value(state.isMobileMenuOpen)
            : value,
      })),
}));