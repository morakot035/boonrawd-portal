const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}

// ─── Auth ────────────────────────────────────────────────
export async function login(email: string, password: string) {
  return apiFetch<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

// ─── Pallet Standards ────────────────────────────────────
export interface PalletStandard {
  _id: string;
  plant: string;
  line: string;
  brand: string;
  sku_name: string;
  size_ml: number;
  pack_type: string | null;
  production: { hr_per_day_std: number; speed_bph: number };
  pallet_config: { bottle_per_pack: number; pack_per_layer: number; layer_per_pallet: number; bottles_per_pallet: number };
  throughput: { pallet_per_hour: number; pallet_per_hour_roundup: number; pallet_per_day_std: number };
}

export async function getPalletStandards(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<{ success: boolean; count: number; data: PalletStandard[] }>(`/pallet-standards${qs}`);
}

export async function getPalletPlants() {
  return apiFetch<{ success: boolean; data: string[] }>('/pallet-standards/meta/plants');
}

export async function getPalletLines(plant?: string) {
  const qs = plant ? `?plant=${plant}` : '';
  return apiFetch<{ success: boolean; data: string[] }>(`/pallet-standards/meta/lines${qs}`);
}

// ─── SKU Master ──────────────────────────────────────────
export interface SkuMaster {
  _id: string;

  plant: string;
  plant_code?: string;

  line: string;
  line_type?: string | null;

  group_product?: string | null;
  product_type?: string | null;

  sku_name: string;

  size_litre?: number | null;
  size_ml?: number | null;

  speed_bph?: number | null;

  remark?: string | null;

  is_active?: boolean;

  meta?: {
    source_file?: string;
    created_at?: string;
    updated_at?: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

export type SkuMasterParams = {
  plant?: string;
  plant_code?: string;
  line?: string;
  group_product?: string;
  product_type?: string;
  line_type?: string;
  size_ml?: string;
  size_litre?: string;
  search?: string;
  is_active?: string;
};

function toQueryString(params?: SkuMasterParams) {
  if (!params) return "";

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

  const qs = new URLSearchParams(cleanParams).toString();

  return qs ? `?${qs}` : "";
}

export async function getSkuMaster(params?: SkuMasterParams) {
  const qs = toQueryString(params);

  return apiFetch<{
    success: boolean;
    count: number;
    data: SkuMaster[];
  }>(`/sku-master${qs}`);
}

export async function getSkuPlants() {
  return apiFetch<{
    success: boolean;
    data: string[];
  }>("/sku-master/meta/plants");
}

export async function getSkuPlantCodes() {
  return apiFetch<{
    success: boolean;
    data: string[];
  }>("/sku-master/meta/plant-codes");
}

export async function getSkuLines(params?: {
  plant?: string;
  plant_code?: string;
  group_product?: string;
  product_type?: string;
}) {
  const qs = toQueryString(params);

  return apiFetch<{
    success: boolean;
    data: string[];
  }>(`/sku-master/meta/lines${qs}`);
}

export async function getSkuGroupProducts() {
  return apiFetch<{
    success: boolean;
    data: string[];
  }>("/sku-master/meta/group-products");
}

export async function getSkuProductTypes() {
  return apiFetch<{
    success: boolean;
    data: string[];
  }>("/sku-master/meta/product-types");
}

export async function getSkuLineTypes(params?: {
  group_product?: string;
  product_type?: string;
}) {
  const qs = toQueryString(params);

  return apiFetch<{
    success: boolean;
    data: string[];
  }>(`/sku-master/meta/line-types${qs}`);
}

export async function getSkuSizes(params?: {
  group_product?: string;
  product_type?: string;
}) {
  const qs = toQueryString(params);

  return apiFetch<{
    success: boolean;
    data: number[];
  }>(`/sku-master/meta/sizes${qs}`);
}

// ─── Budget Production ───────────────────────────────────
// ─── Budget Production ───────────────────────────────────────────────────────
// แทนที่ส่วน Budget Production เดิมใน api.ts

export interface YearlyData {
  year: number;
  is_forecast: boolean;
  production_ml: number | null;
  capacity_ml: number | null;
  utilization_pct: number | null;
}

export interface BudgetProduction {
  _id: string;
  level: 'plant' | 'line_category' | 'line' | 'product';
  plant: string;
  line_category: string | null;
  line: string | null;
  product: string | null;
  yearly_data: YearlyData[];
  meta?: {
    source_file: string;
    sheet: string;
    created_at: string;
  };
}

export async function getBudgetProduction(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<{ success: boolean; count: number; data: BudgetProduction[] }>(
    `/budget-production${qs}`
  );
}

export async function getBudgetPlants() {
  return apiFetch<{ success: boolean; data: string[] }>('/budget-production/meta/plants');
}

export async function getBudgetLines(params?: { plant?: string; line_category?: string }) {
  const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<{ success: boolean; data: string[] }>(`/budget-production/meta/lines${qs}`);
}

export async function getBudgetLineCategories(plant?: string) {
  const qs = plant ? `?plant=${plant}` : '';
  return apiFetch<{ success: boolean; data: string[] }>(
    `/budget-production/meta/line-categories${qs}`
  );
}

export async function getBudgetProducts(params?: { plant?: string; line?: string; line_category?: string }) {
  const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<{ success: boolean; data: string[] }>(`/budget-production/meta/products${qs}`);
}

// ลบ getBudgetTypes() ออก — ไม่มีใน schema ใหม่แล้ว
