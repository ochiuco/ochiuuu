import { create } from 'zustand';

interface AuthState {
  email: string | null;
  isMember: boolean;
  isLoggedIn: boolean;
  wishlistIds: string[];
  _wishlistFetched: boolean;
  login: (email: string, isMember?: boolean) => void;
  logout: () => void;
  hydrate: () => void;
  setMember: (isMember: boolean) => void;
  fetchWishlist: () => Promise<void>;
  addWishlistId: (productId: string) => void;
  removeWishlistId: (productId: string) => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  email: null,
  isMember: false,
  isLoggedIn: false,
  wishlistIds: [],
  _wishlistFetched: false,
  login: (email: string, isMember?: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ochiu_auth_email', email);
      localStorage.setItem('ochiu_auth_is_member', isMember ? '1' : '0');
    }
    set({ email, isLoggedIn: true, isMember: !!isMember, _wishlistFetched: false });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ochiu_auth_email');
      localStorage.removeItem('ochiu_auth_is_member');
    }
    set({ email: null, isLoggedIn: false, isMember: false, wishlistIds: [], _wishlistFetched: false });
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ochiu_auth_email');
      const memberFlag = localStorage.getItem('ochiu_auth_is_member');
      if (stored) {
        set({ email: stored, isLoggedIn: true, isMember: memberFlag === '1' });
      }
    }
  },
  setMember: (isMember: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ochiu_auth_is_member', isMember ? '1' : '0');
    }
    set({ isMember });
  },
  fetchWishlist: async () => {
    const { email, _wishlistFetched } = get();
    if (!email || _wishlistFetched) return;
    try {
      set({ _wishlistFetched: true });
      const res = await fetch(`/api/wishlist?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const ids = data.map((item: any) => item.productId);
          set({ wishlistIds: ids });
        }
      }
    } catch {
      // silently fail but allow retry
      set({ _wishlistFetched: false });
    }
  },
  addWishlistId: (productId: string) => {
    set((state) => ({
      wishlistIds: state.wishlistIds.includes(productId)
        ? state.wishlistIds
        : [...state.wishlistIds, productId],
    }));
  },
  removeWishlistId: (productId: string) => {
    set((state) => ({
      wishlistIds: state.wishlistIds.filter((id) => id !== productId),
    }));
  },
}));

export default useAuthStore;