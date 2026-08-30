import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Filter, 
  Search, 
  Check, 
  Info, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { DataQualityReport, DataAnomaly } from '../types';

interface DataHealthCenterProps {
  qualityReport: DataQualityReport;
}

export const DataHealthCenter: React.FC<DataHealthCenterProps> = ({ qualityReport }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAnomalies = qualityReport.anomalies.filter(anom => {
    if (selectedSeverity !== 'all' && anom.severity !== selectedSeverity) return false;
    if (selectedBoard !== 'all' && anom.board !== selectedBoard) return false;
    if (searchQuery && !anom.description.toLowerCase().includes(searchQuery.toLowerCase()) && !anom.recordId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Top Banner: Health Score & Integrity Summary */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Score Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shadow-2xs">
              <div className="text-center">
                <span className="text-2xl font-extrabold text-indigo-600 block tracking-tight">
                  {qualityReport.overallHealthScore}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Health
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Data Cleanliness & Resilience Engine
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Active Guardrails
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Raw Monday.com spreadsheets often contain corrupted text concatenations, negative unbilled balances, unparsed timestamps, and missing invoice keys. Our resilience pipeline automatically cleans and harmonizes datasets before BI synthesis.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Records</span>
              <span className="text-lg font-bold text-slate-900">
                {qualityReport.totalDealsCount + qualityReport.totalWorkOrdersCount}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Clean Records</span>
              <span className="text-lg font-bold text-emerald-600">
                {qualityReport.cleanDealsCount + qualityReport.cleanWorkOrdersCount}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Anomalies</span>
              <span className="text-lg font-bold text-amber-600">
                {qualityReport.anomalyCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Normalization Rules */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Automated Normalization Rules Applied</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {qualityReport.normalizationRulesApplied.map((rule, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-start space-x-2 text-xs text-slate-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Audit Log */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Detected Anomalies & Auto-Correction Audit Log ({filteredAnomalies.length})
            </h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search anomaly..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 pl-8 pr-3 py-1.5 rounded-lg text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>

            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Boards</option>
              <option value="Deals">Deals Board</option>
              <option value="Work Orders">Work Orders Board</option>
            </select>
          </div>
        </div>

        {/* Anomaly Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredAnomalies.map((anom) => (
            <div
              key={anom.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
                anom.severity === 'high'
                  ? 'bg-rose-50/50 border-rose-200/80'
                  : anom.severity === 'medium'
                  ? 'bg-amber-50/50 border-amber-200/80'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    anom.severity === 'high' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    anom.severity === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {anom.severity}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {anom.recordId}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600 font-medium">
                    {anom.board}
                  </span>
                </div>

                <span className={`text-[11px] font-semibold flex items-center space-x-1 ${
                  anom.resolved ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {anom.resolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{anom.resolved ? 'Auto-Repaired' : 'Action Needed'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {anom.description}
              </p>

              {anom.suggestedCorrection && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex items-start space-x-1.5 shadow-2xs">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo-600 font-semibold">Correction: </strong>
                    {anom.suggestedCorrection}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
