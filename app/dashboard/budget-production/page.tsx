'use client';
import { useEffect, useState } from 'react';
import { getBudgetProduction, getBudgetPlants, getBudgetTypes, BudgetProduction, YearlyData } from '@/lib/api';

const YEARS = [2017,2018,2019,2020,2021,2022,2023,2024,2025,'2026_forecast'];

function UtilBar({ value }: { value: number | null }) {
  if (value === null) return <span style={{ color: '#D1D5DB' }}>—</span>;
  const capped = Math.min(Math.abs(value), 100);
  const color = value > 90 ? '#EF4444' : value > 70 ? '#C9A227' : '#10B981';
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 sm:w-16 h-1.5 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: '#E5E7EB' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${capped}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>{value.toFixed(1)}%</span>
    </div>
  );
}

export default function BudgetProductionPage() {
  const [data, setData] = useState<BudgetProduction[]>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [filterPlant, setFilterPlant] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | number>(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBudgetPlants().then((r) => setPlants(r.data)).catch(() => {});
    getBudgetTypes().then((r) => setTypes(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true); setError('');
    const params: Record<string, string> = {};
    if (filterPlant) params.plant = filterPlant;
    if (filterType) params.type = filterType;
    getBudgetProduction(params)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterPlant, filterType]);

  function getYear(row: BudgetProduction): YearlyData | undefined {
    return row.yearly_data.find((y) => String(y.year) === String(selectedYear));
  }

  const displayData = data.filter((row) => getYear(row));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#0D1B3E' }}>Budget Production</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>
          ข้อมูลการผลิตและ Utilization รายปี 2017–2026
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <select value={filterPlant} onChange={(e) => setFilterPlant(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none flex-1 sm:flex-none"
          style={{ borderColor: '#D1C9B8', backgroundColor: '#fff', color: '#0D1B3E', minWidth: 120 }}>
          <option value="">ทุกโรงงาน</option>
          {plants.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none flex-1 sm:flex-none"
          style={{ borderColor: '#D1C9B8', backgroundColor: '#fff', color: '#0D1B3E', minWidth: 120 }}>
          <option value="">ทุกประเภท</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="px-3 py-2 rounded-lg text-sm font-medium ml-auto"
          style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: '#0D1B3E' }}>
          {displayData.length} รายการ
        </span>
      </div>

      {/* Year selector — scrollable on mobile */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {YEARS.map((y) => {
          const isForecast = String(y).includes('forecast');
          const isActive = String(selectedYear) === String(y);
          return (
            <button key={y} onClick={() => setSelectedYear(y)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0"
              style={{
                backgroundColor: isActive ? (isForecast ? '#7C3AED' : '#0D1B3E') : '#fff',
                color: isActive ? (isForecast ? '#fff' : '#C9A227') : isForecast ? '#7C3AED' : '#4A5568',
                border: `1px solid ${isForecast ? '#7C3AED' : '#D1C9B8'}`,
              }}>
              {isForecast ? '2026 F' : y}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2D9C9' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr style={{ backgroundColor: '#0D1B3E' }}>
                {['โรงงาน', 'สาย', 'ผลิตภัณฑ์', 'ประเภท', 'Production (ML)', 'Capacity (ML)', 'Utilization'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                    style={{ color: '#C9A227' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin"
                    style={{ borderColor: '#C9A227', borderTopColor: 'transparent' }} />
                </td></tr>
              ) : displayData.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-sm" style={{ color: '#6B7280' }}>
                  ไม่พบข้อมูลในปี {String(selectedYear)}
                </td></tr>
              ) : displayData.map((row, i) => {
                const yd = getYear(row)!;
                return (
                  <tr key={row._id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAF7F2' }}>
                    <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: '#0D1B3E' }}>{row.plant}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#4A5568' }}>{row.line}</td>
                    <td className="px-3 py-2.5 text-xs font-medium max-w-[140px] truncate" style={{ color: '#0D1B3E' }}
                      title={row.product}>{row.product}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: '#7A6010' }}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right tabular-nums" style={{ color: '#0D1B3E' }}>
                      <span className="flex items-center justify-end gap-1">
                        {yd.is_forecast && (
                          <span className="text-xs px-1 rounded" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>F</span>
                        )}
                        {yd.production_ml?.toFixed(2) ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right tabular-nums" style={{ color: '#6B7280' }}>
                      {yd.capacity_ml?.toFixed(2) ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <UtilBar value={yd.utilization_pct} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
