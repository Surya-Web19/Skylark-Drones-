import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { VisualAnalytics } from './components/VisualAnalytics';
import { LeadershipUpdateView } from './components/LeadershipUpdateView';
import { DataHealthCenter } from './components/DataHealthCenter';
import { MondayIntegrationHub } from './components/MondayIntegrationHub';
import { DecisionLogView } from './components/DecisionLogView';
import { RAW_DEALS_DATA, RAW_WORK_ORDERS_DATA } from './data/sampleDataset';
import { cleanDeals, cleanWorkOrders, linkDealsAndWorkOrders, generateDataQualityReport } from './utils/dataCleaner';
import { CleanedDeal, CleanedWorkOrder, DataQualityReport, LinkedBusinessRecord, MondayConfig } from './types';
import { Sparkles, RefreshCw } from 'lucide-react';

// Initial pre-clean for instantaneous rendering
const initialCleanedDealsResult = cleanDeals(RAW_DEALS_DATA);
const initialCleanedWOResult = cleanWorkOrders(RAW_WORK_ORDERS_DATA);
const initialAllAnomalies = [...initialCleanedDealsResult.anomalies, ...initialCleanedWOResult.anomalies];
const initialQualityReport = generateDataQualityReport(
  RAW_DEALS_DATA,
  RAW_WORK_ORDERS_DATA,
  initialCleanedDealsResult.deals,
  initialCleanedWOResult.workOrders,
  initialAllAnomalies
);
const initialLinkedRecords = linkDealsAndWorkOrders(initialCleanedDealsResult.deals, initialCleanedWOResult.workOrders);

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [deals, setDeals] = useState<CleanedDeal[]>(initialCleanedDealsResult.deals);
  const [workOrders, setWorkOrders] = useState<CleanedWorkOrder[]>(initialCleanedWOResult.workOrders);
  const [qualityReport, setQualityReport] = useState<DataQualityReport>(initialQualityReport);
  const [linkedRecords, setLinkedRecords] = useState<LinkedBusinessRecord[]>(initialLinkedRecords);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  const [mondayConfig, setMondayConfig] = useState<MondayConfig>({
    apiKey: '',
    dealsBoardId: '5829104821',
    workOrdersBoardId: '5829104822',
    isConnected: false,
    autoSyncIntervalMinutes: 15
  });

  // Fetch verified data summary from server API on mount
  useEffect(() => {
    async function loadServerSummary() {
      try {
        const res = await fetch('/api/data/summary');
        if (res.ok) {
          const data = await res.json();
          if (data.deals) setDeals(data.deals);
          if (data.workOrders) setWorkOrders(data.workOrders);
          if (data.qualityReport) setQualityReport(data.qualityReport);
          if (data.linkedRecords) setLinkedRecords(data.linkedRecords);
        }
      } catch (err) {
        console.warn('Using client-side pre-cleaned dataset snapshot:', err);
      }
    }
    loadServerSummary();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Application Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        qualityReport={qualityReport}
        mondayConfig={mondayConfig}
        onOpenMondayModal={() => setActiveTab('monday-hub')}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-8">
        {activeTab === 'chat' && (
          <ChatInterface
            deals={deals}
            workOrders={workOrders}
          />
        )}

        {activeTab === 'analytics' && (
          <VisualAnalytics
            deals={deals}
            workOrders={workOrders}
            linkedRecords={linkedRecords}
          />
        )}

        {activeTab === 'leadership' && (
          <LeadershipUpdateView />
        )}

        {activeTab === 'data-health' && (
          <DataHealthCenter
            qualityReport={qualityReport}
          />
        )}

        {activeTab === 'monday-hub' && (
          <MondayIntegrationHub
            mondayConfig={mondayConfig}
            setMondayConfig={setMondayConfig}
          />
        )}

        {activeTab === 'decision-log' && (
          <DecisionLogView />
        )}
      </main>
    </div>
  );
}
