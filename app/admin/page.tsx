// app/admin/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Archive,
  Lock,
  LogOut,
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  X,
  Search,
  Mail,
  Phone,
  MapPin,
  Store,
  Ruler,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  Pencil,
  Tag,
  Ticket,
  Crown,
} from 'lucide-react';
import ProductEditorModal, { AdminProduct } from '@/components/admin/ProductEditorModal';

/* ====== 尺碼指南類型 ====== */
interface SizeGuideData {
  headers: string[];
  rows: string[][];
  notes: string[];
}

/* 各分類預設模板 */
const CATEGORY_TEMPLATES: Record<string, SizeGuideData> = {
  tops: {
    headers: ['尺碼', '胸圍 (cm)', '肩寬 (cm)', '衣長 (cm)'],
    rows: [
      ['XS', '', '', ''],
      ['S', '', '', ''],
      ['M', '', '', ''],
      ['L', '', '', ''],
      ['XL', '', '', ''],
    ],
    notes: ['以上尺寸為平鋪測量，可能存在 1-2cm 誤差', '如在兩個尺碼之間，建議選擇較大的尺碼'],
  },
  bottoms: {
    headers: ['尺碼', '腰圍 (cm)', '臀圍 (cm)', '褲長 (cm)', '褲腳寬 (cm)'],
    rows: [
      ['XS', '', '', '', ''],
      ['S', '', '', '', ''],
      ['M', '', '', '', ''],
      ['L', '', '', '', ''],
      ['XL', '', '', '', ''],
    ],
    notes: ['以上尺寸為平鋪測量，可能存在 1-2cm 誤差', '如在兩個尺碼之間，建議選擇較大的尺碼'],
  },
  outerwear: {
    headers: ['尺碼', '胸圍 (cm)', '肩寬 (cm)', '衣長 (cm)', '袖長 (cm)'],
    rows: [
      ['XS', '', '', '', ''],
      ['S', '', '', '', ''],
      ['M', '', '', '', ''],
      ['L', '', '', '', ''],
      ['XL', '', '', '', ''],
    ],
    notes: ['以上尺寸為平鋪測量，可能存在 1-2cm 誤差', '如在兩個尺碼之間，建議選擇較大的尺碼'],
  },
  accessories: {
    headers: ['尺碼', '尺寸 (cm)', '備註'],
    rows: [
      ['Free', '', ''],
    ],
    notes: ['尺寸僅供參考'],
  },
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 訂單管理
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products' | 'promo' | 'members'>('stats');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('pending_payment');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // 搜索
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // 順豐發貨彈窗狀態
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipOrderId, setShipOrderId] = useState<string | null>(null);
  const [shipOrderNumber, setShipOrderNumber] = useState<string>('');
  const [shipTrackingNumber, setShipTrackingNumber] = useState('');
  const [shipLoading, setShipLoading] = useState(false);

  // 發送收據郵件
  const [sendingReceiptOrderId, setSendingReceiptOrderId] = useState<string | null>(null);

  // 商品管理
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [sizeGuideEditor, setSizeGuideEditor] = useState<SizeGuideData>({ headers: [], rows: [], notes: [] });
  const [savingGuide, setSavingGuide] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // 商品編輯器
  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const [editingProductData, setEditingProductData] = useState<AdminProduct | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [syncingRewards, setSyncingRewards] = useState(false);

  // 優惠碼管理
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountPercent: '10',
    discountAmountHkd: '',
    minOrderAmountHkd: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
  });
  const [savingPromo, setSavingPromo] = useState(false);

  // 會員管理
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Toast 通知
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ochiu_admin_token');
  };

  const setToken = (token: string) => {
    localStorage.setItem('ochiu_admin_token', token);
  };

  const clearToken = () => {
    localStorage.removeItem('ochiu_admin_token');
  };

  /**
   * 判斷訂單是否為門市自取
   */
  const isOrderSelfPickup = (order: any): boolean => {
    const method = (order.shippingMethod || '').toLowerCase().trim();
    return (
      method === 'store_pickup' || 
      method === 'pickup' ||
      method === 'self_pickup' ||
      method === 'self-pickup' ||
      method.includes('自取') ||
      method.includes('門市')
    );
  };

  const fetchStats = useCallback(async (token: string) => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(45000),
      });
      if (res.status === 401 || res.status === 403) {
        clearToken();
        setIsAuthenticated(false);
        setStats(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatsError(data.error || `載入失敗 (${res.status})`);
        return;
      }
      const data = await res.json();
      setStats(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      const timedOut = err instanceof Error && err.name === 'TimeoutError';
      setStatsError(timedOut ? '統計載入逾時，請稍後再試' : '網路錯誤，無法載入統計');
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (status?: string, search?: string) => {
    const token = getToken();
    if (!token) return;

    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && !search) params.set('status', status);
      if (search) params.set('search', search.trim());

      const url = `/api/admin/orders?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      fetchOrders(undefined, searchQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    fetchOrders(orderFilter);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    const token = getToken();
    if (!token) return;

    setUpdatingOrderId(orderId);
    try {
      const payload: Record<string, string> = { orderId, status: newStatus };
      if (trackingNumber) {
        payload.trackingNumber = trackingNumber;
      }

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (newStatus === 'paid') {
          showToast('已確認付款，收據郵件已自動發送給客戶');
        } else if (newStatus === 'ready_for_pickup') {
          showToast('已標記為備妥，綠色主題自取通知郵件已自動發送給客戶');
        } else if (newStatus === 'shipped') {
          showToast('已標記為已發貨，藍色主題順豐發貨通知郵件已自動發送給客戶');
        }
        if (isSearchMode) {
          fetchOrders(undefined, searchQuery.trim());
        } else {
          await fetchOrders(orderFilter);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // 手動發送收據郵件
  const handleSendReceipt = async (orderId: string) => {
    const token = getToken();
    if (!token) return;

    setSendingReceiptOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/send-receipt`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showToast('收據郵件已成功發送');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || '發送郵件失敗', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('網絡錯誤，發送失敗', 'error');
    } finally {
      setSendingReceiptOrderId(null);
    }
  };

  // 獲取全部商品（含尺碼指南）
  const fetchAdminProducts = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setProductsLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminProducts(data.products ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // 打開指定商品的尺碼指南編輯器
  const openSizeGuideEditor = (product: any) => {
    setEditingProduct(product);
    const sg = product.sizeGuide;
    if (sg && Array.isArray(sg.headers) && Array.isArray(sg.rows)) {
      setSizeGuideEditor({
        headers: [...sg.headers],
        rows: sg.rows.map((r: string[]) => [...r]),
        notes: Array.isArray(sg.notes) ? [...sg.notes] : [],
      });
    } else {
      // 根據分類套用預設模板
      const tmpl = CATEGORY_TEMPLATES[product.category] ?? CATEGORY_TEMPLATES.tops;
      setSizeGuideEditor({
        headers: [...tmpl.headers],
        rows: tmpl.rows.map((r) => [...r]),
        notes: [...tmpl.notes],
      });
    }
  };

  // 載入分類模板（覆蓋當前編輯中的內容）
  const applyTemplate = (category: string) => {
    const tmpl = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES.tops;
    setSizeGuideEditor({
      headers: [...tmpl.headers],
      rows: tmpl.rows.map((r) => [...r]),
      notes: [...tmpl.notes],
    });
  };

  // 儲存尺碼指南
  const saveSizeGuide = async () => {
    if (!editingProduct) return;
    const token = getToken();
    if (!token) return;
    setSavingGuide(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: editingProduct.id, sizeGuide: sizeGuideEditor }),
      });
      if (res.ok) {
        showToast('尺碼指南已儲存');
        setEditingProduct(null);
        fetchAdminProducts();
      } else {
        showToast('儲存失敗', 'error');
      }
    } catch {
      showToast('網絡錯誤', 'error');
    } finally {
      setSavingGuide(false);
    }
  };

  const openProductEditor = (product?: AdminProduct) => {
    setEditingProductData(product ?? null);
    setProductEditorOpen(true);
  };

  const handleSaveProduct = async (payload: Record<string, unknown>) => {
    const token = getToken();
    if (!token) return;
    setSavingProduct(true);
    try {
      const isCreate = !payload.productId;
      const res = await fetch('/api/admin/products', {
        method: isCreate ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(isCreate ? '商品已新增' : '商品已更新');
        setProductEditorOpen(false);
        setEditingProductData(null);
        fetchAdminProducts();
      } else {
        showToast(data.error || '儲存失敗', 'error');
      }
    } catch {
      showToast('網絡錯誤', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('確定要刪除此商品嗎？已有訂單的商品將改為下架。')) return;
    const token = getToken();
    if (!token) return;
    setSavingProduct(true);
    try {
      const res = await fetch(`/api/admin/products?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(data.message || '商品已刪除');
        setProductEditorOpen(false);
        setEditingProductData(null);
        fetchAdminProducts();
      } else {
        showToast(data.error || '刪除失敗', 'error');
      }
    } catch {
      showToast('網絡錯誤', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSyncMemberRewards = async () => {
    const token = getToken();
    if (!token) return;
    setSyncingRewards(true);
    try {
      const res = await fetch('/api/admin/members/sync-rewards', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(data.message || '同步完成');
        await fetchStats(token);
      } else {
        showToast(data.error || '同步失敗', 'error');
      }
    } catch {
      showToast('網絡錯誤', 'error');
    } finally {
      setSyncingRewards(false);
    }
  };

  const fetchPromoCodes = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setPromoLoading(true);
    try {
      const res = await fetch('/api/admin/promo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data.promoCodes ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPromoLoading(false);
    }
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSavingPromo(true);
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...promoForm,
          maxUses: promoForm.maxUses || null,
          minOrderAmountHkd: promoForm.minOrderAmountHkd || null,
          expiresAt: promoForm.expiresAt || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('優惠碼已創建');
        setShowPromoForm(false);
        setPromoForm({
          code: '',
          discountType: 'PERCENTAGE',
          discountPercent: '10',
          discountAmountHkd: '',
          minOrderAmountHkd: '',
          maxUses: '',
          expiresAt: '',
          isActive: true,
        });
        fetchPromoCodes();
      } else {
        showToast(data.error || '創建失敗', 'error');
      }
    } catch {
      showToast('網絡錯誤', 'error');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromo = async (id: string, isActive: boolean) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, isActive }),
      });
      if (res.ok) {
        showToast(isActive ? '優惠碼已啟用' : '優惠碼已停用');
        fetchPromoCodes();
      }
    } catch {
      showToast('操作失敗', 'error');
    }
  };

  const fetchAdminUsers = useCallback(async (search?: string) => {
    const token = getToken();
    if (!token) return;
    setUsersLoading(true);
    try {
      const params = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/admin/users${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleToggleMember = async (userId: string, isMember: boolean) => {
    const token = getToken();
    if (!token) return;
    setUpdatingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, isMember }),
      });
      if (res.ok) {
        showToast(isMember ? '已設為永久會員' : '已取消永久會員');
        fetchAdminUsers(userSearch);
        const t = getToken();
        if (t) fetchStats(t);
      } else {
        showToast('更新失敗', 'error');
      }
    } catch {
      showToast('網絡錯誤', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // 打開順豐發貨彈窗
  const openShipModal = (orderId: string, orderNumber: string) => {
    setShipOrderId(orderId);
    setShipOrderNumber(orderNumber);
    setShipTrackingNumber('');
    setShowShipModal(true);
  };

  // 門市自取：一鍵標記備妥（綠色按鈕，狀態更新為 ready_for_pickup）
  const handleMarkReadyForPickup = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'ready_for_pickup');
  };

  // 順豐發貨：確認發貨（藍色按鈕，輸入單號後狀態更新為 shipped）
  const handleConfirmSFShip = async () => {
    if (!shipOrderId) return;
    if (!shipTrackingNumber.trim()) {
      showToast('請輸入順豐快遞單號', 'error');
      return;
    }

    setShipLoading(true);
    await handleUpdateOrderStatus(shipOrderId, 'shipped', shipTrackingNumber.trim());
    setShipLoading(false);
    setShowShipModal(false);
    setShipOrderId(null);
    setShipOrderNumber('');
    setShipTrackingNumber('');
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchStats(token);
    } else {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders' && !isSearchMode) {
      fetchOrders(orderFilter);
    }
    if (isAuthenticated && activeTab === 'products') {
      fetchAdminProducts();
    }
    if (isAuthenticated && activeTab === 'promo') {
      fetchPromoCodes();
    }
    if (isAuthenticated && activeTab === 'members') {
      fetchAdminUsers(userSearch);
    }
  }, [isAuthenticated, activeTab, orderFilter, fetchOrders, isSearchMode, fetchAdminProducts, fetchPromoCodes, fetchAdminUsers, userSearch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || '登入失敗');
        return;
      }
      setToken(data.token);
      setIsAuthenticated(true);
      await fetchStats(data.token);
    } catch {
      setLoginError('網路錯誤，請稍後再試');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
    setStats(null);
    setStatsError('');
    setStatsLoading(false);
    setUsername('');
    setPassword('');
    setOrders([]);
  };

  // ============ 載入中 ============
  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ============ 登入頁面 ============
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-medium tracking-widest">管理後台</h1>
              <p className="text-xs text-gray-400 tracking-wider mt-2">
                請輸入管理員帳號登入
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 tracking-wider mb-2">
                  帳號
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 tracking-wider mb-2">
                  密碼
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-500 tracking-wider">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading || !username.trim() || !password}
                className="w-full py-3 bg-black text-white text-sm tracking-widest font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loginLoading ? '驗證中...' : '登入'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ============ 數據頁面（統計載入中/失敗改在 Tab 內顯示，不再誤報失敗）============

  const statusLabels: Record<string, string> = {
    pending_payment: '待付款',
    paid: '已付款',
    ready_for_pickup: '待取貨',
    shipped: '已發貨',
    delivered: '已送達',
    cancelled: '已取消',
  };

  const paymentMethodLabels: Record<string, string> = {
    card: '信用卡',
    alipay: '支付寶',
    alipay_hk: '香港支付寶',
    wechat_pay: '微信支付',
    fps: 'FPS 轉數快',
    payme: 'PayMe',
  };

  const shippingMethodLabels: Record<string, string> = {
    store_pickup: '門市自取',
    pickup: '門市自取',
    self_pickup: '門市自取',
    'self-pickup': '門市自取',
    sf_locker: '順豐自提櫃',   
    sf_delivery: '順豐到家',
    sf_express: '順豐速遞',
    standard: '標準配送',
    delivery: '物流配送',
  };

  const getShippingMethodDisplay = (order: any): string => {
    const method = order.shippingMethod || '';
    if (!method) return '—';
    const normalized = method.toLowerCase().trim();
    if (shippingMethodLabels[normalized]) return shippingMethodLabels[normalized];
    if (normalized.includes('自取') || normalized.includes('門市')) return '門市自取';
    if (normalized.includes('順豐') || normalized.includes('sf')) return '順豐速遞';
    return method;
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* 標題 */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-widest text-gray-900">
              後台管理
            </h1>
            <p className="mt-2 text-sm text-gray-400 tracking-wider">
              銷量統計與訂單管理
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-black transition-colors border border-gray-200 px-4 py-2 rounded hover:border-black"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="tracking-wider">登出</span>
          </button>
        </div>

        {/* Tab 切換 */}
        <div className="flex gap-1 mb-8 bg-white rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-2.5 text-xs tracking-widest rounded transition-colors ${
              activeTab === 'stats'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            數據統計
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 text-xs tracking-widest rounded transition-colors ${
              activeTab === 'orders'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            訂單管理
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 text-xs tracking-widest rounded transition-colors ${
              activeTab === 'products'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            商品管理
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className={`px-5 py-2.5 text-xs tracking-widest rounded transition-colors ${
              activeTab === 'promo'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            優惠碼
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-5 py-2.5 text-xs tracking-widest rounded transition-colors ${
              activeTab === 'members'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            會員管理
          </button>
        </div>

        {/* ============ 訂單管理 Tab ============ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* 搜索框 */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="輸入訂單編號搜尋..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm tracking-wide border border-gray-200 rounded focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                  className="px-5 py-2.5 text-xs tracking-widest bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  搜尋
                </button>
                {isSearchMode && (
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2.5 text-xs tracking-widest border border-gray-200 text-gray-600 rounded hover:border-black hover:text-black transition-colors"
                  >
                    清除
                  </button>
                )}
              </div>
              {isSearchMode && (
                <p className="mt-3 text-xs text-gray-400 tracking-wider">
                  搜尋結果：找到 {orders.length} 筆相關訂單
                </p>
              )}
            </div>

            {/* 狀態篩選（非搜索模式才顯示） */}
            {!isSearchMode && (
              <div className="flex flex-wrap gap-2">
                {['pending_payment', 'paid', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setOrderFilter(s)}
                    className={`px-4 py-2 text-xs tracking-wider rounded border transition-colors ${
                      orderFilter === s
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                    }`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            )}

            {/* 刷新按鈕 */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (isSearchMode) {
                    fetchOrders(undefined, searchQuery.trim());
                  } else {
                    fetchOrders(orderFilter);
                  }
                }}
                disabled={ordersLoading}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-black transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span className="tracking-wider">刷新</span>
              </button>
            </div>

            {/* 訂單列表 */}
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 tracking-wider">
                  {isSearchMode
                    ? '找不到匹配的訂單'
                    : `沒有「${statusLabels[orderFilter]}」狀態的訂單`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isSelfPickup = isOrderSelfPickup(order);

                  return (
                    <div key={order.id} className="bg-white rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-sm font-mono font-medium tracking-wider">
                              {order.orderNumber}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-wider rounded-full ${
                              order.status === 'pending_payment' ? 'bg-amber-50 text-amber-700' :
                              order.status === 'paid' ? 'bg-green-50 text-green-700' :
                              order.status === 'ready_for_pickup' ? 'bg-emerald-50 text-emerald-700' :
                              order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                              order.status === 'delivered' ? 'bg-gray-100 text-gray-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                              {order.status === 'pending_payment' && <Clock className="w-3 h-3" />}
                              {order.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                              {order.status === 'ready_for_pickup' && <Store className="w-3 h-3" />}
                              {order.status === 'shipped' && <Truck className="w-3 h-3" />}
                              {order.status === 'delivered' && <Package className="w-3 h-3" />}
                              {order.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                              {statusLabels[order.status] || order.status}
                            </span>
                            {/* 配送方式標籤 */}
                            {order.shippingMethod && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-wider rounded-full ${
                                isSelfPickup
                                  ? 'bg-orange-50 text-orange-700'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {isSelfPickup ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                                {getShippingMethodDisplay(order)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-400 tracking-wider">
                            <span>{new Date(order.createdAt).toLocaleString('zh-HK')}</span>
                            <span>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium tracking-wider">
                            HK$ {(order.totalAmount / 100).toFixed(2)}
                          </p>
                          <p className="text-[11px] text-gray-400 tracking-wider">
                            {order.items?.length || 0} 件商品
                          </p>
                        </div>
                      </div>

                      {/* 客戶信息與配送地址 */}
                      <div className="border-t border-gray-100 pt-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-start gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] text-gray-400 tracking-wider">聯絡郵箱</p>
                              <p className="text-xs text-gray-700 tracking-wider break-all">
                                {order.email || '—'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] text-gray-400 tracking-wider">聯絡電話</p>
                              <p className="text-xs text-gray-700 tracking-wider">
                                {order.phone || '—'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] text-gray-400 tracking-wider">
                                {isSelfPickup ? '取貨方式' : '收件地址'}
                              </p>
                              <p className="text-xs text-gray-700 tracking-wider">
                                {isSelfPickup ? (
                                  <span className="text-orange-700 font-medium">門市自取 — 荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房</span>
                                ) : (
                                  <>
                                    {order.shippingName && <span className="font-medium">{order.shippingName}</span>}
                                    {order.shippingName && <br />}
                                    {[order.shippingAddress, order.shippingDistrict, order.shippingCity]
                                      .filter(Boolean)
                                      .join(', ') || '—'}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 訂單商品明細 */}
                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-gray-100 pt-3 mb-4">
                          <div className="space-y-2">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between text-xs text-gray-600">
                                <span className="tracking-wider">
                                  {item.name} · {item.color} / {item.size} × {item.quantity}
                                  {item.hemming && ' (修褲腳)'}
                                </span>
                                <span className="tracking-wider">
                                  HK$ {((item.price + item.hemmingFee) * item.quantity / 100).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 物流單號顯示（僅順豐訂單且已有單號時顯示） */}
                      {order.trackingNumber && !isSelfPickup && (
                        <div className="border-t border-gray-100 pt-3 mb-4">
                          <div className="flex items-center gap-2 text-xs">
                            <Truck className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-gray-500 tracking-wider">順豐單號：</span>
                            <span className="font-mono font-medium text-gray-800 tracking-wider">
                              {order.trackingNumber}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* ============ 操作按鈕（動態化渲染）============ */}
                      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        {/* 待付款 → 確認已付款 */}
                        {order.status === 'pending_payment' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'paid')}
                            disabled={updatingOrderId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-wider bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {updatingOrderId === order.id ? '處理中...' : '確認已付款'}
                          </button>
                        )}

                        {/* 已付款 + 門市自取 → 綠色「標記備妥」按鈕 */}
                        {order.status === 'paid' && isSelfPickup && (
                          <button
                            onClick={() => handleMarkReadyForPickup(order.id)}
                            disabled={updatingOrderId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-xs tracking-wider bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                          >
                            <Store className="w-4 h-4" />
                            {updatingOrderId === order.id ? '處理中...' : '標記備妥'}
                          </button>
                        )}

                        {/* 已付款 + 順豐派送 → 藍色「順豐發貨」按鈕 */}
                        {order.status === 'paid' && !isSelfPickup && (
                          <button
                            onClick={() => openShipModal(order.id, order.orderNumber)}
                            disabled={updatingOrderId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-xs tracking-wider bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                          >
                            <Truck className="w-4 h-4" />
                            {updatingOrderId === order.id ? '處理中...' : '順豐發貨'}
                          </button>
                        )}

                        {/* 待取貨 → 確認已取貨 */}
                        {order.status === 'ready_for_pickup' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            disabled={updatingOrderId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-wider bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            <Package className="w-3.5 h-3.5" />
                            {updatingOrderId === order.id ? '處理中...' : '確認已取貨'}
                          </button>
                        )}

                        {/* 已發貨（順豐）→ 標記已送達 */}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            disabled={updatingOrderId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-wider bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            <Package className="w-3.5 h-3.5" />
                            {updatingOrderId === order.id ? '處理中...' : '標記已送達'}
                          </button>
                        )}

                        {/* 取消訂單按鈕 */}
                        {(order.status === 'pending_payment' || order.status === 'paid') && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            disabled={updatingOrderId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-wider border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            取消訂單
                          </button>
                        )}

                        {/* 手動發送收據郵件按鈕 — 已付款及之後的狀態皆可發送 */}
                        {order.status !== 'pending_payment' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleSendReceipt(order.id)}
                            disabled={sendingReceiptOrderId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-wider border border-gray-200 text-gray-700 rounded hover:border-black hover:text-black transition-colors disabled:opacity-50 ml-auto"
                          >
                            {sendingReceiptOrderId === order.id ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                發送中...
                              </>
                            ) : (
                              <>
                                <Mail className="w-3.5 h-3.5" />
                                發送收據
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ 商品管理 Tab ============ */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-gray-400 tracking-wider">
                共 {adminProducts.length} 件商品 — 資料即時讀寫 PostgreSQL，前台商品列表同步更新
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openProductEditor()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增商品
                </button>
                <button
                  onClick={fetchAdminProducts}
                  disabled={productsLoading}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin' : ''}`} />
                  <span className="tracking-wider">刷新</span>
                </button>
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            ) : adminProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 tracking-wider">暫無商品</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminProducts.map((product) => {
                  const hasSizeGuide = product.sizeGuide &&
                    Array.isArray((product.sizeGuide as any).headers) &&
                    (product.sizeGuide as any).headers.length > 0;
                  const isExpanded = expandedProductId === product.id;
                  const sg = product.sizeGuide as any;
                  const categoryLabels: Record<string, string> = {
                    tops: '上衣', bottoms: '下裝', outerwear: '外套', accessories: '配飾',
                  };

                  return (
                    <div key={product.id} className="bg-white rounded-xl overflow-hidden">
                      {/* 商品行 */}
                      <div className="flex items-center gap-4 p-5">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-16 object-cover rounded flex-shrink-0 bg-gray-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium tracking-wider truncate">{product.name}</p>
                          <p className="text-xs text-gray-400 tracking-wider mt-0.5">
                            {categoryLabels[product.category] || product.category}
                            {product.priceHkd != null && ` · HK$ ${product.priceHkd}`}
                            {product.stockTotal != null && ` · 庫存 ${product.stockTotal}`}
                            {product.sizes?.length > 0 && ` · ${product.sizes.join(' / ')}`}
                          </p>
                          {!product.isActive && (
                            <span className="text-[10px] text-red-500 tracking-wider">已下架</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                          <span className={`text-[10px] tracking-wider px-2 py-0.5 rounded-full ${
                            hasSizeGuide
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {hasSizeGuide ? '已設定' : '未設定'}
                          </span>
                          {hasSizeGuide && (
                            <button
                              onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                              className="p-1 text-gray-400 hover:text-black transition-colors"
                              title="預覽"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                          <button
                            onClick={() => openProductEditor(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider border border-gray-200 rounded hover:border-black transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            編輯
                          </button>
                          <button
                            onClick={() => openSizeGuideEditor(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider bg-black text-white rounded hover:bg-gray-800 transition-colors"
                          >
                            <Ruler className="w-3.5 h-3.5" />
                            尺碼指南
                          </button>
                        </div>
                      </div>

                      {/* 預覽展開區 */}
                      {isExpanded && hasSizeGuide && (
                        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                          <p className="text-[10px] tracking-widest text-gray-400 mb-3">目前已儲存的尺碼指南</p>
                          <div className="overflow-x-auto">
                            <table className="text-xs w-auto min-w-full">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  {sg.headers?.map((h: string, i: number) => (
                                    <th key={i} className={`pb-2 font-normal text-gray-500 tracking-wider whitespace-nowrap ${i === 0 ? 'text-left pr-6' : 'text-center px-3'}`}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sg.rows?.map((row: string[], ri: number) => (
                                  <tr key={ri} className="border-b border-gray-50">
                                    {row.map((cell: string, ci: number) => (
                                      <td key={ci} className={`py-1.5 ${ci === 0 ? 'font-medium pr-6' : 'text-center text-gray-600 px-3'}`}>
                                        {cell || '—'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {sg.notes?.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {sg.notes.map((note: string, i: number) => (
                                <p key={i} className="text-[10px] text-gray-400 tracking-wider">• {note}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ 優惠碼 Tab ============ */}
        {activeTab === 'promo' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
              <p className="font-medium mb-1">內建優惠碼（OCHIU、ARIA、CHLOE 等）在程式中固定設定，無需在此管理。</p>
              <p>此處管理的是資料庫優惠碼，可新增自訂折扣碼、設定有效期和使用次數。</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 tracking-wider">共 {promoCodes.length} 個資料庫優惠碼</p>
              <button
                onClick={() => setShowPromoForm(!showPromoForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider bg-black text-white rounded hover:bg-gray-800"
              >
                <Plus className="w-3.5 h-3.5" />
                新增優惠碼
              </button>
            </div>
            {showPromoForm && (
              <form onSubmit={handleCreatePromo} className="bg-white rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-gray-500">優惠碼 *</span>
                  <input required value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none" placeholder="SUMMER20" />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-500">折扣類型</span>
                  <select value={promoForm.discountType} onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })} className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded bg-white focus:border-black focus:outline-none">
                    <option value="PERCENTAGE">百分比折扣</option>
                    <option value="FIXED">固定金額減免</option>
                  </select>
                </label>
                {promoForm.discountType === 'PERCENTAGE' ? (
                  <label className="block">
                    <span className="text-xs text-gray-500">折扣 (%)</span>
                    <input type="number" min="1" max="100" value={promoForm.discountPercent} onChange={(e) => setPromoForm({ ...promoForm, discountPercent: e.target.value })} className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none" />
                  </label>
                ) : (
                  <label className="block">
                    <span className="text-xs text-gray-500">減免金額 (HK$)</span>
                    <input type="number" min="1" value={promoForm.discountAmountHkd} onChange={(e) => setPromoForm({ ...promoForm, discountAmountHkd: e.target.value })} className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none" />
                  </label>
                )}
                <label className="block">
                  <span className="text-xs text-gray-500">最低消費 (HK$，留空=無門檻)</span>
                  <input type="number" min="0" value={promoForm.minOrderAmountHkd} onChange={(e) => setPromoForm({ ...promoForm, minOrderAmountHkd: e.target.value })} className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-500">最多使用次數（留空=不限）</span>
                  <input type="number" min="1" value={promoForm.maxUses} onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })} className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-500">到期日（留空=永不過期）</span>
                  <input type="date" value={promoForm.expiresAt} onChange={(e) => setPromoForm({ ...promoForm, expiresAt: e.target.value })} className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none" />
                </label>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowPromoForm(false)} className="px-4 py-2 text-xs border border-gray-200 rounded">取消</button>
                  <button type="submit" disabled={savingPromo} className="px-4 py-2 text-xs bg-black text-white rounded disabled:opacity-50">{savingPromo ? '創建中...' : '創建'}</button>
                </div>
              </form>
            )}
            {promoLoading ? (
              <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="text-left p-4 font-normal">優惠碼</th>
                      <th className="text-left p-4 font-normal">折扣</th>
                      <th className="text-left p-4 font-normal">已用/上限</th>
                      <th className="text-left p-4 font-normal">到期</th>
                      <th className="text-right p-4 font-normal">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="p-4 font-mono font-medium">{p.code}</td>
                        <td className="p-4">{p.discountValueDisplay}</td>
                        <td className="p-4 text-gray-500">{p.usedCount}{p.maxUses ? ` / ${p.maxUses}` : ' / ∞'}</td>
                        <td className="p-4 text-gray-500">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('zh-HK') : '—'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleTogglePromo(p.id, !p.isActive)} className={`text-xs px-3 py-1 rounded ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.isActive ? '啟用中' : '已停用'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {promoCodes.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400 text-xs tracking-wider">暫無資料庫優惠碼</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============ 會員管理 Tab ============ */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 leading-relaxed space-y-1">
              <p><strong>註冊用戶</strong>：有帳號的所有人 · <strong>永久會員</strong>：享 9 折（單筆 ≥$800 或累計 ≥$1,500 自動升級）</p>
              <p>積分規則：每消費 HK$1 = 1 積分（付款成功後自動發放）</p>
            </div>
            <div className="flex gap-3">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAdminUsers(userSearch)}
                placeholder="搜尋郵箱、姓名、電話..."
                className="flex-1 border border-gray-200 px-4 py-2 text-sm rounded-lg focus:border-black focus:outline-none"
              />
              <button onClick={() => fetchAdminUsers(userSearch)} className="px-4 py-2 text-xs bg-black text-white rounded-lg">搜尋</button>
            </div>
            {usersLoading ? (
              <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="text-left p-4 font-normal">用戶</th>
                      <th className="text-left p-4 font-normal">積分</th>
                      <th className="text-left p-4 font-normal">訂單數</th>
                      <th className="text-left p-4 font-normal">身份</th>
                      <th className="text-right p-4 font-normal">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50">
                        <td className="p-4">
                          <p className="font-medium tracking-wide">{u.name || '—'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                        </td>
                        <td className="p-4">{u.points}</td>
                        <td className="p-4 text-gray-500">{u._count?.orders ?? 0}</td>
                        <td className="p-4">
                          {u.isMember ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-full"><Crown className="w-3 h-3" />永久會員</span>
                          ) : (
                            <span className="text-xs text-gray-400">普通會員</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            disabled={updatingUserId === u.id}
                            onClick={() => handleToggleMember(u.id, !u.isMember)}
                            className="text-xs px-3 py-1 border border-gray-200 rounded hover:border-black disabled:opacity-50"
                          >
                            {updatingUserId === u.id ? '...' : u.isMember ? '取消永久會員' : '設為永久會員'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {adminUsers.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400 text-xs tracking-wider">暫無用戶</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============ 數據統計 Tab ============ */}
        {activeTab === 'stats' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-gray-400 tracking-wider">
                {statsLoading ? '正在載入統計數據…' : stats ? '數據已更新' : '統計數據'}
              </p>
              <button
                type="button"
                onClick={() => {
                  const token = getToken();
                  if (token) fetchStats(token);
                }}
                disabled={statsLoading}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>

            {statsLoading && !stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                      <div className="h-3 w-16 bg-gray-100 rounded mb-3" />
                      <div className="h-7 w-24 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-4 w-32 bg-gray-100 rounded mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 bg-gray-50 rounded" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {statsError && !statsLoading && (
              <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
                <p className="text-sm text-red-600 tracking-wider mb-2">{statsError}</p>
                <p className="text-xs text-gray-400 tracking-wider mb-4">請檢查網絡後重試</p>
                <button
                  type="button"
                  onClick={() => {
                    const token = getToken();
                    if (token) fetchStats(token);
                  }}
                  className="text-xs tracking-wider border border-gray-200 px-4 py-2 rounded hover:border-black transition-colors"
                >
                  重新載入
                </button>
              </div>
            )}

            {stats && (
          <>
            {/* 總覽卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] text-gray-400 tracking-wider">總收入</span>
                </div>
                <p className="text-xl font-medium tracking-wider">
                  HK$ {(stats.overview.totalRevenue / 100).toLocaleString('zh-HK', { minimumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] text-gray-400 tracking-wider">已付款訂單</span>
                </div>
                <p className="text-xl font-medium tracking-wider">
                  {stats.overview.paidOrders}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  共 {stats.overview.totalOrders} 筆訂單
                </p>
              </div>

              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] text-gray-400 tracking-wider">商品數</span>
                </div>
                <p className="text-xl font-medium tracking-wider">
                  {stats.overview.totalProducts}
                </p>
              </div>

              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Archive className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] text-gray-400 tracking-wider">總庫存</span>
                </div>
                <p className="text-xl font-medium tracking-wider">
                  {stats.overview.totalStock}
                </p>
              </div>

              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] text-gray-400 tracking-wider">永久會員</span>
                </div>
                <p className="text-xl font-medium tracking-wider">
                  {stats.overview.totalMembers}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  共 {stats.overview.totalUsers} 位註冊用戶
                </p>
                <button
                  onClick={handleSyncMemberRewards}
                  disabled={syncingRewards}
                  className="mt-3 text-[10px] tracking-wider text-gray-500 hover:text-black underline underline-offset-2 disabled:opacity-50"
                >
                  {syncingRewards ? '同步中...' : '補同步積分/會員'}
                </button>
              </div>
            </div>

            {/* 分類銷量 */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-medium tracking-widest">分類銷量</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.categorySales as Record<string, number>).map(([category, count]) => {
                  const labels: Record<string, string> = {
                    tops: '上衣',
                    bottoms: '下裝',
                    outerwear: '外套',
                    accessories: '配飾',
                  };
                  return (
                    <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 tracking-wider mb-1">
                        {labels[category] || category}
                      </p>
                      <p className="text-lg font-medium tracking-wider">{count}</p>
                      <p className="text-[10px] text-gray-400">件已售</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 商品銷量排行 */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-medium tracking-widest">商品銷量排行</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-left text-xs tracking-wider text-gray-500 font-normal">排名</th>
                      <th className="pb-3 text-left text-xs tracking-wider text-gray-500 font-normal">商品名稱</th>
                      <th className="pb-3 text-left text-xs tracking-wider text-gray-500 font-normal">分類</th>
                      <th className="pb-3 text-right text-xs tracking-wider text-gray-500 font-normal">單價</th>
                      <th className="pb-3 text-right text-xs tracking-wider text-gray-500 font-normal">已售</th>
                      <th className="pb-3 text-right text-xs tracking-wider text-gray-500 font-normal">庫存</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.products.map((product: any, idx: number) => {
                      const categoryLabels: Record<string, string> = {
                        tops: '上衣',
                        bottoms: '下裝',
                        outerwear: '外套',
                        accessories: '配飾',
                      };
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 text-gray-400 font-mono">{idx + 1}</td>
                          <td className="py-3 font-medium tracking-wider">{product.name}</td>
                          <td className="py-3 text-gray-500">{categoryLabels[product.category] || product.category}</td>
                          <td className="py-3 text-right tracking-wider">HK$ {(product.price / 100).toFixed(0)}</td>
                          <td className="py-3 text-right font-medium">{product.soldCount}</td>
                          <td className="py-3 text-right text-gray-500">{product.stockTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 實際訂單商品銷售明細 */}
            {stats.productSales && stats.productSales.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-medium tracking-widest">訂單商品銷售明細</h2>
                </div>

                <div className="space-y-3">
                  {stats.productSales.map((item: any, idx: number) => {
                    const maxQty = stats.productSales[0]?.totalQuantity || 1;
                    const barWidth = (item.totalQuantity / maxQty) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 w-6 text-right font-mono">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm tracking-wider">{item.name}</span>
                            <span className="text-xs text-gray-500">
                              {item.totalQuantity} 件 · HK$ {(item.totalRevenue / 100).toLocaleString('zh-HK')}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
            )}
          </>
        )}
      </div>

      {/* ============ 順豐發貨彈窗 Modal ============ */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!shipLoading) {
                setShowShipModal(false);
              }
            }}
          />

          {/* 彈窗主體 */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            {/* 關閉按鈕 */}
            <button
              onClick={() => {
                if (!shipLoading) {
                  setShowShipModal(false);
                }
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 標題 */}
            <div className="mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium tracking-widest text-gray-900">
                順豐發貨
              </h3>
              <p className="text-xs text-gray-400 tracking-wider mt-2">
                訂單編號：<span className="font-mono font-medium text-gray-600">{shipOrderNumber}</span>
              </p>
            </div>

            {/* 順豐快遞單號輸入（必填） */}
            <div className="mb-6">
              <label className="block text-xs text-gray-500 tracking-wider mb-2">
                順豐快遞單號 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shipTrackingNumber}
                onChange={(e) => setShipTrackingNumber(e.target.value)}
                placeholder="請輸入順豐快遞單號，如：SF1234567890"
                className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-blue-500 focus:outline-none transition-colors rounded-lg"
                autoFocus
              />
              <p className="text-[11px] text-gray-400 mt-2 tracking-wider">
                輸入單號後，系統將自動發送藍色主題發貨通知郵件給顧客，郵件中包含順豐官網查詢連結。
              </p>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!shipLoading) {
                    setShowShipModal(false);
                  }
                }}
                disabled={shipLoading}
                className="flex-1 py-3 text-sm tracking-widest border border-gray-200 text-gray-600 rounded-lg hover:border-black hover:text-black transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSFShip}
                disabled={shipLoading || !shipTrackingNumber.trim()}
                className="flex-1 py-3 text-sm tracking-widest bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {shipLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    處理中...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    確認發貨
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ 尺碼指南編輯器 Modal ============ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !savingGuide && setEditingProduct(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            {/* 頭部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-base font-medium tracking-wider">設定尺碼指南</h3>
                <p className="text-xs text-gray-400 mt-1 tracking-wider">{editingProduct.name}</p>
              </div>
              <button
                onClick={() => !savingGuide && setEditingProduct(null)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 分類模板快速套用 */}
              <div>
                <p className="text-xs text-gray-500 tracking-wider mb-2">快速套用分類模板</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries({ tops: '上衣', bottoms: '下裝', outerwear: '外套', accessories: '配飾' }).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className={`px-3 py-1.5 text-xs tracking-wider rounded border transition-colors ${
                        editingProduct.category === key
                          ? 'bg-black text-white border-black'
                          : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                      }`}
                    >
                      {label}模板
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 tracking-wider">
                  * 套用模板會覆蓋目前的表格，但不會自動儲存
                </p>
              </div>

              {/* 欄位標題編輯 */}
              <div>
                <p className="text-xs text-gray-500 tracking-wider mb-2">欄位標題</p>
                <div className="flex flex-wrap gap-2">
                  {sizeGuideEditor.headers.map((header, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => {
                          const h = [...sizeGuideEditor.headers];
                          h[idx] = e.target.value;
                          setSizeGuideEditor({ ...sizeGuideEditor, headers: h });
                        }}
                        className="border border-gray-200 px-2 py-1 text-xs tracking-wide w-28 focus:border-black focus:outline-none rounded"
                        placeholder={`欄位 ${idx + 1}`}
                      />
                      {idx > 0 && (
                        <button
                          onClick={() => {
                            const h = sizeGuideEditor.headers.filter((_, i) => i !== idx);
                            const r = sizeGuideEditor.rows.map((row) => row.filter((_, i) => i !== idx));
                            setSizeGuideEditor({ ...sizeGuideEditor, headers: h, rows: r });
                          }}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSizeGuideEditor({
                        ...sizeGuideEditor,
                        headers: [...sizeGuideEditor.headers, ''],
                        rows: sizeGuideEditor.rows.map((r) => [...r, '']),
                      });
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded hover:border-black hover:text-black transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    新增欄
                  </button>
                </div>
              </div>

              {/* 尺碼行編輯 */}
              <div>
                <p className="text-xs text-gray-500 tracking-wider mb-2">尺寸數據（逐行填入）</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {sizeGuideEditor.headers.map((h, i) => (
                          <th key={i} className="pb-2 text-left text-[10px] tracking-wider text-gray-400 font-normal pr-2">
                            {h || `欄位 ${i + 1}`}
                          </th>
                        ))}
                        <th className="pb-2 w-6" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sizeGuideEditor.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="py-1.5 pr-2">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const rows = sizeGuideEditor.rows.map((r, ri) =>
                                    ri === rowIdx
                                      ? r.map((c, ci) => (ci === cellIdx ? e.target.value : c))
                                      : r
                                  );
                                  setSizeGuideEditor({ ...sizeGuideEditor, rows });
                                }}
                                className="border border-gray-200 px-2 py-1 text-xs tracking-wide w-full focus:border-black focus:outline-none rounded"
                                placeholder={cellIdx === 0 ? '尺碼' : '數值'}
                              />
                            </td>
                          ))}
                          <td className="py-1.5">
                            <button
                              onClick={() => {
                                setSizeGuideEditor({
                                  ...sizeGuideEditor,
                                  rows: sizeGuideEditor.rows.filter((_, i) => i !== rowIdx),
                                });
                              }}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => {
                    setSizeGuideEditor({
                      ...sizeGuideEditor,
                      rows: [
                        ...sizeGuideEditor.rows,
                        new Array(sizeGuideEditor.headers.length).fill(''),
                      ],
                    });
                  }}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded px-3 py-1.5 hover:border-black hover:text-black transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  新增尺碼行
                </button>
              </div>

              {/* 備註編輯 */}
              <div>
                <p className="text-xs text-gray-500 tracking-wider mb-2">備註說明</p>
                <div className="space-y-2">
                  {sizeGuideEditor.notes.map((note, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => {
                          const notes = [...sizeGuideEditor.notes];
                          notes[idx] = e.target.value;
                          setSizeGuideEditor({ ...sizeGuideEditor, notes });
                        }}
                        className="flex-1 border border-gray-200 px-3 py-1.5 text-xs tracking-wide focus:border-black focus:outline-none rounded"
                        placeholder="備註文字"
                      />
                      <button
                        onClick={() => setSizeGuideEditor({
                          ...sizeGuideEditor,
                          notes: sizeGuideEditor.notes.filter((_, i) => i !== idx),
                        })}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSizeGuideEditor({ ...sizeGuideEditor, notes: [...sizeGuideEditor.notes, ''] })}
                    className="flex items-center gap-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded px-3 py-1.5 hover:border-black hover:text-black transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    新增備註
                  </button>
                </div>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => !savingGuide && setEditingProduct(null)}
                disabled={savingGuide}
                className="flex-1 py-3 text-sm tracking-widest border border-gray-200 text-gray-600 rounded-lg hover:border-black hover:text-black transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={saveSizeGuide}
                disabled={savingGuide}
                className="flex-1 py-3 text-sm tracking-widest bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingGuide ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    儲存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    儲存尺碼指南
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductEditorModal
        product={editingProductData}
        isOpen={productEditorOpen}
        saving={savingProduct}
        getToken={getToken}
        onClose={() => {
          if (!savingProduct) {
            setProductEditorOpen(false);
            setEditingProductData(null);
          }
        }}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />

      {/* ============ Toast 通知 ============ */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="text-sm tracking-wider">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}