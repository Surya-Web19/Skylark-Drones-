import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Printer,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { LeadershipUpdate } from '../types';

interface LeadershipUpdateViewProps {
  initialUpdate?: LeadershipUpdate | null;
}

export const LeadershipUpdateView: React.FC<LeadershipUpdateViewProps> = ({ initialUpdate }) => {
  const [period, setPeriod] = useState<string>('Q1 FY26 Executive Briefing');
  const [focus, setFocus] = useState<string>('All Operations');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<LeadershipUpdate | null>(initialUpdate || null);

  const generateUpdate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/leadership-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, focus })
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setUpdateData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (!updateData) {
      generateUpdate();
    }
  }, []);

  const handleCopyMarkdown = () => {
    if (!updateData) return;
    const md = `# ${updateData.title}
**Period:** ${updateData.period} | **Generated:** ${new Date(updateData.generatedAt).toLocaleDateString()}

## Executive Summary
${updateData.executiveSummary}

## Financial Performance
- **Total Revenue Billed:** ₹${(updateData.financialPerformance.totalRevenueBilled / 10000000).toFixed(2)} Cr
- **Total Cash Collected:** ₹${(updateData.financialPerformance.totalCashCollected / 10000000).toFixed(2)} Cr (${updateData.financialPerformance.collectionEfficiencyPct}% Collection Efficiency)
- **Outstanding Receivables:** ₹${(updateData.financialPerformance.totalOutstandingReceivables / 10000000).toFixed(2)} Cr

## Pipeline Health
- **Active Pipeline:** ₹${(updateData.pipelineHealth.totalActivePipeline / 10000000).toFixed(2)} Cr
- **Weighted Forecast:** ₹${(updateData.pipelineHealth.weightedPipeline / 10000000).toFixed(2)} Cr
- **Win Rate:** ${updateData.pipelineHealth.winRatePct}%

## Top Risks & Action Plan
${updateData.topRisksAndFlags.map(r => `### [${r.severity.toUpperCase()}] ${r.title}\n- **Impact:** ${r.impact}\n- **Mitigation:** ${r.mitigation}`).join('\n\n')}

## Strategic Next Steps
${updateData.strategicRecommendations.map(s => `- ${s}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Control Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Executive Leadership Update Generator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated intelligence brief tailored for Founders, CXOs, and Board Updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="Q1 FY26 Executive Briefing">Q1 FY26 Executive Briefing</option>
            <option value="Monthly Founder Review (Current Month)">Monthly Founder Review</option>
            <option value="Weekly Operations & Collection Sprint">Weekly Ops & Collection Sprint</option>
            <option value="Annual Performance Strategy">Annual Performance Strategy</option>
          </select>

          <button
            onClick={generateUpdate}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Brief'}</span>
          </button>

          {updateData && (
            <>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                title="Copy as Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy MD'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                title="Print Executive Document"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Document Content */}
      {updateData ? (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 print:border-none print:shadow-none print:p-4">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Skylark Drones • Executive Intelligence
              </span>
              <span className="text-xs font-mono text-slate-500">
                {new Date(updateData.generatedAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              {updateData.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Scope: Cross-board synthesis of Deals Pipeline, Project Work Orders, and Invoicing Health.
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>1. Executive Summary & Highlights</span>
            </h3>
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              {updateData.executiveSummary}
            </p>
          </div>

          {/* Section 2: Financial & Operational Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Performance */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>2. Revenue & Cash Collection</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Billed Revenue</span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{(updateData.financialPerformance.totalRevenueBilled / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Cash Collected</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{(updateData.financialPerformance.totalCashCollected / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Collection Rate</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {updateData.financialPerformance.collectionEfficiencyPct}%
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Outstanding AR</span>
                  <span className="text-lg font-bold text-amber-600">
                    ₹{(updateData.financialPerformance.totalOutstandingReceivables / 10000000).toFixed(2)} Cr
                  </span>
                </div>
              </div>
            </div>

            {/* Pipeline Health */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>3. Sales Pipeline Health</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Active Pipeline</span>
                  <span className="text-lg font-bold text-indigo-600">
                    ₹{(updateData.pipelineHealth.totalActivePipeline / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Weighted Forecast</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{(updateData.pipelineHealth.weightedPipeline / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Closed Won TCV</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{(updateData.pipelineHealth.wonDealsValue / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Win Rate</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {updateData.pipelineHealth.winRatePct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Operational Execution & Delivery Bottlenecks */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              4. Operational Execution & Delivery Bottlenecks
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-2xs">
                <span className="text-xs text-slate-500 font-medium block">Completed Projects</span>
                <span className="text-xl font-bold text-emerald-600">
                  {updateData.operationalHighlights.completedProjectsCount}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-2xs">
                <span className="text-xs text-slate-500 font-medium block">Ongoing Projects</span>
                <span className="text-xl font-bold text-indigo-600">
                  {updateData.operationalHighlights.ongoingProjectsCount}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-2xs">
                <span className="text-xs text-slate-500 font-medium block">Stuck / Paused</span>
                <span className="text-xl font-bold text-rose-600">
                  {updateData.operationalHighlights.stuckOrPausedCount}
                </span>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
              {updateData.operationalHighlights.bottlenecks.map((bn, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-600 font-bold mt-0.5">•</span>
                  <span>{bn}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Critical Risks & Mitigations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>5. Critical Risks & Executive Mitigations</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {updateData.topRisksAndFlags.map((risk, idx) => (
                <div key={idx} className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{risk.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      risk.severity === 'critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong className="text-slate-900">Impact:</strong> {risk.impact}
                  </p>
                  <p className="text-xs text-emerald-800 font-medium">
                    <strong className="text-slate-900">Mitigation:</strong> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Strategic Growth Directives */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              6. Strategic Directives for Next Period
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {updateData.strategicRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-600 font-bold mt-0.5">→</span>
                  <span className="font-medium leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium">Synthesizing leadership update from clean cross-board records...</p>
        </div>
      )}
    </div>
  );
};
