'use client';
import { useEffect, useMemo, useState } from 'react';
import { getBudgetProduction, BudgetProduction, YearlyData } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface TreeProduct { id: string; product: string; line: string; plant: string }
interface TreeLine    { line: string; products: TreeProduct[] }
interface TreePlant   { plant: string; lines: TreeLine[] }

// ─── Constants ───────────────────────────────────────────────────────────────
const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
const C = {
  navy:   '#0D1B3E',
  gold:   '#C9A227',
  cream:  '#FAF7F2',
  border: '#E2D9C9',
  muted:  '#6B7280',
  red:    '#EF4444',
  green:  '#10B981',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getYd(row: BudgetProduction, year: number): YearlyData | undefined {
  return row.yearly_data.find((y) => y.year === year);
}

function triState(checked: number, total: number): 'all' | 'none' | 'some' {
  if (checked === 0) return 'none';
  if (checked === total) return 'all';
  return 'some';
}

// ─── UtilBar ─────────────────────────────────────────────────────────────────
function UtilBar({ value }: { value: number | null }) {
  if (value === null) return <span style={{ color: C.border }}>—</span>;
  const capped = Math.min(Math.abs(value), 100);
  const color = value > 90 ? C.red : value > 70 ? C.gold : C.green;
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: '#E5E7EB' }}>
        <div className="h-full rounded-full" style={{ width: `${capped}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>{value.toFixed(1)}%</span>
    </div>
  );
}

// ─── Checkbox (supports indeterminate) ───────────────────────────────────────
function Cb({
  state, onChange, label, className = '', labelClass = '',
}: {
  state: 'all' | 'none' | 'some';
  onChange: (next: boolean) => void;
  label?: string;
  className?: string;
  labelClass?: string;
}) {
  return (
    <label className={`flex items-center gap-1.5 cursor-pointer select-none ${className}`}>
      <span
        className="flex items-center justify-center rounded shrink-0"
        style={{
          width: 14, height: 14,
          border: `1.5px solid ${state !== 'none' ? C.navy : '#9CA3AF'}`,
          backgroundColor: state === 'all' ? C.navy : state === 'some' ? '#E5E7EB' : '#fff',
        }}
        onClick={() => onChange(state !== 'all')}
      >
        {state === 'all' && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {state === 'some' && (
          <span style={{ width: 6, height: 1.5, backgroundColor: C.navy, display: 'block', borderRadius: 1 }} />
        )}
      </span>
      {label && <span className={labelClass}>{label}</span>}
    </label>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, unit, accent }: {
  icon: string; label: string; value: string; unit: string; accent?: boolean;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ border: `1px solid ${C.border}`, backgroundColor: '#fff' }}>
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: C.muted }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums" style={{ color: accent ? C.gold : C.navy }}>{value}</span>
        <span className="text-xs font-medium" style={{ color: C.muted }}>{unit}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BudgetProductionPage() {
  const [allData, setAllData]       = useState<BudgetProduction[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [selectedYear, setYear]     = useState<number>(2025);
  const [selected, setSelected]     = useState<Set<string>>(new Set());  // set of _id
  const [expanded, setExpanded]     = useState<Set<string>>(new Set());  // set of "plant" or "plant|line"

  // Fetch all product-level docs once
  useEffect(() => {
    setLoading(true);
    getBudgetProduction({ level: 'product' })
      .then((r) => {
        setAllData(r.data);
        // Default: select all
        setSelected(new Set(r.data.map((d) => d._id)));
        // Expand all plants by default
        const plants = [...new Set(r.data.map((d) => d.plant))];
        setExpanded(new Set(plants));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Build tree structure
  const tree: TreePlant[] = useMemo(() => {
    const map = new Map<string, Map<string, TreeProduct[]>>();
    for (const d of allData) {
      const line    = d.line    ?? '(no line)';
      const product = d.product ?? '(no product)';
      if (!map.has(d.plant)) map.set(d.plant, new Map());
      const lineMap = map.get(d.plant)!;
      if (!lineMap.has(line)) lineMap.set(line, []);
      lineMap.get(line)!.push({ id: d._id, product, line, plant: d.plant });
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([plant, lineMap]) => ({
      plant,
      lines: [...lineMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([line, products]) => ({
        line,
        products: products.sort((a, b) => a.product.localeCompare(b.product)),
      })),
    }));
  }, [allData]);

  // Selection helpers
  const toggle = (ids: string[], toOn: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => toOn ? next.add(id) : next.delete(id));
      return next;
    });
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Filtered display data (only selected products that have data for selected year)
  const displayData = useMemo(() =>
    allData.filter((d) => selected.has(d._id) && getYd(d, selectedYear) !== undefined),
    [allData, selected, selectedYear]
  );

  // KPI totals
  const kpi = useMemo(() => {
    let prod = 0, cap = 0, count = 0;
    for (const row of displayData) {
      const yd = getYd(row, selectedYear);
      if (!yd) continue;
      if (yd.production_ml != null) prod += yd.production_ml;
      if (yd.capacity_ml   != null) cap  += yd.capacity_ml;
      count++;
    }
    const util = cap > 0 ? (prod / cap) * 100 : null;
    return { prod, cap, util, count };
  }, [displayData, selectedYear]);

  const isForecast = selectedYear === 2026;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: C.cream, fontFamily: 'inherit' }}>

      {/* ── Sidebar Tree ─────────────────────────────────────────────────── */}
      <aside className="flex flex-col shrink-0 overflow-hidden" style={{
        width: 240, borderRight: `1px solid ${C.border}`, backgroundColor: '#fff',
      }}>
        {/* Sidebar header */}
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
            PLANT / LINE / PRODUCT
          </p>
        </div>

        {/* Tree scroll area */}
        <div className="flex-1 overflow-y-auto py-2" style={{ fontSize: 12 }}>
          {loading ? (
            <div className="px-4 py-8 text-center text-xs" style={{ color: C.muted }}>กำลังโหลด...</div>
          ) : tree.map((plantNode) => {
            const plantIds = plantNode.lines.flatMap((l) => l.products.map((p) => p.id));
            const plantChecked = plantIds.filter((id) => selected.has(id)).length;
            const plantState = triState(plantChecked, plantIds.length);
            const plantExpanded = expanded.has(plantNode.plant);

            return (
              <div key={plantNode.plant} className="mb-0.5">
                {/* Plant row */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-md mx-1 hover:bg-gray-50 cursor-pointer">
                  <button
                    onClick={() => toggleExpand(plantNode.plant)}
                    className="shrink-0 flex items-center justify-center"
                    style={{ width: 16, height: 16, color: C.muted }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d={plantExpanded ? 'M2 3.5L5 6.5L8 3.5' : 'M3.5 2L6.5 5L3.5 8'}
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <Cb
                    state={plantState}
                    onChange={(on) => toggle(plantIds, on)}
                    label={plantNode.plant}
                    labelClass="font-semibold"
                    className="flex-1"
                  />
                </div>

                {/* Lines */}
                {plantExpanded && plantNode.lines.map((lineNode) => {
                  const lineIds = lineNode.products.map((p) => p.id);
                  const lineChecked = lineIds.filter((id) => selected.has(id)).length;
                  const lineState = triState(lineChecked, lineIds.length);
                  const lineKey = `${plantNode.plant}|${lineNode.line}`;
                  const lineExpanded = expanded.has(lineKey);

                  return (
                    <div key={lineNode.line}>
                      {/* Line row */}
                      <div className="flex items-center gap-1 pl-7 pr-3 py-1 rounded-md mx-1 hover:bg-gray-50 cursor-pointer">
                        <button
                          onClick={() => toggleExpand(lineKey)}
                          className="shrink-0 flex items-center justify-center"
                          style={{ width: 14, height: 14, color: C.muted }}
                        >
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                            <path
                              d={lineExpanded ? 'M2 3.5L5 6.5L8 3.5' : 'M3.5 2L6.5 5L3.5 8'}
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <Cb
                          state={lineState}
                          onChange={(on) => toggle(lineIds, on)}
                          label={lineNode.line}
                          labelClass="font-medium"
                          className="flex-1"
                        />
                        {/* badge: selected/total */}
                        <span className="text-xs tabular-nums shrink-0" style={{
                          color: lineState === 'some' ? C.gold : C.muted,
                          fontWeight: lineState === 'some' ? 600 : 400,
                        }}>
                          {lineChecked}/{lineIds.length}
                        </span>
                      </div>

                      {/* Products */}
                      {lineExpanded && lineNode.products.map((prod) => {
                        const isOn = selected.has(prod.id);
                        return (
                          <div key={prod.id}
                            className="flex items-center gap-1.5 pl-12 pr-3 py-0.5 rounded mx-1 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggle([prod.id], !isOn)}
                          >
                            <Cb state={isOn ? 'all' : 'none'} onChange={(on) => toggle([prod.id], on)} />
                            <span style={{ color: isOn ? C.navy : C.muted }}>{prod.product}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* View By (static display, for future use) */}
        <div className="px-4 py-3 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.muted }}>VIEW BY</p>
          <div className="flex gap-1.5">
            {['Plant', 'Line', 'Product'].map((v) => (
              <span key={v} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: v === 'Product' ? C.navy : 'transparent',
                  color: v === 'Product' ? C.gold : C.muted,
                  border: `1px solid ${v === 'Product' ? C.navy : C.border}`,
                }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: '#fff' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold" style={{ color: C.navy }}>Budget Dashboard</h1>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>ข้อมูลการผลิตและ Utilization รายปี 2017–2026</p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: C.navy }}>
              {kpi.count} รายการ
            </span>
          </div>

          {/* Year selector */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {YEARS.map((y) => {
              const isF = y === 2026;
              const isActive = selectedYear === y;
              return (
                <button key={y} onClick={() => setYear(y)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
                  style={{
                    backgroundColor: isActive ? (isF ? '#7C3AED' : C.navy) : '#fff',
                    color: isActive ? (isF ? '#fff' : C.gold) : isF ? '#7C3AED' : '#4A5568',
                    border: `1px solid ${isF ? '#7C3AED' : C.border}`,
                  }}>
                  {isF ? '2026 F' : y}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: C.cream }}>

          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4 mb-5">
  <KpiCard
    icon="📊"
    label="Production"
    value={kpi.prod.toFixed(0)}
    unit="ML"
  />

  <KpiCard
    icon="🏭"
    label="Capacity"
    value={kpi.cap.toFixed(0)}
    unit="ML"
  />

  <KpiCard
    icon="⚡"
    label="% Utilization"
    value={kpi.util !== null ? kpi.util.toFixed(1) : '—'}
    unit="%"
    accent
  />
</div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              {error}
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#fff', borderBottom: `1px solid ${C.border}` }}>
              <p className="text-sm font-semibold" style={{ color: C.navy }}>
                รายละเอียด
                <span className="text-xs font-normal ml-2" style={{ color: C.muted }}>
                  | คลิกแถวเพื่อ drill down
                </span>
              </p>
              {isForecast && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>Forecast 2026</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 640 }}>
                <thead>
                  <tr style={{ backgroundColor: C.navy }}>
                    {['โรงงาน', 'สาย', 'ผลิตภัณฑ์', 'Production (ML)', 'Capacity (ML)', '% Utilization'].map((h) => (
                      <th key={h} className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                        style={{ color: C.gold }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-16">
                      <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin"
                        style={{ borderColor: C.gold, borderTopColor: 'transparent' }} />
                    </td></tr>
                  ) : displayData.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-sm" style={{ color: C.muted }}>
                      ไม่พบข้อมูลในปี {selectedYear} — ลองเลือก product เพิ่มหรือเปลี่ยนปี
                    </td></tr>
                  ) : displayData.map((row, i) => {
                    const yd = getYd(row, selectedYear)!;
                    return (
                      <tr key={row._id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : C.cream }}>
                        <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: C.navy }}>{row.plant}</td>
                        <td className="px-3 py-2.5 text-xs" style={{ color: '#4A5568' }}>{row.line}</td>
                        <td className="px-3 py-2.5 text-xs font-medium max-w-[160px] truncate" style={{ color: C.navy }}
                          title={row.product ?? undefined}>{row.product ?? '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-right tabular-nums" style={{ color: C.navy }}>
                          <span className="flex items-center justify-end gap-1">
                            {yd.is_forecast && (
                              <span className="text-xs px-1 rounded" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>F</span>
                            )}
                            {yd.production_ml?.toFixed(2) ?? '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-right tabular-nums" style={{ color: C.muted }}>
                          {yd.capacity_ml?.toFixed(2) ?? '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <UtilBar value={yd.utilization_pct} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Total row */}
                {!loading && displayData.length > 0 && (
                  <tfoot>
                    <tr style={{ backgroundColor: C.navy }}>
                      <td className="px-3 py-3 text-xs font-bold" style={{ color: '#fff' }} colSpan={3}>Total</td>
                      <td className="px-3 py-3 text-xs text-right font-bold tabular-nums" style={{ color: C.gold }}>
                        {kpi.prod.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-xs text-right font-bold tabular-nums" style={{ color: C.gold }}>
                        {kpi.cap.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-xs font-bold" style={{ color: C.gold }}>
                        {kpi.util !== null ? `${kpi.util.toFixed(1)}% avg` : '—'}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
