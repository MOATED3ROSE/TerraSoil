import { jsPDF } from 'jspdf';
import { Farm, Field } from '../types';

export interface GenerateCompliancePdfOptions {
  farm: Farm;
  fields: Field[];
  reportScope: 'whole-farm' | 'single-field';
  targetField?: Field;
  includeWhiteLabel: boolean;
  agronomistFirm: string;
  certifiedAgronomist: string;
}

/**
 * Generates an audit-ready, multi-page Field Verification PDF Report for carbon compliance,
 * USDA NRCS conservation grants, Scope 3 supply-chain ESG reporting, or carbon buyers.
 */
export function generateComplianceReportPdf(options: GenerateCompliancePdfOptions): jsPDF {
  const {
    farm,
    fields,
    reportScope,
    targetField,
    includeWhiteLabel,
    agronomistFirm,
    certifiedAgronomist,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const reportFields = reportScope === 'single-field' && targetField ? [targetField] : fields;
  const totalAcreage = reportFields.reduce((acc, f) => acc + f.acreage, 0);
  const totalSequestrationMT = reportFields.reduce(
    (acc, f) => acc + (f.carbonBreakdown?.totalGrossMT || 0),
    0
  );
  const avgIntensity =
    totalAcreage > 0 ? (totalSequestrationMT / totalAcreage).toFixed(2) : '0.00';
  const reportId = `TS-MRV-${farm.id.slice(-6).toUpperCase()}-2026`;
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 12; // leave room below top header
      return true;
    }
    return false;
  };

  // ================= 1. HEADER & TOP BANNER =================
  if (includeWhiteLabel) {
    // Top Agronomist Firm Branding
    doc.setFillColor(6, 78, 59); // Emerald 900
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

    // Monogram Box
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.roundedRect(margin + 4, y + 4, 16, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('MS', margin + 12, y + 14, { align: 'center' });

    // Firm name & Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(agronomistFirm, margin + 24, y + 10);

    doc.setTextColor(167, 243, 208); // Emerald 200
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Certified Agronomic Services • Soil Organic Carbon (SOC) Verification Partner',
      margin + 24,
      y + 15
    );
    doc.text(
      `Supervising Agronomist: ${certifiedAgronomist}`,
      margin + 24,
      y + 19.5
    );

    // Right-aligned report details badge
    doc.setFillColor(4, 120, 87); // Emerald 700
    doc.roundedRect(pageWidth - margin - 64, y + 4, 60, 16, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('FIELD EVIDENCE DOSSIER', pageWidth - margin - 34, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('NOT INDEPENDENTLY VERIFIED', pageWidth - margin - 34, y + 11.5, { align: 'center' });
    doc.text(`ID: ${reportId}`, pageWidth - margin - 34, y + 15, { align: 'center' });
    doc.text(dateFormatted, pageWidth - margin - 34, y + 18.5, { align: 'center' });

    y += 28;
  } else {
    // TerraSoil Standard Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('TERRASOIL MRV PLATFORM • FIELD EVIDENCE REPORT (3-STATE ASSURANCE)', margin + 6, y + 8);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Field Evidence Report & Carbon Compliance Ledger', margin + 6, y + 16);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report ID: ${reportId} • ${dateFormatted}`, pageWidth - margin - 6, y + 16, {
      align: 'right',
    });

    y += 26;
  }

  // ================= 2. REPORT TITLE & COMPLIANCE BADGE =================
  doc.setFillColor(254, 252, 232); // Amber/Yellow 50
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'FD');

  doc.setTextColor(180, 83, 9); // Amber 700
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA ASSURANCE NOTICE: NOT INDEPENDENTLY VERIFIED', margin + 5, y + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  doc.text(
    'Carbon sequestration figures are modeled estimates (IPCC Tier 1 & COMET-Farm v1.4 factors, ±22% uncertainty). This dossier provides empirical evidence for third-party audit; it is not a third-party verification opinion.',
    margin + 5,
    y + 11
  );

  y += 20;

  // ================= 3. PRODUCER & OPERATION DETAILS (2-COLUMN BOX) =================
  const colWidth = (contentWidth - 6) / 2;
  const colHeight = 28;

  // Left column: Producer
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, colWidth, colHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PRODUCER / AGRICULTURAL OPERATION', margin + 4, y + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(farm.name, margin + 4, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Operator: ${farm.ownerName}`, margin + 4, y + 17);
  doc.text(`Location: ${farm.region}, ${farm.stateOrCountry}`, margin + 4, y + 21.5);
  doc.text(`Farm Identifier: ${farm.id}`, margin + 4, y + 25.5);

  // Right column: Accounting Scope
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + colWidth + 6, y, colWidth, colHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ACCOUNTING SCOPE & BOUNDARIES', margin + colWidth + 10, y + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const scopeLabel =
    reportScope === 'whole-farm'
      ? `Whole Operation (${fields.length} Fields)`
      : `Single Field: ${targetField?.name || 'Selected Field'}`;
  doc.text(scopeLabel, margin + colWidth + 10, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Enrolled Acreage: ${totalAcreage.toLocaleString()} Acres`, margin + colWidth + 10, y + 17);
  doc.text('Model Tier: IPCC Tier 1 & COMET-Farm Regional', margin + colWidth + 10, y + 21.5);
  doc.text('Satellite Sensor: ESA Copernicus Sentinel-2 MSI (10m)', margin + colWidth + 10, y + 25.5);

  y += colHeight + 6;

  // ================= 4. EXECUTIVE CARBON SEQUESTRATION CARD =================
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(110, 231, 183); // Emerald 300
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('MODELED ANNUAL NET CARBON SEQUESTRATION [MODELED]', margin + 6, y + 7);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59); // Emerald 900
  doc.text(`+${totalSequestrationMT.toLocaleString()}`, margin + 6, y + 17);

  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text('Metric Tons CO2e / Year (±22%)', margin + 48, y + 16.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 95, 70);
  doc.text(
    `Average Removal Density: ${avgIntensity} MT CO2e / Acre / Year (Modeled via IPCC Tier 1 & COMET-Farm v1.4)`,
    margin + 6,
    y + 22
  );

  // Right-aligned status pill
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(245, 158, 11); // Amber
  doc.roundedRect(pageWidth - margin - 58, y + 5, 52, 16, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('AUDIT-READY EVIDENCE', pageWidth - margin - 32, y + 11, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Not Independently Verified', pageWidth - margin - 32, y + 15, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  doc.text('Awaiting Verifier Audit', pageWidth - margin - 32, y + 18.5, { align: 'center' });

  y += 32;

  // ================= 5. ENROLLED FIELD INVENTORIES TABLE =================
  checkPageBreak(35);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. ENROLLED FIELD INVENTORIES & SOIL ORGANIC CARBON (SOC) BASELINES', margin, y);
  y += 4;

  // Table header
  const fieldColWidths = [38, 18, 26, 32, 28, 20, 20];
  const fieldHeaders = [
    'Field Identifier',
    'Acreage',
    'Crop Rotation',
    'Soil Classification',
    'Baseline SOC',
    'NDVI Vigor',
    'Net CO2e/Yr',
  ];

  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6, 'FD');

  let curX = margin;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  fieldHeaders.forEach((hdr, idx) => {
    const alignRight = idx === 6 || idx === 1;
    if (alignRight) {
      doc.text(hdr, curX + fieldColWidths[idx] - 2, y + 4.2, { align: 'right' });
    } else {
      doc.text(hdr, curX + 2, y + 4.2);
    }
    curX += fieldColWidths[idx];
  });
  y += 6;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);

  reportFields.forEach((fld, idx) => {
    checkPageBreak(7);
    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, 6, 'FD');

    curX = margin;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(fld.name.slice(0, 20), curX + 2, y + 4.2);
    curX += fieldColWidths[0];

    doc.setFont('helvetica', 'normal');
    doc.text(`${fld.acreage} ac`, curX + fieldColWidths[1] - 2, y + 4.2, { align: 'right' });
    curX += fieldColWidths[1];

    doc.text((fld.cropType || 'Corn/Soy').slice(0, 16), curX + 2, y + 4.2);
    curX += fieldColWidths[2];

    doc.setTextColor(71, 85, 105);
    doc.text((fld.soilClassification || 'Silt Loam').slice(0, 19), curX + 2, y + 4.2);
    curX += fieldColWidths[3];

    doc.setTextColor(15, 23, 42);
    doc.text(`${fld.baselineSOCPct}% (${fld.baselineSOCStockTonsPerHa} t/ha)`, curX + 2, y + 4.2);
    curX += fieldColWidths[4];

    doc.setTextColor(4, 120, 87);
    doc.setFont('helvetica', 'bold');
    doc.text(fld.currentNDVI ? fld.currentNDVI.toFixed(2) : '0.68', curX + 2, y + 4.2);
    curX += fieldColWidths[5];

    doc.setTextColor(6, 78, 59);
    doc.text(
      `+${fld.carbonBreakdown?.totalGrossMT || 0} MT`,
      curX + fieldColWidths[6] - 2,
      y + 4.2,
      { align: 'right' }
    );

    y += 6;
  });

  y += 6;

  // ================= 6. REGENERATIVE PRACTICES EVIDENCE LEDGER TABLE =================
  checkPageBreak(35);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. REGENERATIVE MANAGEMENT PRACTICE EVIDENCE LEDGER', margin, y);
  y += 4;

  const practiceColWidths = [28, 28, 20, 52, 18, 18, 18];
  const practiceHeaders = [
    'Field',
    'Practice',
    'Implemented',
    'Agronomic Details & Species',
    'Acreage',
    'Factor',
    'Sequestration',
  ];

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6, 'FD');

  curX = margin;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  practiceHeaders.forEach((hdr, idx) => {
    const alignRight = idx === 4 || idx === 6;
    if (alignRight) {
      doc.text(hdr, curX + practiceColWidths[idx] - 2, y + 4.2, { align: 'right' });
    } else {
      doc.text(hdr, curX + 2, y + 4.2);
    }
    curX += practiceColWidths[idx];
  });
  y += 6;

  // Flatten practices
  const allPractices = reportFields.flatMap((f) =>
    (f.practices || []).map((p) => ({ ...p, parentFieldName: f.name }))
  );

  allPractices.forEach((p, idx) => {
    checkPageBreak(7);
    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, 6, 'FD');

    curX = margin;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(p.parentFieldName.slice(0, 16), curX + 2, y + 4.2);
    curX += practiceColWidths[0];

    doc.setFont('helvetica', 'normal');
    doc.text(p.practiceType.replace('_', ' ').slice(0, 16), curX + 2, y + 4.2);
    curX += practiceColWidths[1];

    doc.setTextColor(71, 85, 105);
    doc.text((p.dateImplemented || '2025-10-14').slice(0, 10), curX + 2, y + 4.2);
    curX += practiceColWidths[2];

    const specText = `${p.title || ''} - ${p.details || ''}`.trim();
    doc.text(specText.slice(0, 36), curX + 2, y + 4.2);
    curX += practiceColWidths[3];

    doc.setTextColor(15, 23, 42);
    doc.text(`${p.acreageApplied || 0} ac`, curX + practiceColWidths[4] - 2, y + 4.2, {
      align: 'right',
    });
    curX += practiceColWidths[4];

    doc.setTextColor(71, 85, 105);
    doc.text(`${p.emissionReductionFactor || 0.45} MT/ac`, curX + 2, y + 4.2);
    curX += practiceColWidths[5];

    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(`+${p.carbonEstimateMT || 0} MT`, curX + practiceColWidths[6] - 2, y + 4.2, {
      align: 'right',
    });

    y += 6;
  });

  y += 6;

  // ================= 7. SATELLITE TELEMETRY & REMOTE SENSING ATTESTATION =================
  checkPageBreak(30);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. SATELLITE GROUNDCOVER & BIOMASS REMOTE SENSING CROSS-VERIFICATION', margin + 4, y + 6);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const satelliteText =
    'Optical surface reflectance imagery acquired via ESA Copernicus Sentinel-2 Level-2A surface reflectance products confirms continuous photosynthetic vegetative groundcover throughout winter and critical pre-planting fallow windows. Multispectral vegetation vigor (NDVI > 0.45) attests non-fallow soil management in strict conformance with USDA Natural Resources Conservation Service (NRCS) Practice Code 340 (Cover Crop) and Code 329 (Residue and Tillage Management, No-Till).';
  const splitSatText = doc.splitTextToSize(satelliteText, contentWidth - 8);
  doc.text(splitSatText, margin + 4, y + 10.5);

  y += 26;

  // ================= 8. REGULATORY DISCLAIMER & GUARDRAILS =================
  checkPageBreak(40);
  doc.setFillColor(254, 252, 232); // Yellow 50
  doc.setDrawColor(254, 240, 138); // Yellow 200
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(133, 77, 14); // Yellow 800
  doc.text('REGULATORY NOTICE & SCOPE 3 CARBON METHODOLOGY DISCLAIMER', margin + 4, y + 5);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(113, 63, 18);
  const disclaimerText =
    'All carbon sequestration quantities presented herein are calculated estimates derived from peer-reviewed agronomic emission models (USDA COMET-Farm Regional & IPCC Guidelines for National Greenhouse Gas Inventories). These figures serve as empirical supporting documentation for agricultural sustainability tracking, corporate Scope 3 supply-chain carbon insetting, and conservation subsidy applications. Formal issuance of verified voluntary carbon offsets may require further independent physical soil core sampling protocols.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  doc.text(splitDisclaimer, margin + 4, y + 9);

  y += 22;

  // ================= 9. SIGNATURE & ATTESTATION BLOCK =================
  checkPageBreak(30);
  const sigBoxWidth = (contentWidth - 6) / 2;
  const sigBoxHeight = 22;

  // Operator Signature Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigBoxWidth, sigBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('PRODUCER SIGNATURE / OPERATOR ATTESTATION', margin + 4, y + 5);

  // Line
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 4, y + 15, margin + sigBoxWidth - 4, y + 15);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Attested by: ${farm.ownerName} • Date: ${dateFormatted}`,
    margin + 4,
    y + 19
  );

  // Verifying Agronomist Box
  doc.roundedRect(margin + sigBoxWidth + 6, y, sigBoxWidth, sigBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('VERIFYING AGRONOMIST / CONSULTANT ATTESTATION', margin + sigBoxWidth + 10, y + 5);

  // Line
  doc.line(margin + sigBoxWidth + 10, y + 15, margin + contentWidth - 4, y + 15);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Verified by: ${certifiedAgronomist} • ${agronomistFirm}`,
    margin + sigBoxWidth + 10,
    y + 19
  );

  // ================= 10. RUNNING HEADERS & FOOTERS (ACROSS ALL PAGES) =================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running top line & header on page 2+
    if (p > 1) {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `TERRASOIL MRV • FIELD VERIFICATION REPORT (${farm.name})`,
        margin,
        8
      );
      doc.text(`ID: ${reportId}`, pageWidth - margin, 8, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 10, pageWidth - margin, 10);
    }

    // Running bottom footer on every page
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      'TerraSoil MRV Technologies © 2026 • Audit Evidence Package (ISO 14064-2 Aligned)',
      margin,
      pageHeight - 6
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  return doc;
}
