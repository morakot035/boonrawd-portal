'use client';
import { useEffect, useState } from 'react';
import { getPalletStandards, getPalletPlants, getPalletLines, PalletStandard } from '@/lib/api';

export default function PalletStandardsPage() {
  const [data, setData] = useState<PalletStandard[]>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [filterPlant, setFilterPlant] = useState('');
  const [filterLine, setFilterLine] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPalletPlants().then((r) => setPlants(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    getPalletLines(filterPlant || undefined).then((r) => setLines(r.data)).catch(() => {});
    setFilterLine('');
  }, [filterPlant]);

  useEffect(() => {
    setLoading(true); setError('');
    const params: Record<string, string> = {};
    if (filterPlant) params.plant = filterPlant;
    if (filterLine) params.line = filterLine;
    getPalletStandards(params)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterPlant, filterLine]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#0D1B3E' }}>Pallet Standards</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>
          ข้อมูลมาตรฐานการจัดเรียงพาเลท แยกตามโรงงานและสาย
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterPlant} onChange={(e) => setFilterPlant(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none flex-1 sm:flex-none"
          style={{ borderColor: '#D1C9B8', backgroundColor: '#fff', color: '#0D1B3E', minWidth: 120 }}>
          <option value="">ทุกโรงงาน</option>
          {plants.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterLine} onChange={(e) => setFilterLine(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none flex-1 sm:flex-none"
          style={{ borderColor: '#D1C9B8', backgroundColor: '#fff', color: '#0D1B3E', minWidth: 120 }}>
          <option value="">ทุกสาย</option>
          {lines.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <span className="px-3 py-2 rounded-lg text-sm font-medium ml-auto"
          style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: '#0D1B3E' }}>
          {data.length} รายการ
        </span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {/* Table wrapper — horizontal scroll on small screens */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2D9C9' }}>
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-sm" style={{ minWidth: 700 }}>
            <thead>
              <tr style={{ backgroundColor: '#0D1B3E' }}>
                {[
                  { label: 'โรงงาน', cls: 'w-20' },
                  { label: 'สาย', cls: 'w-24' },
                  { label: 'Brand', cls: 'w-20' },
                  { label: 'SKU', cls: '' },
                  { label: 'ml', cls: 'w-16 text-right' },
                  { label: 'Pack Type', cls: 'w-24' },
                  { label: 'Speed', cls: 'w-24 text-right' },
                  { label: 'Btl/Pallet', cls: 'w-24 text-right' },
                  { label: 'Pallet/วัน', cls: 'w-24 text-right' },
                ].map((h) => (
                  <th key={h.label}
                    className={`px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap ${h.cls}`}
                    style={{ color: '#C9A227' }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16">
                  <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin"
                    style={{ borderColor: '#C9A227', borderTopColor: 'transparent' }} />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-sm" style={{ color: '#6B7280' }}>
                  ไม่พบข้อมูล
                </td></tr>
              ) : data.map((row, i) => (
                <tr key={row._id}
                  style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAF7F2' }}>
                  <td className="px-3 py-2.5 font-semibold text-xs" style={{ color: '#0D1B3E' }}>{row.plant}</td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: '#4A5568' }}>{row.line}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: '#7A6010' }}>
                      {row.brand}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs max-w-[180px] truncate" style={{ color: '#0D1B3E' }}
                    title={row.sku_name}>{row.sku_name}</td>
                  <td className="px-3 py-2.5 text-xs text-right" style={{ color: '#4A5568' }}>{row.size_ml}</td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: '#4A5568' }}>{row.pack_type ?? '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums" style={{ color: '#4A5568' }}>
                    {row.production.speed_bph.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums font-medium" style={{ color: '#0D1B3E' }}>
                    {row.pallet_config.bottles_per_pallet.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums font-semibold" style={{ color: '#C9A227' }}>
                    {row.throughput.pallet_per_day_std.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
