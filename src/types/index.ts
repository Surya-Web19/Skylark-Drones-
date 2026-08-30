export interface RawDeal {
  id?: string;
  dealName: string;
  ownerCode: string;
  clientCode: string;
  dealStatus: string; // Open, Won, Dead, On Hold, etc.
  closeDate?: string;
  closureProbability?: string; // High, Medium, Low, or empty
  maskedDealValue?: number | string;
  tentativeCloseDate?: string;
  dealStage?: string; // e.g. A. Lead Generated, B. Sales Qualified Leads, E. Proposal/Commercials Sent, F. Negotiations, G. Project Won, etc.
  productDeal?: string; // Service + Spectra, Pure Service, Hardware, etc.
  sectorService?: string; // Mining, Powerline, Renewables, DSP, Railways, Tender, Construction, etc.
  createdDate?: string;
}

export interface RawWorkOrder {
  id?: string;
  dealNameMasked: string;
  customerNameCode: string;
  serialNumber: string;
  natureOfWork: string; // One time Project, Proof of Concept, Monthly Contract, Annual Rate Contract
  lastExecutedMonthRecurring?: string;
  executionStatus: string; // Completed, Ongoing, Not Started, Pause / struck, Partial Completed, Details pending from Client
  dataDeliveryDate?: string;
  dateOfPOLOI?: string;
  documentType?: string; // Purchase Order, LOA/LOI, Email Confirmation
  probableStartDate?: string;
  probableEndDate?: string;
  bdKamPersonnelCode: string;
  sector: string;
  typeOfWork?: string;
  softwareDeliverable?: string; // NONE, SPECTRA, DMO, SPECTRA + DMO
  lastInvoiceDate?: string;
  latestInvoiceNo?: string;
  amountExclGst?: number | string;
  amountInclGst?: number | string;
  billedValueExclGst?: number | string;
  billedValueInclGst?: number | string;
  collectedAmountInclGst?: number | string;
  amountToBeBilledExclGst?: number | string;
  amountToBeBilledInclGst?: number | string;
  amountReceivable?: number | string;
  arPriorityAccount?: string; // Priority or blank
  quantityByOps?: number | string;
  quantitiesAsPerPO?: number | string;
  quantityBilledTillDate?: number | string;
  balanceInQuantity?: number | string;
  invoiceStatus?: string; // Fully Billed, Partially Billed, Not billed yet, Billed- Visit 7, Stuck
  expectedBillingMonth?: string;
  actualBillingMonth?: string;
  actualCollectionMonth?: string;
  woStatusBilled?: string; // Open, Closed
  collectionStatus?: string;
  collectionDate?: string;
  billingStatus?: string; // Update Required, Partially Billed, Billed, Not Billable, Stuck
}

export interface CleanedDeal {
  id: string;
  dealName: string;
  ownerCode: string;
  clientCode: string;
  dealStatus: 'Open' | 'Won' | 'Dead' | 'On Hold' | 'Other';
  closeDate: string | null;
  closureProbability: 'High' | 'Medium' | 'Low' | 'Unspecified';
  dealValue: number;
  tentativeCloseDate: string | null;
  dealStage: string;
  productDeal: string;
  sector: string;
  createdDate: string | null;
  hasSoftware: boolean;
  softwareTypes: string[];
  anomalies: string[];
  quarter: string;
}

export interface CleanedWorkOrder {
  id: string;
  dealName: string;
  customerCode: string;
  serialNumber: string;
  natureOfWork: string;
  executionStatus: 'Completed' | 'Ongoing' | 'Not Started' | 'Paused / Struck' | 'Partial Completed' | 'Pending Details';
  dataDeliveryDate: string | null;
  poDate: string | null;
  documentType: string;
  startDate: string | null;
  endDate: string | null;
  ownerCode: string;
  sector: string;
  typeOfWork: string;
  softwareDeliverable: 'NONE' | 'SPECTRA' | 'DMO' | 'SPECTRA + DMO' | 'Other';
  latestInvoiceNo: string | null;
  lastInvoiceDate: string | null;
  orderValue: number;
  billedValue: number;
  collectedAmount: number;
  amountToBeBilled: number;
  amountReceivable: number;
  isPriorityAR: boolean;
  invoiceStatus: 'Fully Billed' | 'Partially Billed' | 'Not Billed' | 'Stuck' | 'Other';
  woStatus: 'Open' | 'Closed';
  billingStatus: string;
  quantityOps: number;
  quantityPO: number;
  quantityBilled: number;
  balanceQuantity: number;
  anomalies: string[];
  completionRate: number;
  collectionRate: number;
}

export interface DataAnomaly {
  id: string;
  type: 'negative_value' | 'missing_date' | 'status_mismatch' | 'unlinked_record' | 'corrupted_string' | 'calculation_divergence';
  severity: 'high' | 'medium' | 'low';
  board: 'Deals' | 'Work Orders';
  recordId: string;
  field: string;
  description: string;
  suggestedCorrection: string;
  resolved: boolean;
}

export interface DataQualityReport {
  overallHealthScore: number;
  totalDealsCount: number;
  totalWorkOrdersCount: number;
  cleanDealsCount: number;
  cleanWorkOrdersCount: number;
  anomalyCount: number;
  anomalies: DataAnomaly[];
  missingValuesSummary: {
    dealsMissingDates: number;
    dealsMissingValues: number;
    dealsMissingOwners: number;
    workOrdersMissingDates: number;
    workOrdersMissingInvoices: number;
    workOrdersNegativeBalances: number;
  };
  normalizationRulesApplied: string[];
}

export interface LinkedBusinessRecord {
  dealName: string;
  clientCode: string;
  sector: string;
  deal?: CleanedDeal;
  workOrders: CleanedWorkOrder[];
  totalPipelineValue: number;
  totalOrderValue: number;
  totalBilledValue: number;
  totalCollected: number;
  totalReceivable: number;
  executionHealth: 'Healthy' | 'At Risk' | 'Delayed' | 'Completed' | 'Pre-execution';
}

export interface BIQueryResponse {
  query: string;
  executiveSummary: string;
  keyMetrics: {
    label: string;
    value: string | number;
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }[];
  detailedFindings: string[];
  strategicInsights: string[];
  dataQualityCaveats: string[];
  confidenceScore: number; // 0-100
  chartData?: {
    type: 'bar' | 'pie' | 'line' | 'composed' | 'funnel';
    title: string;
    description?: string;
    data: any[];
    xAxisKey?: string;
    dataKeys?: { key: string; color: string; label: string }[];
  };
  recommendedActions: string[];
  followUpQuestions: string[];
  relatedDeals?: Partial<CleanedDeal>[];
  relatedWorkOrders?: Partial<CleanedWorkOrder>[];
}

export interface LeadershipUpdate {
  title: string;
  period: string;
  generatedAt: string;
  executiveSummary: string;
  financialPerformance: {
    totalRevenueBilled: number;
    totalCashCollected: number;
    totalOutstandingReceivables: number;
    collectionEfficiencyPct: number;
    arPriorityAccountsCount: number;
    priorityReceivableAmount: number;
  };
  pipelineHealth: {
    totalActivePipeline: number;
    weightedPipeline: number;
    wonDealsValue: number;
    winRatePct: number;
    topSectorsByPipeline: { sector: string; value: number; count: number }[];
    topOwnersByRevenue: { owner: string; value: number; dealsCount: number }[];
  };
  operationalHighlights: {
    completedProjectsCount: number;
    ongoingProjectsCount: number;
    stuckOrPausedCount: number;
    softwareAttachmentRatePct: number;
    bottlenecks: string[];
  };
  topRisksAndFlags: {
    title: string;
    severity: 'critical' | 'warning' | 'info';
    impact: string;
    mitigation: string;
  }[];
  strategicRecommendations: string[];
}

export interface MondayConfig {
  apiKey: string;
  dealsBoardId: string;
  workOrdersBoardId: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}
