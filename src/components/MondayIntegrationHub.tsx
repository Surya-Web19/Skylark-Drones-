import React, { useState } from 'react';
import { 
  Plug, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Send, 
  Database, 
  ArrowRight, 
  Key, 
  Layers, 
  Code,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { MondayConfig } from '../types';

interface MondayIntegrationHubProps {
  mondayConfig: MondayConfig;
  setMondayConfig: React.Dispatch<React.SetStateAction<MondayConfig>>;
}

const SAMPLE_GRAPHQL_QUERIES = [
  {
    name: 'Get Current Account & User',
    query: `query {
  me {
    id
    name
    email
    is_guest
    account {
      id
      name
    }
  }
}`
  },
  {
    name: 'List Workspace Boards & Columns',
    query: `query {
  boards(limit: 5) {
    id
    name
    state
    columns {
      id
      title
      type
    }
  }
}`
  },
  {
    name: 'Fetch Items with Column Values',
    query: `query {
  boards(ids: [1234567890]) {
    name
    items_page(limit: 10) {
      items {
        id
        name
        column_values {
          id
          text
          value
        }
      }
    }
  }
}`
  }
];

export const MondayIntegrationHub: React.FC<MondayIntegrationHubProps> = ({
  mondayConfig,
  setMondayConfig
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(mondayConfig.apiKey || '');
  const [dealsBoardId, setDealsBoardId] = useState(mondayConfig.dealsBoardId || '');
  const [workOrdersBoardId, setWorkOrdersBoardId] = useState(mondayConfig.workOrdersBoardId || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const [activeQuery, setActiveQuery] = useState(SAMPLE_GRAPHQL_QUERIES[0].query);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryOutput, setQueryOutput] = useState<string | null>(null);

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid Monday.com API Token.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/monday/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput })
      });
      const data = await res.json();

      if (data.success) {
        setMondayConfig(prev => ({
          ...prev,
          apiKey: apiKeyInput,
          dealsBoardId,
          workOrdersBoardId,
          isConnected: true,
          lastSyncTime: new Date().toISOString()
        }));
        setTestResult({
          success: true,
          message: `Connected successfully as ${data.user?.name} (${data.user?.account?.name || 'Skylark Account'})`,
          data: data.user
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to authenticate with Monday.com GraphQL API'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network connection failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!apiKeyInput.trim()) {
      setQueryOutput(JSON.stringify({ error: "Please provide a Monday.com API key first" }, null, 2));
      return;
    }

    setIsExecutingQuery(true);
    try {
      const res = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKeyInput,
          'API-Version': '2024-01'
        },
        body: JSON.stringify({ query: activeQuery })
      });
      const data = await res.json();
      setQueryOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setQueryOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsExecutingQuery(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Configuration Box */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Plug className="w-5 h-5 text-indigo-600" />
              <span>Monday.com Live GraphQL Integration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sync real-time Deals and Work Orders boards directly via Monday.com API v2.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${mondayConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-semibold text-slate-600">
              {mondayConfig.isConnected ? 'Live API Connected' : 'Running on High-Fidelity Dataset Snapshot'}
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Monday.com API V2 Personal Token</span>
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full bg-slate-50 px-3.5 py-2.5 rounded-lg text-xs text-slate-800 font-mono border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Find this in Monday.com &gt; Avatar &gt; Developers &gt; Developer &gt; API token.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deals Funnel Board ID
            </label>
            <input
              type="text"
              value={dealsBoardId}
              onChange={(e) => setDealsBoardId(e.target.value)}
              placeholder="e.g. 5829104821"
              className="w-full bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-800 font-mono border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Orders Board ID
            </label>
            <input
              type="text"
              value={workOrdersBoardId}
              onChange={(e) => setWorkOrdersBoardId(e.target.value)}
              placeholder="e.g. 5829104822"
              className="w-full bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-800 font-mono border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plug className="w-3.5 h-3.5" />}
              <span>{isTesting ? 'Validating Token...' : 'Test & Sync Connection'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg border text-xs flex items-center space-x-2 ${
            testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Interactive GraphQL Console */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Monday.com GraphQL API Explorer
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_GRAPHQL_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuery(sq.query)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                {sq.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Query Editor</label>
            <textarea
              value={activeQuery}
              onChange={(e) => setActiveQuery(e.target.value)}
              rows={9}
              className="w-full bg-slate-900 p-3 rounded-lg font-mono text-xs text-indigo-200 border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleExecuteQuery}
              disabled={isExecutingQuery}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs disabled:opacity-50"
            >
              {isExecutingQuery ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>Execute GraphQL Query</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Response JSON</label>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 h-[216px] overflow-y-auto custom-scrollbar">
              <pre>{queryOutput || '// Click "Execute GraphQL Query" to test Monday.com responses live.'}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
