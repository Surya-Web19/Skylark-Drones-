import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Share2, 
  Copy, 
  Check, 
  HelpCircle,
  BarChart2,
  PieChart as PieIcon,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BIQueryResponse, CleanedDeal, CleanedWorkOrder } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text?: string;
  response?: BIQueryResponse;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  deals: CleanedDeal[];
  workOrders: CleanedWorkOrder[];
}

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#64748b'];

const SAMPLE_QUERIES = [
  "How's our pipeline looking for energy & renewables sector this quarter?",
  "Which work orders are completed but have unbilled or uncollected amounts?",
  "Compare revenue generation and win rates across all BD Owners.",
  "What is our total outstanding accounts receivable and high-risk priority accounts?",
  "How does software adoption (Spectra / DMO) correlate with deal size?",
  "What is our probability-weighted forecast for next quarter?"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ deals, workOrders }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Hello, I am your Monday.com Business Intelligence Agent for Skylark Drones. I continuously sync and clean data across your Deals Pipeline and Work Orders boards. Ask me founder-level questions on revenue, pipeline health, sector performance, AR risks, or operational metrics."
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isSubmitting) return;

    const userMsgId = `user-${Date.now()}`;
    const agentMsgId = `agent-${Date.now()}`;

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: textToSend
      },
      {
        id: agentMsgId,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLoading: true
      }
    ];

    setMessages(newMessages);
    setInputQuery('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          customDeals: deals,
          customWorkOrders: workOrders
        })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data: BIQueryResponse = await res.json();

      setMessages(prev =>
        prev.map(msg =>
          msg.id === agentMsgId
            ? {
                ...msg,
                isLoading: false,
                response: data
              }
            : msg
        )
      );
    } catch (err: any) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === agentMsgId
            ? {
                ...msg,
                isLoading: false,
                text: `Apologies, I encountered an issue analyzing the data: ${err.message || 'Unknown error'}. Please try rephrasing or selecting one of the suggested queries below.`
              }
            : msg
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3">
      {/* Sample Quick Questions Pills */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Suggested Founder Queries
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg text-xs bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 whitespace-nowrap transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <span>{q}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60 text-indigo-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'agent' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-xl p-4 sm:p-5 transition-all ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-xs w-full'
              }`}
            >
              {/* Text only message / Welcome */}
              {msg.text && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
              )}

              {/* Loading State */}
              {msg.isLoading && (
                <div className="flex items-center space-x-3 py-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium animate-pulse">
                    Querying cross-board data, cleaning anomalies & synthesizing intelligence...
                  </span>
                </div>
              )}

              {/* Rich BI Agent Response */}
              {msg.response && (
                <div className="space-y-4">
                  {/* Top Bar: Confidence & Actions */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                        <span>Confidence: {msg.response.confidenceScore}%</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.response?.executiveSummary || '', msg.id)}
                      className="text-slate-500 hover:text-slate-700 text-xs flex items-center space-x-1 p-1 rounded hover:bg-slate-100 transition-colors"
                      title="Copy Executive Summary"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Executive Summary Card */}
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center space-x-2 text-indigo-900 mb-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        Executive TL;DR
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {msg.response.executiveSummary}
                    </p>
                  </div>

                  {/* Key Metrics Cards */}
                  {msg.response.keyMetrics && msg.response.keyMetrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {msg.response.keyMetrics.map((metric, mIdx) => (
                        <div
                          key={mIdx}
                          className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between"
                        >
                          <span className="text-[11px] font-semibold text-slate-500 truncate">
                            {metric.label}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight my-0.5">
                            {metric.value}
                          </span>
                          {metric.subtext && (
                            <span className="text-[10px] text-slate-500 truncate font-medium">
                              {metric.subtext}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Visual Chart if available */}
                  {msg.response.chartData && msg.response.chartData.data?.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <BarChart2 className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {msg.response.chartData.title}
                          </span>
                        </div>
                      </div>
                      <div className="h-60 sm:h-64 w-full">
                        {msg.response.chartData.type === 'pie' ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={msg.response.chartData.data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {msg.response.chartData.data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#e2e8f0' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={msg.response.chartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis
                                dataKey={msg.response.chartData.xAxisKey || 'name'}
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                angle={-25}
                                textAnchor="end"
                              />
                              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#e2e8f0' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                              {msg.response.chartData.dataKeys && msg.response.chartData.dataKeys.length > 0 ? (
                                msg.response.chartData.dataKeys.map((dk, dkIdx) => (
                                  <Bar key={dkIdx} dataKey={dk.key} fill={dk.color || COLORS[dkIdx % COLORS.length]} name={dk.label || dk.key} radius={[4, 4, 0, 0]} />
                                ))
                              ) : (
                                <Bar dataKey="value" fill="#4f46e5" name="Value" radius={[4, 4, 0, 0]} />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detailed Findings & Insights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.response.detailedFindings && msg.response.detailedFindings.length > 0 && (
                      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          Key Operational Findings
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {msg.response.detailedFindings.map((finding, fIdx) => (
                            <li key={fIdx} className="flex items-start space-x-1.5">
                              <span className="text-indigo-600 font-bold mt-0.5">•</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.response.strategicInsights && msg.response.strategicInsights.length > 0 && (
                      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-2">
                          Strategic Takeaways
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {msg.response.strategicInsights.map((insight, iIdx) => (
                            <li key={iIdx} className="flex items-start space-x-1.5">
                              <span className="text-amber-500 font-bold mt-0.5">→</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Data Quality Caveats Banner */}
                  {msg.response.dataQualityCaveats && msg.response.dataQualityCaveats.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 block mb-0.5">
                          Data Quality Caveats & Integrity Notes
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                          {msg.response.dataQualityCaveats.map((cav, cIdx) => (
                            <li key={cIdx}>{cav}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Proactive Follow-up Questions */}
                  {msg.response.followUpQuestions && msg.response.followUpQuestions.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Follow-Up Drill-Downs
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.response.followUpQuestions.map((fu, fuIdx) => (
                          <button
                            key={fuIdx}
                            onClick={() => handleSend(fu)}
                            disabled={isSubmitting}
                            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-left transition-all font-medium"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 bg-white rounded-xl border border-slate-200 p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything across Deals, Pipeline, Work Orders, Receivables..."
            disabled={isSubmitting}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSubmitting}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center justify-center transition-all ${
              inputQuery.trim() && !isSubmitting
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <div className="flex items-center space-x-1.5">
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
