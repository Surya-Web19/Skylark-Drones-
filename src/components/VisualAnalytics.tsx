import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  Users, 
  Filter, 
  Search, 
  ArrowUpDown, 
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { CleanedDeal, CleanedWorkOrder, LinkedBusinessRecord } from '../types';

interface VisualAnalyticsProps {
  deals: CleanedDeal[];
  workOrders: CleanedWorkOrder[];
  linkedRecords: LinkedBusinessRecord[];
}

const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#64748b', '#06b6d4'];

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({
  deals,
  workOrders,
  linkedRecords
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sectors' | 'pipeline' | 'operations' | 'rep-leaderboard' | 'cross-board-table'>('overview');

  // Filtered lists
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      if (selectedSector !== 'All' && d.sector !== selectedSector) return false;
      if (selectedStatus !== 'All' && d.dealStatus !== selectedStatus) return false;
      if (searchQuery && !d.dealName.toLowerCase().includes(searchQuery.toLowerCase()) && !d.clientCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [deals, selectedSector, selectedStatus, searchQuery]);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(w => {
      if (selectedSector !== 'All' && w.sector !== selectedSector) return false;
      if (selectedStatus !== 'All' && w.executionStatus !== selectedStatus) return false;
      if (searchQuery && !w.dealName.toLowerCase().includes(searchQuery.toLowerCase()) && !w.customerCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [workOrders, selectedSector, selectedStatus, searchQuery]);

  // High-level aggregates
  const totalPipeline = useMemo(() => deals.filter(d => d.dealStatus === 'Open').reduce((acc, d) => acc + d.dealValue, 0), [deals]);
  const totalWon = useMemo(() => deals.filter(d => d.dealStatus === 'Won').reduce((acc, d) => acc + d.dealValue, 0), [deals]);
  const totalBilled = useMemo(() => workOrders.reduce((acc, w) => acc + w.billedValue, 0), [workOrders]);
  const totalCollected = useMemo(() => workOrders.reduce((acc, w) => acc + w.collectedAmount, 0), [workOrders]);
  const totalReceivables = useMemo(() => workOrders.reduce((acc, w) => acc + w.amountReceivable, 0), [workOrders]);
  const winRate = useMemo(() => {
    const closed = deals.filter(d => d.dealStatus === 'Won' || d.dealStatus === 'Dead').length;
    const won = deals.filter(d => d.dealStatus === 'Won').length;
    return closed > 0 ? Math.round((won / closed) * 100) : 0;
  }, [deals]);

  // Sector Data for Charts
  const sectorData = useMemo(() => {
    const map: Record<string, { sector: string; pipeline: number; billed: number; collected: number; count: number }> = {};
    deals.forEach(d => {
      const s = d.sector || 'Others';
      if (!map[s]) map[s] = { sector: s, pipeline: 0, billed: 0, collected: 0, count: 0 };
      if (d.dealStatus === 'Open') map[s].pipeline += d.dealValue;
      map[s].count++;
    });
    workOrders.forEach(w => {
      const s = w.sector || 'Others';
      if (!map[s]) map[s] = { sector: s, pipeline: 0, billed: 0, collected: 0, count: 0 };
      map[s].billed += w.billedValue;
      map[s].collected += w.collectedAmount;
    });
    return Object.values(map).map(item => ({
      ...item,
      pipelineLakhs: Math.round(item.pipeline / 100000),
      billedLakhs: Math.round(item.billed / 100000),
      collectedLakhs: Math.round(item.collected / 100000)
    }));
  }, [deals, workOrders]);

  // Pipeline Stage Distribution
  const stageData = useMemo(() => {
    const stages: Record<string, { stage: string; count: number; value: number }> = {};
    deals.forEach(d => {
      const s = d.dealStage || 'Other';
      if (!stages[s]) stages[s] = { stage: s, count: 0, value: 0 };
      stages[s].count++;
      stages[s].value += d.dealValue;
    });
    return Object.values(stages).sort((a, b) => b.count - a.count);
  }, [deals]);

  // BD Owner Leaderboard
  const ownerData = useMemo(() => {
    const map: Record<string, { owner: string; wonValue: number; openPipeline: number; totalDeals: number; wonCount: number }> = {};
    deals.forEach(d => {
      const o = d.ownerCode || 'UNASSIGNED';
      if (!map[o]) map[o] = { owner: o, wonValue: 0, openPipeline: 0, totalDeals: 0, wonCount: 0 };
      map[o].totalDeals++;
      if (d.dealStatus === 'Won') {
        map[o].wonValue += d.dealValue;
        map[o].wonCount++;
      } else if (d.dealStatus === 'Open') {
        map[o].openPipeline += d.dealValue;
      }
    });
    return Object.values(map).sort((a, b) => b.wonValue - a.wonValue);
  }, [deals]);

  const uniqueSectors = useMemo(() => {
    const s = new Set<string>();
    deals.forEach(d => s.add(d.sector));
    workOrders.forEach(w => s.add(w.sector));
    return ['All', ...Array.from(s).filter(Boolean)];
  }, [deals, workOrders]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Top Controls & Navigation Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'overview', label: 'Executive KPIs' },
            { id: 'sectors', label: 'Sector Intelligence' },
            { id: 'pipeline', label: 'Sales Funnel' },
            { id: 'operations', label: 'Ops & Invoicing' },
            { id: 'rep-leaderboard', label: 'BD Rep Leaderboard' },
            { id: 'cross-board-table', label: 'Cross-Board Records' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search deal/client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 pl-8 pr-3 py-1.5 rounded-lg text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
          >
            {uniqueSectors.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Active Pipeline (TCV)
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1 block">
            ₹{(totalPipeline / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {deals.filter(d => d.dealStatus === 'Open').length} Open Deals
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Won Deals Value
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 block">
            ₹{(totalWon / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {deals.filter(d => d.dealStatus === 'Won').length} Won Closed Deals
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Revenue Billed
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1 block">
            ₹{(totalBilled / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {workOrders.length} Executed Work Orders
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Cash Collected
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-teal-600 mt-1 block">
            ₹{(totalCollected / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-teal-700 font-semibold">
            {Math.round((totalCollected / (totalBilled || 1)) * 100)}% Collection Rate
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Outstanding AR
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 block">
            ₹{(totalReceivables / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-amber-700 font-medium">
            {workOrders.filter(w => w.isPriorityAR).length} Priority AR Accounts
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Pipeline Win Rate
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1 block">
            {winRate}%
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Across Closed Deals
          </span>
        </div>
      </div>

      {/* Main Tab Views */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Financial Matrix */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Sector Financial Distribution (₹ Lakhs)</span>
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sector" stroke="#64748b" fontSize={11} angle={-30} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="pipelineLakhs" fill="#4f46e5" name="Open Pipeline" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="billedLakhs" fill="#3b82f6" name="Billed Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collectedLakhs" fill="#10b981" name="Cash Collected" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline Stage Funnel */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Deal Funnel Stage Breakdown</span>
            </h3>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {stageData.map((st, idx) => {
                const pct = Math.min(100, Math.round((st.count / deals.length) * 100));
                return (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                        {st.stage}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-indigo-600 font-bold">{st.count} deals</span>
                        <span className="text-slate-500 text-[11px] font-medium">₹{(st.value / 100000).toFixed(1)}L</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sector Intelligence Tab */}
      {selectedTab === 'sectors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorData.map((sec, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-slate-900">{sec.sector}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    {sec.count} Records
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Pipeline:</span>
                    <span className="font-semibold text-indigo-600">₹{sec.pipelineLakhs} Lakhs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Billed:</span>
                    <span className="font-semibold text-blue-600">₹{sec.billedLakhs} Lakhs</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Collected:</span>
                    <span className="font-semibold text-emerald-600">₹{sec.collectedLakhs} Lakhs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BD Rep Leaderboard Tab */}
      {selectedTab === 'rep-leaderboard' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>BD / KAM Personnel Performance Matrix</span>
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-3">Personnel Code</th>
                  <th className="p-3">Closed Won Value</th>
                  <th className="p-3">Active Pipeline</th>
                  <th className="p-3">Deals Won / Total</th>
                  <th className="p-3">Win Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ownerData.map((rep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-mono text-[10px] font-bold">
                        #{idx + 1}
                      </span>
                      <span>{rep.owner}</span>
                    </td>
                    <td className="p-3 font-bold text-emerald-600">₹{(rep.wonValue / 100000).toFixed(1)} Lakhs</td>
                    <td className="p-3 text-indigo-600 font-semibold">₹{(rep.openPipeline / 100000).toFixed(1)} Lakhs</td>
                    <td className="p-3 text-slate-600 font-medium">{rep.wonCount} / {rep.totalDeals}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">
                          {Math.round((rep.wonCount / (rep.totalDeals || 1)) * 100)}%
                        </span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.round((rep.wonCount / (rep.totalDeals || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cross-Board Relational Records Table */}
      {(selectedTab === 'cross-board-table' || selectedTab === 'operations' || selectedTab === 'pipeline') && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Unified Cross-Board Records ({linkedRecords.length} Linked Deals & WOs)</span>
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96 custom-scrollbar rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold sticky top-0">
                <tr>
                  <th className="p-3">Deal / Project Name</th>
                  <th className="p-3">Client Code</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Pipeline Status</th>
                  <th className="p-3">Execution Health</th>
                  <th className="p-3">Billed Value</th>
                  <th className="p-3">Cash Collected</th>
                  <th className="p-3">Outstanding AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {linkedRecords
                  .filter(r => {
                    if (selectedSector !== 'All' && r.sector !== selectedSector) return false;
                    if (searchQuery && !r.dealName.toLowerCase().includes(searchQuery.toLowerCase()) && !r.clientCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                    return true;
                  })
                  .map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{rec.dealName}</td>
                      <td className="p-3 font-mono text-slate-500">{rec.clientCode}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {rec.sector}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.deal?.dealStatus === 'Won' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          rec.deal?.dealStatus === 'Open' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          rec.deal?.dealStatus === 'Dead' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {rec.deal?.dealStatus || 'WO Direct'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.executionHealth === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          rec.executionHealth === 'At Risk' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {rec.executionHealth}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">₹{(rec.totalBilledValue / 100000).toFixed(1)}L</td>
                      <td className="p-3 text-emerald-600 font-semibold">₹{(rec.totalCollected / 100000).toFixed(1)}L</td>
                      <td className="p-3">
                        {rec.totalReceivable > 0 ? (
                          <span className="font-bold text-amber-600">
                            ₹{(rec.totalReceivable / 100000).toFixed(1)}L
                          </span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
