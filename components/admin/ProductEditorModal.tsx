"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Trash2, Save, Upload, ImageIcon } from 'lucide-react';

export interface AdminProduct {
  id?: string;
  productNo?: string | null;
  name: string;
  description?: string;
  price?: number;
  priceHkd?: number;
  originalPrice?: number | null;
  originalPriceHkd?: number | null;
  category: string;
  material?: string | null;
  hemService?: boolean;
  sizeInfo?: string | null;
  images?: string[];
  hoverImage?: string | null;
  colors?: { name: string; value: string }[];
  sizes?: string[];
  stock?: Record<string, number>;
  care?: string[];
  details?: string[];
  isActive?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  tag?: string | null;
  colorImages?: Record<string, string[]> | null;
}

interface ProductFormState {
  productNo: string;
  name: string;
  category: string;
  priceHkd: string;
  originalPriceHkd: string;
  description: string;
  material: string;
  sizeInfo: string;
  imagesText: string;
  hoverImage: string;
  careText: string;
  detailsText: string;
  hemService: boolean;
  isActive: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  tag: '' | 'NEW' | 'LIMITED';
  colors: { name: string; value: string }[];
  sizes: string[];
  stock: Record<string, number>;
  colorImages: Record<string, string[]>;
}

interface ProductEditorModalProps {
  product: AdminProduct | null;
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
  getToken: () => string | null;
}

const CATEGORIES = [
  { key: 'tops', label: '上衣' },
  { key: 'bottoms', label: '下裝' },
  { key: 'outerwear', label: '外套' },
  { key: 'accessories', label: '配飾' },
];

const EMPTY_FORM: ProductFormState = {
  productNo: '',
  name: '',
  category: 'tops',
  priceHkd: '',
  originalPriceHkd: '',
  description: '',
  material: '',
  sizeInfo: '',
  imagesText: '',
  hoverImage: '',
  careText: '',
  detailsText: '',
  hemService: false,
  isActive: true,
  isBestSeller: false,
  isNew: false,
  tag: '',
  colors: [{ name: '黑色', value: '#000000' }],
  sizes: ['S', 'M'],
  stock: {},
  colorImages: {},
};

function buildStockKeys(colors: { name: string }[], sizes: string[]) {
  const keys: string[] = [];
  for (const color of colors) {
    if (!color.name.trim()) continue;
    for (const size of sizes) {
      if (!size.trim()) continue;
      keys.push(`${color.name.trim()}-${size.trim()}`);
    }
  }
  return keys;
}

export default function ProductEditorModal({
  product,
  isOpen,
  saving,
  onClose,
  onSave,
  onDelete,
  getToken,
}: ProductEditorModalProps) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [uploadColor, setUploadColor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const colors = product.colors?.length
        ? product.colors
        : [{ name: '黑色', value: '#000000' }];
      const sizes = product.sizes?.length ? product.sizes : ['均碼'];
      const stockKeys = buildStockKeys(colors, sizes);
      const stock: Record<string, number> = {};
      for (const key of stockKeys) {
        stock[key] = product.stock?.[key] ?? 0;
      }

      setForm({
        productNo: product.productNo || '',
        name: product.name || '',
        category: product.category || 'tops',
        priceHkd: String(product.priceHkd ?? (product.price ? product.price / 100 : '')),
        originalPriceHkd: product.originalPriceHkd
          ? String(product.originalPriceHkd)
          : product.originalPrice
            ? String(product.originalPrice / 100)
            : '',
        description: product.description || '',
        material: product.material || '',
        sizeInfo: product.sizeInfo || '',
        imagesText: (product.images || []).join('\n'),
        hoverImage: product.hoverImage || '',
        careText: (product.care || []).join('\n'),
        detailsText: (product.details || []).join('\n'),
        hemService: !!product.hemService,
        isActive: product.isActive !== false,
        isBestSeller: !!product.isBestSeller,
        isNew: !!product.isNew,
        tag: (product.tag === 'NEW' || product.tag === 'LIMITED' ? product.tag : '') as '' | 'NEW' | 'LIMITED',
        colors,
        sizes,
        stock,
        colorImages: (product.colorImages as Record<string, string[]>) || {},
      });
      setUploadColor(colors[0]?.name?.trim() || '');
    } else {
      const colors = EMPTY_FORM.colors;
      const sizes = EMPTY_FORM.sizes;
      const stock: Record<string, number> = {};
      for (const key of buildStockKeys(colors, sizes)) stock[key] = 0;
      setForm({ ...EMPTY_FORM, stock });
      setUploadColor(colors[0]?.name || '');
    }
    setUploadError('');
  }, [isOpen, product]);

  const stockKeys = useMemo(
    () => buildStockKeys(form.colors, form.sizes),
    [form.colors, form.sizes]
  );

  useEffect(() => {
    setForm((prev) => {
      const nextStock = { ...prev.stock };
      for (const key of stockKeys) {
        if (nextStock[key] === undefined) nextStock[key] = 0;
      }
      for (const key of Object.keys(nextStock)) {
        if (!stockKeys.includes(key)) delete nextStock[key];
      }
      return { ...prev, stock: nextStock };
    });
  }, [stockKeys]);

  if (!isOpen) return null;

  if (!isOpen) return null;

  const imageUrls = form.imagesText.split('\n').map((s) => s.trim()).filter(Boolean);

  const handleUploadImages = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const productNo = form.productNo.trim();
    if (!productNo) {
      setUploadError('請先填寫商品編號（如 OC00024）');
      return;
    }

    const token = getToken();
    if (!token) {
      setUploadError('請重新登入後台');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const body = new FormData();
      body.set('productNo', productNo);
      const existingUrls = [
        ...new Set([...imageUrls, ...Object.values(form.colorImages).flat()]),
      ];
      body.set('existingUrls', JSON.stringify(existingUrls));
      Array.from(fileList).forEach((file) => body.append('files', file));

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadError(data.error || '上傳失敗');
        return;
      }

      const newUrls: string[] = data.urls || [];
      if (newUrls.length === 0) return;

      const mergedImages = [...imageUrls, ...newUrls];
      const colorName =
        uploadColor.trim() ||
        (form.colors.length === 1 ? form.colors[0].name.trim() : '');

      const nextColorImages = { ...form.colorImages };
      if (colorName) {
        nextColorImages[colorName] = [...(nextColorImages[colorName] || []), ...newUrls];
      }

      setForm((prev) => ({
        ...prev,
        imagesText: mergedImages.join('\n'),
        colorImages: nextColorImages,
        hoverImage: prev.hoverImage.trim() || mergedImages[0] || '',
      }));
    } catch {
      setUploadError('網絡錯誤，上傳失敗');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.imagesText.split('\n').map((s) => s.trim()).filter(Boolean);
    const colors = form.colors.filter((c) => c.name.trim());

    let colorImages = { ...form.colorImages };
    if (colors.length === 1 && colors[0].name.trim()) {
      const colorName = colors[0].name.trim();
      if (!colorImages[colorName]?.length) {
        colorImages = { ...colorImages, [colorName]: images };
      }
    }

    const payload: Record<string, unknown> = {
      productNo: form.productNo.trim() || null,
      name: form.name.trim(),
      category: form.category,
      priceHkd: form.priceHkd,
      originalPriceHkd: form.originalPriceHkd ? form.originalPriceHkd : null,
      description: form.description,
      material: form.material,
      sizeInfo: form.sizeInfo,
      images,
      hoverImage: form.hoverImage.trim() || images[0] || '',
      care: form.careText.split('\n').map((s) => s.trim()).filter(Boolean),
      details: form.detailsText.split('\n').map((s) => s.trim()).filter(Boolean),
      hemService: form.hemService,
      isActive: form.isActive,
      isBestSeller: form.isBestSeller,
      isNew: form.isNew,
      tag: form.tag || (form.isNew ? 'NEW' : null),
      colors,
      sizes: form.sizes.map((s) => s.trim()).filter(Boolean),
      stock: form.stock,
      colorImages: Object.keys(colorImages).length > 0 ? colorImages : null,
    };
    if (product?.id) payload.productId = product.id;
    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-base font-medium tracking-wider">
              {isEdit ? '編輯商品' : '新增商品'}
            </h3>
            {isEdit && <p className="text-xs text-gray-400 mt-1 tracking-wider">{product?.name}</p>}
          </div>
          <button type="button" onClick={() => !saving && onClose()} className="p-1 text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="product-editor-form" onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">商品名稱 *</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">商品編號 *（上傳圖片前必填）</span>
              <input
                required
                value={form.productNo}
                onChange={(e) => setForm({ ...form, productNo: e.target.value.toUpperCase() })}
                placeholder="如 OC00024"
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none rounded"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">分類 *</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-500 tracking-wider">售價 (HK$) *</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.priceHkd}
                  onChange={(e) => setForm({ ...form, priceHkd: e.target.value })}
                  className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500 tracking-wider">原價 (HK$)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.originalPriceHkd}
                  onChange={(e) => setForm({ ...form, originalPriceHkd: e.target.value })}
                  className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
                />
              </label>
            </div>
          </div>

          <label className="block">
            <span className="text-xs text-gray-500 tracking-wider">商品介紹</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded leading-relaxed"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">面料</span>
              <input
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">尺碼說明</span>
              <input
                value={form.sizeInfo}
                onChange={(e) => setForm({ ...form, sizeInfo: e.target.value })}
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
              />
            </label>
          </div>

          <div className="border border-gray-100 rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium tracking-wider text-gray-700">商品圖片</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              上傳後會自動命名為 <span className="font-mono">OC00024.JPG</span>、<span className="font-mono">OC00024_1.JPG</span>… 並寫入下方列表，無需手動改檔名。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {form.colors.filter((c) => c.name.trim()).length > 1 && (
                <label className="block">
                  <span className="text-xs text-gray-500 tracking-wider">圖片歸屬顏色</span>
                  <select
                    value={uploadColor}
                    onChange={(e) => setUploadColor(e.target.value)}
                    className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded bg-white focus:border-black focus:outline-none"
                  >
                    {form.colors
                      .filter((c) => c.name.trim())
                      .map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                  </select>
                </label>
              )}
              <div className={form.colors.filter((c) => c.name.trim()).length > 1 ? '' : 'md:col-span-2'}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUploadImages(e.target.files)}
                />
                <button
                  type="button"
                  disabled={uploading || saving}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-3 text-xs tracking-wider border border-dashed border-gray-300 rounded-lg bg-white hover:border-black transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? '上傳中...' : '選擇圖片上傳（可多選）'}
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-red-600">{uploadError}</p>
            )}

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {imageUrls.map((url) => (
                  <div key={url} className="relative aspect-square bg-white border border-gray-200 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-xs text-gray-500 tracking-wider">圖片 URL 列表（自動填入，也可手動編輯）</span>
            <textarea
              rows={3}
              value={form.imagesText}
              onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
              placeholder="上傳後會自動出現在此"
              className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none rounded"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 tracking-wider">Hover 圖片 URL</span>
            <input
              value={form.hoverImage}
              onChange={(e) => setForm({ ...form, hoverImage: e.target.value })}
              className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none rounded"
            />
          </label>

          {/* 顏色 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 tracking-wider">顏色</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, colors: [...form.colors, { name: '', value: '#000000' }] })}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-black"
              >
                <Plus className="w-3.5 h-3.5" /> 新增顏色
              </button>
            </div>
            <div className="space-y-2">
              {form.colors.map((color, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={color.name}
                    onChange={(e) => {
                      const colors = [...form.colors];
                      colors[idx] = { ...colors[idx], name: e.target.value };
                      setForm({ ...form, colors });
                    }}
                    placeholder="顏色名稱"
                    className="flex-1 border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none"
                  />
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) => {
                      const colors = [...form.colors];
                      colors[idx] = { ...colors[idx], value: e.target.value };
                      setForm({ ...form, colors });
                    }}
                    className="w-10 h-10 border border-gray-200 rounded cursor-pointer"
                  />
                  {form.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, colors: form.colors.filter((_, i) => i !== idx) })}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 尺碼 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 tracking-wider">尺碼（逗號分隔）</span>
            </div>
            <input
              value={form.sizes.join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="XS, S, M, L, XL"
              className="w-full border border-gray-200 px-3 py-2 text-sm rounded focus:border-black focus:outline-none"
            />
          </div>

          {/* 庫存 */}
          <div>
            <span className="text-xs text-gray-500 tracking-wider">庫存（顏色-尺碼）</span>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {stockKeys.map((key) => (
                <label key={key} className="flex items-center gap-2 border border-gray-100 rounded px-2 py-1.5">
                  <span className="text-[11px] text-gray-500 flex-1 truncate">{key}</span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock[key] ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: { ...form.stock, [key]: Math.max(0, parseInt(e.target.value, 10) || 0) },
                      })
                    }
                    className="w-16 border border-gray-200 px-2 py-1 text-xs text-right rounded focus:border-black focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">洗護說明（每行一條）</span>
              <textarea
                rows={3}
                value={form.careText}
                onChange={(e) => setForm({ ...form, careText: e.target.value })}
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">商品細節（每行一條）</span>
              <textarea
                rows={3}
                value={form.detailsText}
                onChange={(e) => setForm({ ...form, detailsText: e.target.value })}
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-gray-500 tracking-wider">商品標籤</span>
              <select
                value={form.tag}
                onChange={(e) => {
                  const tag = e.target.value as '' | 'NEW' | 'LIMITED';
                  setForm({
                    ...form,
                    tag,
                    isNew: tag === 'NEW' ? true : form.isNew,
                  });
                }}
                className="mt-1 w-full border border-gray-200 px-3 py-2 text-sm rounded bg-white focus:border-black focus:outline-none"
              >
                <option value="">無</option>
                <option value="NEW">NEW（最新系列）</option>
                <option value="LIMITED">LIMITED（限量）</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isNew: e.target.checked,
                    tag: e.target.checked ? 'NEW' : form.tag === 'NEW' ? '' : form.tag,
                  })
                }
              />
              <span className="text-xs tracking-wider text-gray-600">標記為新品（搜尋推薦）</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hemService} onChange={(e) => setForm({ ...form, hemService: e.target.checked })} />
              <span className="text-xs tracking-wider text-gray-600">提供修褲腳</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <span className="text-xs tracking-wider text-gray-600">上架中</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} />
              <span className="text-xs tracking-wider text-gray-600">精選商品</span>
            </label>
          </div>
        </form>

        <div className="flex items-center gap-3 p-6 border-t border-gray-100">
          {isEdit && onDelete && product?.id && (
            <button
              type="button"
              disabled={saving}
              onClick={() => onDelete(product.id!)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs tracking-wider border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              刪除商品
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="px-4 py-2.5 text-xs tracking-wider border border-gray-200 rounded hover:border-black disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="submit"
            form="product-editor-form"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs tracking-wider bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? '儲存中...' : '儲存商品'}
          </button>
        </div>
      </div>
    </div>
  );
}
