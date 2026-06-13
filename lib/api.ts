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
  plant_code: string;
  line: string;
  line_type: string;
  product_type: string;
  sku_name: string;
  size_ml: number;
  speed_bph: number;
  remark: string | null;
}

export async function getSkuMaster(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<{ success: boolean; count: number; data: SkuMaster[] }>(`/sku-master${qs}`);
}

export async function getSkuPlants() {
  return apiFetch<{ success: boolean; data: string[] }>('/sku-master/meta/plants');
}

export async function getSkuProductTypes() {
  return apiFetch<{ success: boolean; data: string[] }>('/sku-master/meta/product-types');
}

// ─── Budget Production ───────────────────────────────────
export interface YearlyData {
  year: number | string;
  is_forecast: boolean;
  production_ml: number | null;
  capacity_ml: number | null;
  utilization_pct: number | null;
}

export interface BudgetProduction {
  _id: string;
  plant: string;
  line: string;
  product: string;
  type: string;
  line_category: string;
  yearly_data: YearlyData[];
}

export async function getBudgetProduction(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<{ success: boolean; count: number; data: BudgetProduction[] }>(`/budget-production${qs}`);
}

export async function getBudgetPlants() {
  return apiFetch<{ success: boolean; data: string[] }>('/budget-production/meta/plants');
}

export async function getBudgetTypes() {
  return apiFetch<{ success: boolean; data: string[] }>('/budget-production/meta/types');
}
