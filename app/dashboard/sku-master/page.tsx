'use client';
import { useEffect, useState } from 'react';
import { getSkuMaster, getSkuPlants, getSkuProductTypes, SkuMaster } from '@/lib/api';

const TYPE_LABELS: Record<string, string> = {
  water_pet: 'Water PET', beer_bottle: 'Beer Bottle',
  beer_can: 'Beer Can', beer_keg: 'Beer KEG',
  soda_can_glass: 'Soda/Glass', glass_bottle: 'Glass Bottle',
};
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  water_pet:      { bg: '#DBEAFE', text: '#1E40AF' },
  beer_bottle:    { bg: '#FEF3C7', text: '#92400E' },
  beer_can:       { bg: '#D1FAE5', text: '#065F46' },
  beer_keg:       { bg: '#EDE9FE', text: '#4C1D95' },
  soda_can_glass: { bg: '#FCE7F3', text: '#9D174D' },
  glass_bottle:   { bg: '#F3F4F6', text: '#374151' },
};

export default function SkuMasterPage() {
  const [data, setData] = useState<SkuMaster[]>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [filterPlant, setFilterPlant] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSkuPlants().then((r) => setPlants(r.data)).catch(() => {});
    getSkuProductTypes().then((r) => setProductTypes(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true); setError('');
    const params: Record<string, string> = {};
    if (filterPlant) params.plant = filterPlant;
    if (filterType) params.product_type = filterType;
    getSkuMaster(params)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterPlant, filterType]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#0D1B3E' }}>SKU Master</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>
          ข้อมูล SKU ทั้งหมดแยกตามโรงงาน สาย และประเภทผลิตภัณฑ์
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterPlant} onChange={(e) => setFilterPlant(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none flex-1 sm:flex-none"
          style={{ borderColor: '#D1C9B8', backgroundColor: '#fff', color: '#0D1B3E', minWidth: 120 }}>
          <option value="">ทุกโรงงาน</option>
          {plants.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none flex-1 sm:flex-none"
          style={{ borderColor: '#D1C9B8', backgroundColor: '#fff', color: '#0D1B3E', minWidth: 140 }}>
          <option value="">ทุกประเภท</option>
          {productTypes.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>)}
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

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2D9C9' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 680 }}>
            <thead>
              <tr style={{ backgroundColor: '#0D1B3E' }}>
                {['โรงงาน', 'สาย', 'Line Type', 'ประเภท', 'SKU', 'ml', 'Speed (bph)', 'หมายเหตุ'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                    style={{ color: '#C9A227' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16">
                  <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin"
                    style={{ borderColor: '#C9A227', borderTopColor: 'transparent' }} />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-sm" style={{ color: '#6B7280' }}>ไม่พบข้อมูล</td></tr>
              ) : data.map((row, i) => {
                const c = TYPE_COLORS[row.product_type] ?? { bg: '#F3F4F6', text: '#374151' };
                return (
                  <tr key={row._id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAF7F2' }}>
                    <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: '#0D1B3E' }}>{row.plant}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#4A5568' }}>{row.line}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#6B7280' }}>{row.line_type}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{ backgroundColor: c.bg, color: c.text }}>
                        {TYPE_LABELS[row.product_type] ?? row.product_type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium max-w-[160px] truncate" style={{ color: '#0D1B3E' }}
                      title={row.sku_name}>{row.sku_name}</td>
                    <td className="px-3 py-2.5 text-xs text-right tabular-nums" style={{ color: '#4A5568' }}>
                      {row.size_ml.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right tabular-nums font-semibold" style={{ color: '#C9A227' }}>
                      {row.speed_bph.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-xs max-w-[140px] truncate"
                      style={{ color: row.remark ? '#B45309' : '#D1D5DB' }}
                      title={row.remark ?? ''}>
                      {row.remark ?? '—'}
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
