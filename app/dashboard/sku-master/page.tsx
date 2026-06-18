"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSkuMaster,
  getSkuGroupProducts,
  getSkuPlants,
  SkuMaster,
} from "@/lib/api";

const GROUP_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Beer Bottle": { bg: "#E6F1FB", text: "#0C447C", dot: "#185FA5" },
  "Beer Can": { bg: "#EAF3DE", text: "#27500A", dot: "#3B6D11" },
  "Beer KEG": { bg: "#FAEEDA", text: "#633806", dot: "#854F0B" },
  PET: { bg: "#EEEDFE", text: "#3C3489", dot: "#534AB7" },
  "S&W": { bg: "#E1F5EE", text: "#085041", dot: "#0F6E56" },
};

const PLANT_COLORS = [
  "#185FA5",
  "#0F6E56",
  "#A32D2D",
  "#854F0B",
  "#534AB7",
  "#D4537E",
  "#3B6D11",
  "#667085",
  "#BA7517",
];

type ViewMode = "group" | "plant";

export default function SkuMasterPage() {
  const [data, setData] = useState<SkuMaster[]>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("group");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getSkuMaster(),
      getSkuPlants(),
      getSkuGroupProducts(),
    ])
      .then(([skuRes, plantRes, groupRes]) => {
        setData(skuRes.data);
        setPlants(plantRes.data);
        setGroups(groupRes.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const plantColor = (plant: string) => {
    const index = plants.indexOf(plant);
    return PLANT_COLORS[index % PLANT_COLORS.length] ?? "#667085";
  };

  const totalLines = useMemo(() => {
    return new Set(data.map((d) => `${d.plant}-${d.line}`)).size;
  }, [data]);

  const groupSummary = useMemo(() => {
    return groups.map((group) => {
      const rows = data.filter((d) => d.group_product === group);
      const plantMap = new Map<string, Set<string>>();

      rows.forEach((r) => {
        if (!plantMap.has(r.plant)) plantMap.set(r.plant, new Set());
        plantMap.get(r.plant)?.add(r.line);
      });

      return {
        group,
        plants: Array.from(plantMap.entries()).map(([plant, lines]) => ({
          plant,
          lines: Array.from(lines),
        })),
        lineCount: Array.from(plantMap.values()).reduce(
          (sum, lines) => sum + lines.size,
          0,
        ),
      };
    });
  }, [data, groups]);

  const plantSummary = useMemo(() => {
    return plants.map((plant) => {
      const rows = data.filter((d) => d.plant === plant);
      const groupMap = new Map<string, Set<string>>();

      rows.forEach((r) => {
        const group = r.group_product ?? "Other";
        if (!groupMap.has(group)) groupMap.set(group, new Set());
        groupMap.get(group)?.add(r.line);
      });

      return {
        plant,
        lineCount: new Set(rows.map((r) => r.line)).size,
        groups: Array.from(groupMap.entries()).map(([group, lines]) => ({
          group,
          lines: Array.from(lines),
        })),
      };
    });
  }, [data, plants]);

  const rowsByGroupAndPlant = useMemo(() => {
    return data.filter((r) => {
      if (selectedGroup && r.group_product !== selectedGroup) return false;
      if (selectedPlant && r.plant !== selectedPlant) return false;
      return true;
    });
  }, [data, selectedGroup, selectedPlant]);

  const rowsByPlant = useMemo(() => {
    if (!selectedPlant) return [];
    return data.filter((r) => r.plant === selectedPlant);
  }, [data, selectedPlant]);

  function resetView(mode: ViewMode) {
    setViewMode(mode);
    setSelectedGroup("");
    setSelectedPlant("");
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-500">
        Loading SKU Master...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#101828]">
      <div className="sticky top-0 z-20 h-[52px] bg-white border-b border-[#E4E7EC] px-6 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-lg bg-[#185FA5] text-white flex items-center justify-center">
          🏭
        </div>
        <div>
          <div className="text-sm font-semibold">
            Line & SKU Master — 2026
          </div>
          <div className="text-[11px] text-[#98A2B3]">
            ประเภทผลิตภัณฑ์ · โรงงาน · ไลน์ผลิต · SKU
          </div>
        </div>

        <div className="ml-auto text-xs text-[#98A2B3]">
          {viewMode === "group" ? "ตามประเภท" : "ตามโรงงาน"}
          {selectedGroup && ` / ${selectedGroup}`}
          {selectedPlant && ` / ${selectedPlant}`}
        </div>
      </div>

      <div className="flex">
        <aside className="w-[196px] shrink-0 bg-white border-r border-[#E4E7EC] p-3 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
          <div className="mb-4">
            <div className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wide mb-2">
              ประเภทผลิตภัณฑ์
            </div>

            {groupSummary.map((g) => {
              const c = GROUP_COLORS[g.group] ?? {
                bg: "#F2F4F7",
                text: "#475467",
                dot: "#667085",
              };

              return (
                <button
                  key={g.group}
                  onClick={() => {
                    setViewMode("group");
                    setSelectedGroup(g.group);
                    setSelectedPlant("");
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs mb-1 hover:bg-[#F5F8FF] ${
                    selectedGroup === g.group ? "bg-[#EBF2FC]" : ""
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: c.dot }}
                  />
                  <span className="flex-1 text-left font-medium">
                    {g.group}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] bg-[#F2F4F7] px-1.5 rounded-full">
                    {g.plants.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-[#F2F4F7] my-3" />

          <div className="mb-4">
            <div className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wide mb-2">
              โรงงาน
            </div>

            {plantSummary.map((p) => (
              <button
                key={p.plant}
                onClick={() => {
                  setViewMode("plant");
                  setSelectedPlant(p.plant);
                  setSelectedGroup("");
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs mb-1 hover:bg-[#F5F8FF] ${
                  selectedPlant === p.plant ? "bg-[#EBF2FC]" : ""
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: plantColor(p.plant) }}
                />
                <span className="flex-1 text-left font-medium">
                  {p.plant}
                </span>
                <span className="text-[10px] text-[#98A2B3] bg-[#F2F4F7] px-1.5 rounded-full">
                  {p.lineCount}
                </span>
              </button>
            ))}
          </div>

          <div className="h-px bg-[#F2F4F7] my-3" />

          <div>
            <div className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wide mb-2">
              Lines per Plant
            </div>

            {plantSummary.map((p) => {
              const max = Math.max(...plantSummary.map((x) => x.lineCount), 1);
              return (
                <div key={p.plant} className="flex items-center gap-1 mb-1">
                  <div className="w-8 text-right text-[10px] text-[#98A2B3]">
                    {p.plant}
                  </div>
                  <div className="flex-1 h-2 bg-[#F2F4F7] rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(p.lineCount / max) * 100}%`,
                        backgroundColor: plantColor(p.plant),
                      }}
                    />
                  </div>
                  <div className="w-4 text-right text-[10px] font-semibold">
                    {p.lineCount}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-100 text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-0 bg-white border border-[#E4E7EC] rounded-xl p-1 w-fit mb-5">
            <button
              onClick={() => resetView("group")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium ${
                viewMode === "group"
                  ? "bg-[#185FA5] text-white"
                  : "text-[#667085]"
              }`}
            >
              ตามประเภท
            </button>
            <button
              onClick={() => resetView("plant")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium ${
                viewMode === "plant"
                  ? "bg-[#185FA5] text-white"
                  : "text-[#667085]"
              }`}
            >
              ตามโรงงาน
            </button>
          </div>

          {viewMode === "group" && !selectedGroup && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {groupSummary.map((g) => {
                const c = GROUP_COLORS[g.group] ?? {
                  bg: "#F2F4F7",
                  text: "#475467",
                  dot: "#667085",
                };

                return (
                  <button
                    key={g.group}
                    onClick={() => setSelectedGroup(g.group)}
                    className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden text-left hover:border-[#185FA5] hover:shadow-md transition"
                  >
                    <div
                      className="px-4 py-3 border-b border-[#F2F4F7]"
                      style={{ borderTop: `4px solid ${c.dot}` }}
                    >
                      <div
                        className="text-base font-bold"
                        style={{ color: c.text }}
                      >
                        {g.group}
                      </div>
                      <div className="text-[11px] text-[#98A2B3]">
                        {g.plants.length} โรงงาน · {g.lineCount} lines
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      {g.plants.map((p) => (
                        <div key={p.plant} className="flex gap-2 text-xs">
                          <span
                            className="w-2 h-2 rounded-full mt-1"
                            style={{ backgroundColor: plantColor(p.plant) }}
                          />
                          <span className="font-semibold min-w-10">
                            {p.plant}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {p.lines.map((line) => (
                              <span
                                key={line}
                                className="px-2 py-0.5 rounded-md bg-[#F9FAFB] border border-[#E4E7EC] text-[10px]"
                              >
                                {line}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === "plant" && !selectedPlant && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {plantSummary.map((p) => (
                <button
                  key={p.plant}
                  onClick={() => setSelectedPlant(p.plant)}
                  className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden text-left hover:border-[#185FA5] hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F2F4F7]">
                    <div
                      className="w-1 h-9 rounded"
                      style={{ backgroundColor: plantColor(p.plant) }}
                    />
                    <div>
                      <div className="text-base font-bold">{p.plant}</div>
                      <div className="text-[11px] text-[#98A2B3]">
                        {p.lineCount} Lines
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {p.groups.map((g) => {
                      const c = GROUP_COLORS[g.group] ?? {
                        bg: "#F2F4F7",
                        text: "#475467",
                        dot: "#667085",
                      };

                      return (
                        <div key={g.group} className="flex gap-2 items-start">
                          <span
                            className="min-w-[84px] text-center text-[10px] font-semibold px-2 py-1 rounded-md"
                            style={{ backgroundColor: c.bg, color: c.text }}
                          >
                            {g.group}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {g.lines.map((line) => (
                              <span
                                key={line}
                                className="px-2 py-0.5 rounded-md bg-[#F9FAFB] border border-[#E4E7EC] text-[10px]"
                              >
                                {line}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          )}

          {viewMode === "group" && selectedGroup && (
            <SkuTableSection
              title={selectedGroup}
              rows={rowsByGroupAndPlant}
              onBack={() => {
                setSelectedGroup("");
                setSelectedPlant("");
              }}
            />
          )}

          {viewMode === "plant" && selectedPlant && (
            <SkuTableSection
              title={selectedPlant}
              rows={rowsByPlant}
              onBack={() => setSelectedPlant("")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none" style={{ color }}>
          {value}
        </div>
        <div className="text-xs text-[#667085] mt-1">{label}</div>
      </div>
    </div>
  );
}

function SkuTableSection({
  title,
  rows,
  onBack,
}: {
  title: string;
  rows: SkuMaster[];
  onBack: () => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, SkuMaster[]>();

    rows.forEach((r) => {
      const key = `${r.plant}||${r.line}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(r);
    });

    return Array.from(map.entries()).map(([key, items]) => {
      const [plant, line] = key.split("||");
      return { plant, line, items };
    });
  }, [rows]);

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] text-xs text-[#475467] hover:bg-[#F9FAFB]"
      >
        ← กลับ
      </button>

      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold">{title}</h2>
        <span className="text-xs px-3 py-1 rounded-full bg-[#EBF4FF] text-[#185FA5]">
          {rows.length} SKU
        </span>
      </div>

      <div className="space-y-3">
        {grouped.map((g) => (
          <div
            key={`${g.plant}-${g.line}`}
            className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#FAFBFF] border-b border-[#F2F4F7] flex items-center gap-2">
              <span className="text-sm font-bold">{g.plant}</span>
              <span className="text-xs text-[#667085]">/ {g.line}</span>
              <span className="ml-auto text-xs bg-[#F2F4F7] px-2 py-0.5 rounded-full">
                {g.items.length} SKU
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F9FAFB] text-[#98A2B3]">
                  <tr>
                    <th className="px-3 py-2 text-left">Group</th>
                   
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-right">Size</th>
                    <th className="px-3 py-2 text-right">Speed (Bot./Hr.)</th>
                    <th className="px-3 py-2 text-left">Remark</th>
                  </tr>
                </thead>

                <tbody>
                  {g.items.map((r) => {
                    const c = GROUP_COLORS[r.group_product ?? ""] ?? {
                      bg: "#F2F4F7",
                      text: "#475467",
                      dot: "#667085",
                    };

                    return (
                      <tr
                        key={r._id}
                        className="border-t border-[#F2F4F7] hover:bg-[#FAFBFF]"
                      >
                        <td className="px-3 py-2">
                          <span
                            className="px-2 py-0.5 rounded-md font-semibold"
                            style={{
                              backgroundColor: c.bg,
                              color: c.text,
                            }}
                          >
                            {r.group_product ?? "-"}
                          </span>
                        </td>
                      
                        <td className="px-3 py-2 font-medium text-[#101828]">
                          {r.sku_name}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {r.size_ml?.toLocaleString() ?? "-"} ml
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-[#185FA5]">
                          {r.speed_bph?.toLocaleString() ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-[#B45309]">
                          {r.remark ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
