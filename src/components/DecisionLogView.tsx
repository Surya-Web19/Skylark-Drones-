import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Printer, 
  Compass, 
  Scale, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';

export const DecisionLogView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const decisionLogMarkdown = `# Skylark Monday.com Business Intelligence Agent - Architectural Decision Log

**Author:** AI Engineering & BI Architecture Team  
**System:** Skylark Monday.com Deals & Work Orders BI Agent  
**Framework:** Vite + React + Express + Google Gemini 3.7 Flash + Monday.com API v2  

---

## 1. Executive Context & Problem Statement
Skylark Drones operates across multiple business verticals (Mining, Renewables, Powerline, Railways, DSP & Surveillance, Construction) with high-value contracts combining field drone operations, data processing, and proprietary software deliverables (Spectra, DMO).

Leadership required an autonomous Business Intelligence agent to bridge the gap between two disconnected boards on Monday.com:
1. **"Deals Funnel"** (Sales Pipeline, opportunity sizing, stage velocity, probability forecasting)
2. **"Work Order Tracker"** (Operations, execution progress, milestone billing, collections, accounts receivable)

---

## 2. Key Assumptions Made

### A. Data Schema & Cross-Board Entity Resolution
- **Assumption 1 (Entity Key Matching):** Deal names in the Deals Funnel board directly correspond to project titles in the Work Orders board (e.g. \`Po (Kung Fu Panda)\`, \`Marge Simpson\`), with customer codes serving as secondary validation keys.
- **Assumption 2 (Missing / Corrupted Strings):** In the raw spreadsheet exports, owner codes were merged into deal names without delimiters (e.g. \`Marge SimpsonOWNER_001\`, \`Powerpuff GirlsOWNER_003\`). We assumed regex pattern matching \`^(.*?)(OWNER_\\d{3})$\` reliably disambiguates the deal name from the sales rep ID.
- **Assumption 3 (Financial Integrity on Negative Balances):** Multiple work orders showed negative \`amountToBeBilledExclGst\` (e.g. \`-82907.3\`). In real-world enterprise operations, this indicates over-delivery or expanded billings exceeding the original purchase order value. We assumed negative unbilled balances should be normalized to \`0\` with an "Overbilled / Scope Expansion" flag rather than subtracting from company pipeline.
- **Assumption 4 (Deal Valuation Fallback):** When Won deals lacked explicit numeric values, we correlated them with the corresponding Work Order PO values to prevent revenue under-reporting in executive forecasts.

---

## 3. Key Trade-offs Chosen and Why

| Area | Option Chosen | Alternative Considered | Justification / Trade-off |
| :--- | :--- | :--- | :--- |
| **Architecture** | **Full-Stack (Vite + Express + Server-side Gemini)** | Client-Only SPA with Browser API Keys | **Security & Production Readiness:** Enterprise keys (Gemini, Monday.com) must never leak into browser devtools. Express acts as a secure reverse-proxy and pre-aggregation layer. |
| **Query Engine** | **Hybrid AI Synthesis (Gemini 3.7 Flash + Deterministic Ground Truth Aggregators)** | Raw LLM Text Prompting Only | **Zero Hallucination Guarantee:** LLMs can miscalculate large floating-point sums. By pre-aggregating exact metrics in code and feeding them as grounded context, Gemini provides 100% accurate arithmetic with natural language nuance. |
| **Resilience Model** | **Two-Tier Cleaning Pipeline (Ingress Sanitization + Anomaly Audit Trail)** | Hard-Failing / Strict Type Validation | **Graceful Real-World Handling:** Strict schema validation would crash on messy strings or negative balances. Our resilient pipeline cleans and logs caveats transparently. |
| **UI Paradigm** | **Multi-Modal Hub (Chat + Visual KPIs + Executive Brief + Health Center)** | Single Chat-Only Interface | **Cognitive Efficiency:** Founders need instant visual charts and structured executive briefs for board decks alongside conversational ad-hoc drill-downs. |

---

## 4. Interpretation of "Leadership Updates"

### What "Leadership Updates" Means in Practice:
Leadership updates are **not** raw data dumps. A Founder or CXO reviewing weekly/quarterly operations needs high-signal answers to four questions:
1. **Liquidity & Cash Velocity:** How much revenue did we bill, how much did we collect, and what is our overdue AR risk?
2. **Pipeline Predictability:** What is our true weighted pipeline for next quarter across core sectors?
3. **Execution Bottlenecks:** Are completed projects stuck without invoices? Are paused work orders jeopardizing milestone billing?
4. **Actionable Mitigations:** What specific BD or operational actions are required immediately?

### How We Implemented This:
- **Executive Update Generator:** Implemented in \`/api/leadership-update\` using Gemini 3.7 Flash.
- **Structured Memos:** Formatted with Executive Summaries, Key Performance Indicators, Top Risks & Severity Badges, and Strategic Growth Directives.
- **Export Formats:** 1-click Copy as Markdown (for Slack/Email founder digests) and Print-Ready executive view.

---

## 5. What We'd Do Differently With More Time

1. **Automated Monday.com Webhooks:**
   Implement real-time bidirectional webhooks (\`item_created\`, \`column_value_changed\`) to trigger instant re-cleaning and proactive Slack alerts when high-risk accounts exceed 60 days overdue.
2. **Monte Carlo Pipeline Simulation:**
   Incorporate historical stage duration data to generate probabilistic revenue forecasts (P10, P50, P90) based on rep-specific conversion velocities.
3. **Automated Invoice Reconciliation with ERP (Zoho / SAP):**
   Connect Work Order billing status directly with banking feeds to auto-reconcile GST invoices and collections.
4. **Natural Language SQL / DuckDB WASM:**
   Embed in-browser DuckDB for zero-latency SQL querying on multi-million row historical datasets.

---

## 6. System Architecture Summary
\`\`\`
[ Monday.com GraphQL API / Raw Datasets ]
                   │
                   ▼
  [ Ingress Data Resilience & Sanitization Pipeline ]
  • Regex String Repair  • ISO Date Parser  • Anomaly Detection
                   │
                   ▼
[ Relational Synthesis Engine (Deals <-> Work Orders) ]
                   │
                   ▼
[ Express Backend (API Gateway & Grounded Aggregation) ]
                   │
                   ▼
[ Google Gemini 3.7 Flash Model (Structured Tool Calling) ]
                   │
                   ▼
[ Modern React UI: Chat BI + Visual Analytics + Leadership Brief ]
\`\`\`
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(decisionLogMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Header Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Architectural Decision Log (~2-Page Equivalent)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete technical documentation of assumptions, trade-offs, leadership update interpretation, and future roadmap.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Log</span>
          </button>
        </div>
      </div>

      {/* Styled Document Container */}
      <div className="bg-white rounded-xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 print:border-none print:shadow-none print:p-4">
        {/* Title */}
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Skylark BI Agent • Engineering Document
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            Architectural Decision Log & Design Rationale
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard: Production-Grade Full-Stack Business Intelligence Architecture
          </p>
        </div>

        {/* Section 1: Assumptions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>1. Key Assumptions Made</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 block">Cross-Board Entity Key Matching:</strong>
              <p className="leading-relaxed text-slate-600">
                Deal names in the Deals Funnel board directly correlate to project titles in the Work Orders board, with client codes acting as secondary join keys.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 block">Corrupted String Repair:</strong>
              <p className="leading-relaxed text-slate-600">
                Merged owner tokens (e.g. <code className="text-indigo-600 font-semibold bg-indigo-50 px-1 rounded">Marge SimpsonOWNER_001</code>) are disambiguated via regex parsing into Name + Assigned Owner Code.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 block">Negative Unbilled Balances:</strong>
              <p className="leading-relaxed text-slate-600">
                Negative unbilled amounts reflect scope expansion or over-billing relative to original PO. Normalized to 0 with overbilling flags.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 block">Zero-Value Won Deals:</strong>
              <p className="leading-relaxed text-slate-600">
                Won deals with missing values were correlated against corresponding Work Order PO values to avoid misleading financial metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Trade-offs */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>2. Trade-offs Chosen and Why</span>
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Decision Area</th>
                  <th className="p-3">Option Chosen</th>
                  <th className="p-3">Alternative Rejected</th>
                  <th className="p-3">Architectural Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Architecture</td>
                  <td className="p-3 text-indigo-600 font-semibold">Full-Stack (Vite + Express)</td>
                  <td className="p-3 text-slate-500">Client-Only SPA</td>
                  <td className="p-3">Protects API keys server-side and enables pre-aggregation.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">BI Query Engine</td>
                  <td className="p-3 text-indigo-600 font-semibold">Hybrid Grounded Synthesis</td>
                  <td className="p-3 text-slate-500">Raw LLM Calculations</td>
                  <td className="p-3">Eliminates arithmetic hallucinations by calculating exact sums in code.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Data Resilience</td>
                  <td className="p-3 text-indigo-600 font-semibold">Sanitize + Caveat Audit</td>
                  <td className="p-3 text-slate-500">Strict Schema Rejection</td>
                  <td className="p-3">Never crashes on real-world messy data while remaining fully transparent.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">User Interface</td>
                  <td className="p-3 text-indigo-600 font-semibold">Multi-Modal Cockpit</td>
                  <td className="p-3 text-slate-500">Chat Only</td>
                  <td className="p-3">Provides instantaneous executive visual dashboards alongside conversational depth.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Leadership Updates Interpretation */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>3. Interpretation of "Leadership Updates"</span>
          </h3>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
            <p>
              We interpreted <strong>"Leadership Updates"</strong> not as raw database dumps, but as high-signal, decision-ready executive briefings for Founders and Board Directors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-slate-900 block mb-1">1. Cash & Liquidity</span>
                <span className="text-slate-500 text-[11px]">Highlights collection efficiency, billed revenue, and overdue AR priority accounts.</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-slate-900 block mb-1">2. Pipeline Predictability</span>
                <span className="text-slate-500 text-[11px]">Computes probability-weighted forecasts and sector conversion velocities.</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-slate-900 block mb-1">3. Risk Mitigations</span>
                <span className="text-slate-500 text-[11px]">Pinpoints stuck orders, unbilled work, and outputs strategic corrective steps.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: What We'd Do Differently */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>4. What We'd Do Differently with More Time</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-indigo-600 font-bold mt-0.5">•</span>
              <span><strong>Live Webhook Subscriptions:</strong> Real-time bi-directional webhook listeners with automated Slack/Teams executive alerts for priority AR defaults.</span>
            </li>
            <li className="flex items-start space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-indigo-600 font-bold mt-0.5">•</span>
              <span><strong>Monte Carlo Revenue Forecasting:</strong> Probabilistic forecasting simulations based on individual sales rep deal cycle times and historical stage drop-offs.</span>
            </li>
            <li className="flex items-start space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-indigo-600 font-bold mt-0.5">•</span>
              <span><strong>Automated Invoicing ERP Connector:</strong> Direct integration with GST billing gateways (e.g. Zoho Books, Tally, SAP) for instantaneous reconciliation.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
