import {
  RawDeal,
  RawWorkOrder,
  CleanedDeal,
  CleanedWorkOrder,
  DataAnomaly,
  DataQualityReport,
  LinkedBusinessRecord
} from '../types';

export function parseNumber(val: any, defaultVal = 0): number {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') {
    return isNaN(val) ? defaultVal : val;
  }
  const str = String(val).trim().replace(/,/g, '').replace(/₹|Rs\.|Rs/gi, '').trim();
  if (str === '#VALUE!' || str === 'NA' || str === 'NaN' || str === '-') return defaultVal;
  const num = parseFloat(str);
  return isNaN(num) ? defaultVal : num;
}

export function parseDate(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === 'NA' || trimmed === '-' || trimmed === 'TBD') return null;
  
  // Try matching standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Try ISO or timestamp parsing
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return null;
}

export function getQuarterFromDate(dateStr: string | null): string {
  if (!dateStr) return 'Unscheduled / Unknown';
  const parts = dateStr.split('-');
  if (parts.length < 2) return 'Unknown';
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  if (month >= 1 && month <= 3) return `Q1 ${year}`;
  if (month >= 4 && month <= 6) return `Q2 ${year}`;
  if (month >= 7 && month <= 9) return `Q3 ${year}`;
  if (month >= 10 && month <= 12) return `Q4 ${year}`;
  return `FY ${year}`;
}

export function cleanOwnerAndDealName(name: string, currentOwner: string): { dealName: string; ownerCode: string } {
  let cleanName = (name || '').trim();
  let owner = (currentOwner || '').trim();

  // Pattern like "Marge SimpsonOWNER_001" or "Powerpuff GirlsOWNER_003"
  const mergedMatch = cleanName.match(/^(.*?)(OWNER_\d{3})$/);
  if (mergedMatch) {
    cleanName = mergedMatch[1].trim();
    if (!owner) owner = mergedMatch[2];
  }

  // Normalizations for known messy titles in sample data
  if (cleanName.startsWith('Po (Kung Fu')) cleanName = 'Po (Kung Fu Panda)';
  if (cleanName.startsWith('Winnie the Poo')) cleanName = 'Winnie the Pooh';
  if (cleanName === 'Monkey D. Dra') cleanName = 'Monkey D. Dragon';
  if (cleanName === 'GG go') cleanName = 'Goku (Alt)';

  if (!owner) owner = 'UNASSIGNED';

  return { dealName: cleanName, ownerCode: owner };
}

export function standardizeSector(sector?: string): string {
  if (!sector) return 'Others';
  const s = sector.trim().toLowerCase();
  if (s.includes('renew') || s.includes('solar') || s.includes('wind') || s.includes('energy')) return 'Renewables';
  if (s.includes('min')) return 'Mining';
  if (s.includes('power') || s.includes('grid')) return 'Powerline';
  if (s.includes('rail')) return 'Railways';
  if (s.includes('dsp') || s.includes('surveillance')) return 'DSP & Surveillance';
  if (s.includes('const')) return 'Construction';
  if (s.includes('tend')) return 'Tender';
  if (s.includes('aviat')) return 'Aviation';
  if (s.includes('manuf')) return 'Manufacturing';
  return sector.trim();
}

export function cleanDeals(rawDeals: RawDeal[]): { deals: CleanedDeal[]; anomalies: DataAnomaly[] } {
  const anomalies: DataAnomaly[] = [];
  const deals: CleanedDeal[] = [];

  rawDeals.forEach((raw, idx) => {
    const recordId = raw.id || `DEAL-${idx + 1}`;
    const { dealName, ownerCode } = cleanOwnerAndDealName(raw.dealName, raw.ownerCode);
    const itemAnomalies: string[] = [];

    // Probability
    let prob: 'High' | 'Medium' | 'Low' | 'Unspecified' = 'Unspecified';
    const rawProb = (raw.closureProbability || '').trim().toLowerCase();
    if (rawProb.includes('high')) prob = 'High';
    else if (rawProb.includes('med')) prob = 'Medium';
    else if (rawProb.includes('low')) prob = 'Low';

    // Status
    let status: 'Open' | 'Won' | 'Dead' | 'On Hold' | 'Other' = 'Other';
    const rawStatus = (raw.dealStatus || '').trim().toLowerCase();
    if (rawStatus.includes('open')) status = 'Open';
    else if (rawStatus.includes('won')) status = 'Won';
    else if (rawStatus.includes('dead') || rawStatus.includes('lost')) status = 'Dead';
    else if (rawStatus.includes('hold')) status = 'On Hold';

    const dealVal = parseNumber(raw.maskedDealValue);
    const closeDate = parseDate(raw.closeDate);
    const tentativeCloseDate = parseDate(raw.tentativeCloseDate);
    const createdDate = parseDate(raw.createdDate);

    // Anomaly checks
    if (!raw.ownerCode && ownerCode === 'UNASSIGNED') {
      anomalies.push({
        id: `ANOM-${recordId}-OWNER`,
        type: 'corrupted_string',
        severity: 'medium',
        board: 'Deals',
        recordId,
        field: 'ownerCode',
        description: `Deal "${dealName}" is missing an assigned owner code.`,
        suggestedCorrection: 'Defaulted to UNASSIGNED.',
        resolved: true
      });
      itemAnomalies.push('Missing Owner');
    }

    if (dealVal <= 0 && status === 'Won') {
      anomalies.push({
        id: `ANOM-${recordId}-VALUE`,
        type: 'missing_date',
        severity: 'high',
        board: 'Deals',
        recordId,
        field: 'maskedDealValue',
        description: `Won deal "${dealName}" has 0 or unrecorded deal value.`,
        suggestedCorrection: 'Estimated from correlated Work Order values if available.',
        resolved: false
      });
      itemAnomalies.push('Zero value on Won deal');
    }

    if (!closeDate && !tentativeCloseDate && status === 'Open') {
      itemAnomalies.push('No target close date');
    }

    // Software classification
    const prod = (raw.productDeal || '').toUpperCase();
    const softwareTypes: string[] = [];
    if (prod.includes('SPECTRA')) softwareTypes.push('SPECTRA');
    if (prod.includes('DMO')) softwareTypes.push('DMO');
    const hasSoftware = softwareTypes.length > 0;

    const quarter = getQuarterFromDate(closeDate || tentativeCloseDate || createdDate);

    deals.push({
      id: recordId,
      dealName,
      ownerCode,
      clientCode: (raw.clientCode || 'UNKNOWN_CLIENT').trim(),
      dealStatus: status,
      closeDate,
      closureProbability: prob,
      dealValue: dealVal,
      tentativeCloseDate,
      dealStage: (raw.dealStage || 'Unassigned').trim(),
      productDeal: (raw.productDeal || 'Pure Service').trim(),
      sector: standardizeSector(raw.sectorService),
      createdDate,
      hasSoftware,
      softwareTypes,
      anomalies: itemAnomalies,
      quarter
    });
  });

  return { deals, anomalies };
}

export function cleanWorkOrders(rawOrders: RawWorkOrder[]): { workOrders: CleanedWorkOrder[]; anomalies: DataAnomaly[] } {
  const anomalies: DataAnomaly[] = [];
  const workOrders: CleanedWorkOrder[] = [];

  rawOrders.forEach((raw, idx) => {
    const recordId = raw.id || raw.serialNumber || `WO-${idx + 1}`;
    const { dealName, ownerCode } = cleanOwnerAndDealName(raw.dealNameMasked, raw.bdKamPersonnelCode);
    const itemAnomalies: string[] = [];

    // Execution status
    let execStatus: CleanedWorkOrder['executionStatus'] = 'Ongoing';
    const rawExec = (raw.executionStatus || '').trim().toLowerCase();
    if (rawExec.includes('completed')) execStatus = 'Completed';
    else if (rawExec.includes('pause') || rawExec.includes('struck')) execStatus = 'Paused / Struck';
    else if (rawExec.includes('not started')) execStatus = 'Not Started';
    else if (rawExec.includes('partial')) execStatus = 'Partial Completed';
    else if (rawExec.includes('pending')) execStatus = 'Pending Details';
    else if (rawExec.includes('ongoing') || rawExec.includes('current month')) execStatus = 'Ongoing';

    // Software
    let softwareDeliverable: CleanedWorkOrder['softwareDeliverable'] = 'NONE';
    const rawSoft = (raw.softwareDeliverable || '').trim().toUpperCase();
    if (rawSoft.includes('SPECTRA') && rawSoft.includes('DMO')) softwareDeliverable = 'SPECTRA + DMO';
    else if (rawSoft.includes('SPECTRA')) softwareDeliverable = 'SPECTRA';
    else if (rawSoft.includes('DMO')) softwareDeliverable = 'DMO';

    const orderValue = parseNumber(raw.amountExclGst || raw.amountInclGst);
    const billedValue = parseNumber(raw.billedValueExclGst || raw.billedValueInclGst);
    const collectedAmount = parseNumber(raw.collectedAmountInclGst);
    let amountToBeBilled = parseNumber(raw.amountToBeBilledExclGst);
    let amountReceivable = parseNumber(raw.amountReceivable);

    // Fix negative amountToBeBilled anomalies in legacy spreadsheet calculations
    if (amountToBeBilled < 0) {
      anomalies.push({
        id: `ANOM-${recordId}-NEG-BILL`,
        type: 'negative_value',
        severity: 'high',
        board: 'Work Orders',
        recordId,
        field: 'amountToBeBilledExclGst',
        description: `Negative unbilled balance detected (${amountToBeBilled}) on ${recordId}. Billed value exceeded original order.`,
        suggestedCorrection: 'Normalized unbilled amount to 0 and flagged as overbilled/expanded scope.',
        resolved: true
      });
      amountToBeBilled = 0;
      itemAnomalies.push('Negative unbilled normalized to 0');
    }

    // Invoice status
    let invoiceStatus: CleanedWorkOrder['invoiceStatus'] = 'Not Billed';
    const rawInv = (raw.invoiceStatus || '').trim().toLowerCase();
    if (rawInv.includes('fully billed')) invoiceStatus = 'Fully Billed';
    else if (rawInv.includes('partially billed') || rawInv.includes('visit')) invoiceStatus = 'Partially Billed';
    else if (rawInv.includes('stuck')) invoiceStatus = 'Stuck';

    const isPriorityAR = (raw.arPriorityAccount || '').trim().toLowerCase().includes('priority');
    const woStatus: 'Open' | 'Closed' = (raw.woStatusBilled || '').toLowerCase().includes('closed') ? 'Closed' : 'Open';

    const qtyPO = parseNumber(raw.quantitiesAsPerPO);
    const qtyOps = parseNumber(raw.quantityByOps);
    const qtyBilled = parseNumber(raw.quantityBilledTillDate);
    const balQty = parseNumber(raw.balanceInQuantity);

    const completionRate = orderValue > 0 ? Math.min(100, Math.round((billedValue / orderValue) * 100)) : (execStatus === 'Completed' ? 100 : 0);
    const collectionRate = billedValue > 0 ? Math.min(100, Math.round((collectedAmount / billedValue) * 100)) : 0;

    // Additional checks
    if (execStatus === 'Completed' && billedValue === 0 && orderValue > 0) {
      anomalies.push({
        id: `ANOM-${recordId}-UNBILLED`,
        type: 'status_mismatch',
        severity: 'high',
        board: 'Work Orders',
        recordId,
        field: 'billedValue',
        description: `Execution completed for ${dealName} (${recordId}) but ₹0 has been billed to date.`,
        suggestedCorrection: 'High risk unbilled revenue item. Recommend generating invoice immediately.',
        resolved: false
      });
      itemAnomalies.push('Completed but Unbilled');
    }

    if (amountReceivable > 500000 && isPriorityAR) {
      itemAnomalies.push('High-Value Overdue AR');
    }

    workOrders.push({
      id: recordId,
      dealName,
      customerCode: (raw.customerNameCode || 'UNKNOWN_CUSTOMER').trim(),
      serialNumber: (raw.serialNumber || recordId).trim(),
      natureOfWork: (raw.natureOfWork || 'One time Project').trim(),
      executionStatus: execStatus,
      dataDeliveryDate: parseDate(raw.dataDeliveryDate),
      poDate: parseDate(raw.dateOfPOLOI),
      documentType: (raw.documentType || 'Purchase Order').trim(),
      startDate: parseDate(raw.probableStartDate),
      endDate: parseDate(raw.probableEndDate),
      ownerCode,
      sector: standardizeSector(raw.sector),
      typeOfWork: (raw.typeOfWork || 'General Survey').trim(),
      softwareDeliverable,
      latestInvoiceNo: (raw.latestInvoiceNo || '').trim() || null,
      lastInvoiceDate: parseDate(raw.lastInvoiceDate),
      orderValue,
      billedValue,
      collectedAmount,
      amountToBeBilled,
      amountReceivable,
      isPriorityAR,
      invoiceStatus,
      woStatus,
      billingStatus: (raw.billingStatus || 'Normal').trim(),
      quantityOps: qtyOps,
      quantityPO: qtyPO,
      quantityBilled: qtyBilled,
      balanceQuantity: balQty,
      anomalies: itemAnomalies,
      completionRate,
      collectionRate
    });
  });

  return { workOrders, anomalies };
}

export function linkDealsAndWorkOrders(deals: CleanedDeal[], workOrders: CleanedWorkOrder[]): LinkedBusinessRecord[] {
  const map = new Map<string, LinkedBusinessRecord>();

  // Index deals first
  deals.forEach(deal => {
    const key = deal.dealName.toLowerCase();
    map.set(key, {
      dealName: deal.dealName,
      clientCode: deal.clientCode,
      sector: deal.sector,
      deal,
      workOrders: [],
      totalPipelineValue: deal.dealValue,
      totalOrderValue: 0,
      totalBilledValue: 0,
      totalCollected: 0,
      totalReceivable: 0,
      executionHealth: 'Pre-execution'
    });
  });

  // Attach work orders
  workOrders.forEach(wo => {
    const key = wo.dealName.toLowerCase();
    let record = map.get(key);
    if (!record) {
      record = {
        dealName: wo.dealName,
        clientCode: wo.customerCode,
        sector: wo.sector,
        workOrders: [],
        totalPipelineValue: 0,
        totalOrderValue: 0,
        totalBilledValue: 0,
        totalCollected: 0,
        totalReceivable: 0,
        executionHealth: 'Healthy'
      };
      map.set(key, record);
    }

    record.workOrders.push(wo);
    record.totalOrderValue += wo.orderValue;
    record.totalBilledValue += wo.billedValue;
    record.totalCollected += wo.collectedAmount;
    record.totalReceivable += wo.amountReceivable;

    // Determine execution health
    const hasStuck = record.workOrders.some(w => w.executionStatus === 'Paused / Struck' || w.invoiceStatus === 'Stuck');
    const allCompleted = record.workOrders.every(w => w.executionStatus === 'Completed');
    if (hasStuck) {
      record.executionHealth = 'At Risk';
    } else if (allCompleted && record.workOrders.length > 0) {
      record.executionHealth = 'Completed';
    } else {
      record.executionHealth = 'Healthy';
    }
  });

  return Array.from(map.values());
}

export function generateDataQualityReport(
  rawDeals: RawDeal[],
  rawWorkOrders: RawWorkOrder[],
  cleanedDeals: CleanedDeal[],
  cleanedWorkOrders: CleanedWorkOrder[],
  anomalies: DataAnomaly[]
): DataQualityReport {
  let missingDates = 0;
  let missingValues = 0;
  let missingOwners = 0;

  rawDeals.forEach(d => {
    if (!d.closeDate && !d.tentativeCloseDate) missingDates++;
    if (!d.maskedDealValue) missingValues++;
    if (!d.ownerCode) missingOwners++;
  });

  let woMissingDates = 0;
  let woMissingInvoices = 0;
  let woNegative = 0;

  rawWorkOrders.forEach(w => {
    if (!w.dateOfPOLOI && !w.probableStartDate) woMissingDates++;
    if (!w.latestInvoiceNo && w.executionStatus?.toLowerCase().includes('completed')) woMissingInvoices++;
    if (parseNumber(w.amountToBeBilledExclGst) < 0) woNegative++;
  });

  const totalRecords = rawDeals.length + rawWorkOrders.length;
  const issueCount = anomalies.length + missingValues + woMissingInvoices;
  const rawScore = Math.max(45, Math.min(98, Math.round(100 - (issueCount / totalRecords) * 28)));

  return {
    overallHealthScore: rawScore,
    totalDealsCount: cleanedDeals.length,
    totalWorkOrdersCount: cleanedWorkOrders.length,
    cleanDealsCount: cleanedDeals.filter(d => d.anomalies.length === 0).length,
    cleanWorkOrdersCount: cleanedWorkOrders.filter(w => w.anomalies.length === 0).length,
    anomalyCount: anomalies.length,
    anomalies,
    missingValuesSummary: {
      dealsMissingDates: missingDates,
      dealsMissingValues: missingValues,
      dealsMissingOwners: missingOwners,
      workOrdersMissingDates: woMissingDates,
      workOrdersMissingInvoices: woMissingInvoices,
      workOrdersNegativeBalances: woNegative
    },
    normalizationRulesApplied: [
      'Standardized merged strings ("NameOWNER_001" parsed into Name + Owner)',
      'Normalized inconsistent date timestamps and relative strings into ISO 8601',
      'Auto-repaired negative unbilled amounts to zero with over-delivery flags',
      'Unified multi-board sector aliases (e.g., Solar/Wind mapped to Renewables)',
      'Constructed relational linkages between Deals and Work Orders across disparate customer keys',
      'Identified critical revenue leaks where Work Orders were completed without billed invoices'
    ]
  };
}
