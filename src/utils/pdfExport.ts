import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ITAsset, MaintenanceRecord } from '../types';

export function generateDataReportPDF(
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>,
  preparedBy: string = 'SIA IT Officer',
  filePrefix: string = 'SIA_Operations_Report'
) {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(`SIA IT OPERATIONS — ${title.toUpperCase()}`, 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${currentDate}  |  Prepared By: ${preparedBy}`, 14, 28);

  autoTable(doc, {
    startY: 48,
    head: [headers],
    body: rows.map((row) => row.map(String)),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  doc.save(`${filePrefix}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateAssetReportPDF(assets: ITAsset[], preparedBy: string = 'SIA IT Officer') {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SIA IT OPERATIONS — ASSET AUDIT REPORT', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${currentDate}  |  Prepared By: ${preparedBy}`, 14, 28);

  // Summary Metrics
  const totalValue = assets.reduce((sum, a) => sum + (a.valueUSD ?? 0), 0);
  const activeCount = assets.filter((a) => a.status === 'Active').length;
  const inRepairCount = assets.filter((a) => a.status === 'In Repair').length;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Hardware Assets: ${assets.length}   |   Active Fleet: ${activeCount}   |   In Repair: ${inRepairCount}   |   Total Valuation: $${totalValue.toLocaleString()}`, 14, 48);

  // Assets Table
  const tableData = assets.map((a) => [
    a.assetNumber,
    a.deviceName,
    a.deviceType,
    a.location,
    a.assignedEmployee || '—',
    a.status,
    `$${(a.valueUSD ?? 0).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 54,
    head: [['Asset #', 'Device Name', 'Type', 'Location', 'Assigned To', 'Status', 'Value (USD)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235], // Primary #2563EB
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SIA AutoParts Import/Export Enterprise IT Operations — Page ${i} of ${pageCount}`, 14, 287);
  }

  doc.save(`SIA_Asset_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateMaintenanceReportPDF(tickets: MaintenanceRecord[], preparedBy: string = 'SIA IT Officer') {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SIA IT OPERATIONS — MAINTENANCE & SLA LOG', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${currentDate}  |  Prepared By: ${preparedBy}`, 14, 28);

  const openCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const criticalCount = tickets.filter((t) => t.priority === 'Critical').length;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Records Logged: ${tickets.length}   |   Active Unresolved: ${openCount}   |   Critical Incidents: ${criticalCount}`, 14, 48);

  const tableData = tickets.map((t) => [
    t.ticketNumber,
    t.problem.substring(0, 50),
    t.priority ?? '—',
    t.status,
    t.engineer,
    t.location ?? '—',
    t.cost ? `$${t.cost.toLocaleString()}` : '—',
  ]);

  autoTable(doc, {
    startY: 54,
    head: [['Ticket #', 'Problem (Summary)', 'Priority', 'Status', 'Engineer', 'Location', 'Cost']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`SIA_Maintenance_SLA_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
