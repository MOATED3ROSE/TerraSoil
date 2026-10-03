import { jsPDF } from 'jspdf';

export interface TerraSoilPdfOptions {
  companyName?: string;
  author?: string;
  contactEmail?: string;
  generatedDate?: string;
}

export function generateTerraSoilAIPdf(options: TerraSoilPdfOptions = {}): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const company = options.companyName || 'TerraSoil MRV Platform';
  const author = options.author || 'TerraSoil AI Architecture Team';
  const dateStr = options.generatedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin - 12) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    const pageNum = doc.getNumberOfPages();
    // Top running header
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text('TERRASOIL AI — SPECIFICATION, CAPABILITIES & GOVERNANCE GUIDE', margin, 10);
    doc.text('AUDIT-READY MRV SYSTEM', pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Bottom running footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`TerraSoil MRV Technologies © ${new Date().getFullYear()} — Confidential & Proprietary`, margin, pageHeight - 8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // ================= PAGE 1 =================
  drawHeaderFooter();

  // Document Title Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');

  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SYSTEM SPECIFICATION & MASTER ARCHITECTURE WHITEPAPER', margin + 6, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TerraSoil AI: Platform Scope, Goals & Guardrails', margin + 6, y + 18);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared by: ${author}  |  Published: ${dateStr}  |  Protocol: ISO 14064-2 / IPCC Tier 2`, margin + 6, y + 26);

  y += 40;

  // SECTION 1: ROLE & CORE PURPOSE
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 83, 45); // Deep emerald
  doc.text('1. Role, Mission & Core Purpose', margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const p1 = doc.splitTextToSize(
    'TerraSoil AI is the intelligence and MRV (Measurement, Reporting, and Verification) engine embedded in the TerraSoil platform. It bridges satellite remote sensing constellations (Sentinel-2, Landsat, USDA NAIP) with on-farm agronomic management records to measure, track, model, and document soil organic carbon (SOC) stock accretion and regenerative agricultural practices.',
    contentWidth
  );
  doc.text(p1, margin, y);
  y += p1.length * 4.2 + 3;

  // Key Platform Goals Box
  doc.setFillColor(240, 253, 244); // Light emerald bg
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('PRIMARY PLATFORM GOALS (What TerraSoil Helps With):', margin + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text('• Empower Growers & Farmers: Demystify carbon insetting and quantify 5-year biological accretion returns.', margin + 4, y + 11);
  doc.text('• Multi-Farm Agronomist Workstation: Enable crop advisors to manage client portfolios with custom PDF reports.', margin + 4, y + 16);
  doc.text('• Corporate Scope 3 Supply Chain Insetting: Provide auditable primary farm data for corporate decarbonization.', margin + 4, y + 21);
  doc.text('• Verifier & Auditor Transparency: Immutable SHA-256 cryptographic provenance chain for third-party audits.', margin + 4, y + 26);
  y += 35;

  // SECTION 2: WHAT TERRASOIL AI CAN DO (CAPABILITIES)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 83, 45);
  doc.text('2. What TerraSoil AI CAN Do (Comprehensive Feature Suite)', margin, y);
  y += 6;

  const capabilities = [
    {
      title: 'Interactive Field Parcel GIS & Boundary Mapping:',
      desc: 'Draw or upload field parcel boundaries on high-resolution satellite basemaps (Sentinel-2, NAIP, USGS Topo). Dynamically calculates GIS acreage, parcel centroids, and sub-field management zones.'
    },
    {
      title: 'Multi-Temporal Remote Sensing Telemetry:',
      desc: 'Streams 5-year Sentinel-2 NDVI vegetative vigor curves, topsoil (0-10cm) and root-zone (10-40cm) moisture telemetry, and automated moisture deficit/waterlogging alerts.'
    },
    {
      title: '7-Day Weather & Precipitation Heatmap Overlay:',
      desc: 'Integrates real-time localized temperature and 7-day precipitation forecasts to map soil trafficability and generate moisture management decision support (spray windows, avoided runoff).'
    },
    {
      title: 'Regenerative Practice Activity Ledger:',
      desc: 'Logs 5 core regenerative interventions (cover crops, continuous no-till, 4R fertilizer reduction, rotational grazing, compost/biochar) with multi-tiered verification badges.'
    },
    {
      title: '5-Year Soil Organic Carbon (SOC) Accretion Modeling:',
      desc: 'Projects 5-year SOC % growth and total net atmospheric CO2e removal using USDA COMET-Farm and IPCC Tier 1/2 emission factors, factoring in depth stratification and soil sponge capacity (+27k gal/ac/1% SOM).'
    },
    {
      title: 'Global Agricultural Intelligence & Benchmark Engine:',
      desc: 'Explores worldwide soil classification orders (Mollisols, Vertisols, Andisols, Oxisols), water risk indices, and multi-region side-by-side benchmarking.'
    },
    {
      title: 'Cryptographic Lineage & Audit-Ready PDF Reports:',
      desc: 'Generates ISO 14064-2 compliant PDF compliance reports with SHA-256 lab sample hashes, emission calculation breakdowns, and permanence buffer accounting.'
    }
  ];

  capabilities.forEach((cap, idx) => {
    checkPageBreak(18);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`[✓] ${idx + 1}. ${cap.title}`, margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(cap.desc, contentWidth - 6);
    doc.text(descLines, margin + 6, y);
    y += descLines.length * 3.8 + 2;
  });

  // ================= PAGE 2 =================
  checkPageBreak(50);
  y += 4;

  // SECTION 3: WHAT TERRASOIL AI CANNOT DO (GUARDRAILS & BOUNDARIES)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27); // Deep red
  doc.text('3. What TerraSoil AI CANNOT Do (Non-Negotiable Guardrails)', margin, y);
  y += 5;

  doc.setFillColor(254, 242, 242); // Light red bg
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('CRITICAL SYSTEM GUARDRAILS & OPERATIONAL BOUNDARIES:', margin + 4, y + 6);

  const guardrails = [
    {
      rule: 'NEVER state carbon estimates as certified fact:',
      explanation: 'All carbon stock numbers are model-based agronomic estimates (IPCC / COMET-Farm), not a substitute for certified third-party verification bodies (e.g. Verra, Climate Action Reserve).'
    },
    {
      rule: 'NEVER provide prescriptive agronomic advice:',
      explanation: 'TerraSoil AI explains what data shows, but never commands management decisions (e.g. "switch to no-till on Field 3"). Agronomic decisions remain with qualified crop advisors.'
    },
    {
      rule: 'NEVER guarantee specific grant or carbon credit payouts:',
      explanation: 'Financial payout eligibility and dollar yields depend strictly on external market buyers and government grant rules beyond platform control.'
    },
    {
      rule: 'NEVER provide legal, tax, or financial derivatives advice:',
      explanation: 'Directs users to qualified certified CPAs, environmental attorneys, or accredited financial professionals.'
    }
  ];

  let gy = y + 11;
  guardrails.forEach((g) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(127, 29, 29);
    doc.text(`[X] ${g.rule}`, margin + 4, gy);
    gy += 3.8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(87, 83, 78);
    const expLines = doc.splitTextToSize(g.explanation, contentWidth - 10);
    doc.text(expLines, margin + 9, gy);
    gy += expLines.length * 3.4 + 1.5;
  });
  y += 54;

  // SECTION 4: AUDIENCE PERSONAS & WORKSPACES
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 83, 45);
  doc.text('4. Audience Personas & Tailored Workspaces', margin, y);
  y += 5;

  // Table of Personas
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Persona Target', margin + 4, y + 5);
  doc.text('Key User Signal', margin + 45, y + 5);
  doc.text('Tailored Features & Focus', margin + 95, y + 5);
  doc.line(margin + 2, y + 7, margin + contentWidth - 2, y + 7);

  const personaRows = [
    { p: 'Farmer / Rancher', sig: 'Asks about my farm, acres, payout', feat: 'Plain language, intuitive field mapping, ROI estimator' },
    { p: 'Agronomist / Consultant', sig: 'Asks about clients, multi-farm seats', feat: 'Multi-farm dashboard, branded white-label PDF reports' },
    { p: 'Corporate ESG Buyer', sig: 'Scope 3 emissions, supplier verification', feat: 'Supply-shed aggregation, primary data MRV, GHG insets' },
    { p: 'Carbon Credit Auditor', sig: 'Chain of custody, ISO 14064-2, SHA-256', feat: 'Cryptographic lineage inspect, raw lab assays, buffer %' },
  ];

  let py = y + 12;
  personaRows.forEach((r) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(r.p, margin + 4, py);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(r.sig, margin + 45, py);
    doc.text(r.feat, margin + 95, py);
    py += 6.5;
  });
  y += 42;

  // SECTION 5: PLANS & PRICING STRUCTURE
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 83, 45);
  doc.text('5. Plans & Pricing Structure', margin, y);
  y += 5;

  const plans = [
    { name: 'Basic Farm Tier', price: '$29–49/mo ($0.50/ac/yr)', desc: 'Field boundary mapping, satellite NDVI/moisture monitoring, practice logging, carbon estimates. Built for individual growers.' },
    { name: 'Professional Multi-Farm', price: '$199/month', desc: 'Everything in Basic plus unlimited client farms, multi-seat agronomist access, and branded audit PDF export.' },
    { name: 'One-Time Grant Audit Report', price: '$99 / field', desc: 'Single downloadable audit-ready PDF report without recurring subscription. Ideal for single USDA grant or loan application.' }
  ];

  plans.forEach((pl) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${pl.name} — ${pl.price}`, margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const dLines = doc.splitTextToSize(pl.desc, contentWidth);
    doc.text(dLines, margin, y);
    y += dLines.length * 3.8 + 2;
  });

  // SECTION 6: GLOSSARY OF KEY TERMS
  checkPageBreak(40);
  y += 3;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 83, 45);
  doc.text('6. Scientific Glossary & Methodological Citations', margin, y);
  y += 5;

  const terms = [
    { t: 'SOC (Soil Organic Carbon):', d: 'The carbon component of soil organic matter (SOM ≈ SOC × 1.724). Primary biological measure of soil health and carbon sequestration.' },
    { t: 'NDVI (Normalized Difference Veg Index):', d: 'Satellite-derived greenness ratio measuring photosynthetic biomass vigor from Sentinel-2 10m bands.' },
    { t: 'Carbon Insetting vs Offsetting:', d: 'Insetting reduces GHG emissions directly within the company\'s agricultural supply shed (Scope 3), whereas offsetting purchases external credits.' },
    { t: 'IPCC Tier 1 vs USDA COMET-Farm:', d: 'Standardized empirical emission factors calculating net GHG flux per acre from tillage reduction and cover crops.' }
  ];

  terms.forEach((term) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(term.t, margin, y);
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const tLines = doc.splitTextToSize(term.d, contentWidth);
    doc.text(tLines, margin, y);
    y += tLines.length * 3.4 + 1.5;
  });

  return doc;
}
