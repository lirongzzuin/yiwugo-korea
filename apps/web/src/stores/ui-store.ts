import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface UIStore {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toast: { message: '', type: 'info', visible: false },
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set((state) => ({
        toast: { ...state.toast, visible: false },
      }));
    }, 3000);
  },
  hideToast: () =>
    set((state) => ({
      toast: { ...state.toast, visible: false },
    })),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
