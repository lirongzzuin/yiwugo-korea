import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIState {
  isSearchOverlayOpen: boolean;
  isMobileMenuOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  isBottomSheetOpen: boolean;
  bottomSheetContent: string | null;

  openSearchOverlay: () => void;
  closeSearchOverlay: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  openBottomSheet: (content: string) => void;
  closeBottomSheet: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>()((set) => ({
  isSearchOverlayOpen: false,
  isMobileMenuOpen: false,
  activeModal: null,
  toasts: [],
  isBottomSheetOpen: false,
  bottomSheetContent: null,

  openSearchOverlay: () =>
    set({ isSearchOverlayOpen: true }),

  closeSearchOverlay: () =>
    set({ isSearchOverlayOpen: false }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeMobileMenu: () =>
    set({ isMobileMenuOpen: false }),

  openModal: (modalId) =>
    set({ activeModal: modalId }),

  closeModal: () =>
    set({ activeModal: null }),

  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast: Toast = { id, ...toast };
    const duration = toast.duration ?? 3000;

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openBottomSheet: (content) =>
    set({ isBottomSheetOpen: true, bottomSheetContent: content }),

  closeBottomSheet: () =>
    set({ isBottomSheetOpen: false, bottomSheetContent: null }),
}));
