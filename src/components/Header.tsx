import React from 'react';
import { 
  Bot, 
  BarChart3, 
  FileText, 
  ShieldCheck, 
  Plug, 
  BookOpen, 
  Sparkles,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { DataQualityReport, MondayConfig } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  qualityReport: DataQualityReport;
  mondayConfig: MondayConfig;
  onOpenMondayModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  qualityReport,
  mondayConfig,
  onOpenMondayModal
}) => {
  const tabs = [
    { id: 'chat', label: 'AI BI Agent', icon: Bot },
    { id: 'analytics', label: 'Cross-Board Analytics', icon: BarChart3 },
    { id: 'leadership', label: 'Leadership Updates', icon: FileText },
    { id: 'data-health', label: 'Data Resilience', icon: ShieldCheck, badge: `${qualityReport.overallHealthScore}%` },
    { id: 'monday-hub', label: 'Monday.com Hub', icon: Plug, statusDot: mondayConfig.isConnected },
    { id: 'decision-log', label: 'Decision Log', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-900/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-white">
                  Skylark Drones
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  BI Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Monday.com Deals & Work Orders Intelligence
              </p>
            </div>
          </div>

          {/* Quick Badges & Integration Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('data-health')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                qualityReport.overallHealthScore >= 80
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/40'
              }`}
              title="Data Cleanliness & Resilience Score"
            >
              <div className={`w-2 h-2 rounded-full ${qualityReport.overallHealthScore >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} />
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Health: {qualityReport.overallHealthScore}%</span>
            </button>

            <button
              onClick={onOpenMondayModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750 transition-colors"
              title="Monday.com Integration Status"
            >
              <div className={`w-2 h-2 rounded-full ${mondayConfig.isConnected ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className="hidden md:inline text-slate-400">Monday.com:</span>
              <span>{mondayConfig.isConnected ? 'Connected' : 'Demo Snapshot'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-1.5 border-t border-slate-800/80 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.statusDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
