import jsPDF from 'jspdf';

interface APRecommendation {
  location: string;
  band: string;
  apType: string;
  reason: string;
  priority: string;
  coverageRadius: string;
}

interface CoverageZone {
  zone: string;
  riskLevel: string;
  assessment: string;
  recommendation: string;
}

interface DesignBriefAnalysis {
  executiveSummary: string;
  floorPlanObservations: string[];
  apRecommendations: APRecommendation[];
  channelStrategy: {
    band24: string;
    band5: string;
    txPower: string;
    notes: string;
  };
  coverageZones: CoverageZone[];
  interferenceRisks: string[];
  criticalFindings: string[];
  estimatedAPCount: number;
  hardwareNotes: string;
  corvusVerdict: string;
}

interface LocationInfo {
  name: string;
  type: string;
  sqft: string;
  stories: string;
  construction: string;
  notes: string;
}

async function imgToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

const NAVY_DARK = '#0D1520';
const TEAL = '#0D6E7A';
const CYAN = '#00C2C7';
const GOLD = '#B8922A';
const WHITE = '#F4F6F8';
const GRAY = '#888888';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function setFill(doc: jsPDF, hex: string) {
  doc.setFillColor(...hexToRgb(hex));
}

function setTextColor(doc: jsPDF, hex: string) {
  doc.setTextColor(...hexToRgb(hex));
}

function setDrawColor(doc: jsPDF, hex: string) {
  doc.setDrawColor(...hexToRgb(hex));
}

function riskColor(level: string): string {
  switch (level) {
    case 'Critical': return '#FF4444';
    case 'High': return '#FF8C00';
    case 'Medium': return GOLD;
    default: return TEAL;
  }
}

function priorityColor(p: string): string {
  switch (p) {
    case 'Primary': return CYAN;
    case 'Secondary': return TEAL;
    default: return GRAY;
  }
}

function wrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number = 20): number {
  if (y + needed > 270) {
    doc.addPage();
    setFill(doc, NAVY_DARK);
    doc.rect(0, 0, 210, 297, 'F');
    return 20;
  }
  return y;
}

function sectionHeader(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, 16);
  setFill(doc, TEAL);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setTextColor(doc, WHITE);
  doc.text(title.toUpperCase(), 18, y + 5.5);
  return y + 12;
}

export async function generateDesignBriefPdf(
  analysis: DesignBriefAnalysis,
  locationInfo: LocationInfo,
  floorPlanBase64?: string
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;

  // Load logos
  let logoBase64 = '';
  let crowsBase64 = '';
  try {
    logoBase64 = await imgToBase64('/OCWS_Logo_Transparent.png');
    crowsBase64 = await imgToBase64('/Crows_Eye_Logo.png');
  } catch (_) {}

  // ── COVER PAGE ──────────────────────────────────────────────
  setFill(doc, NAVY_DARK);
  doc.rect(0, 0, pageW, 297, 'F');

  // Teal accent bar top
  setFill(doc, TEAL);
  doc.rect(0, 0, pageW, 4, 'F');

  // Gold accent bar
  setFill(doc, GOLD);
  doc.rect(0, 4, pageW, 1.5, 'F');

  // Logos
  if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 12, 40, 14);
  if (crowsBase64) doc.addImage(crowsBase64, 'PNG', pageW - 50, 12, 36, 14);

  // Title block
  setFill(doc, TEAL);
  doc.rect(14, 55, 182, 50, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setTextColor(doc, WHITE);
  doc.text("WIRELESS DESIGN BRIEF", pageW / 2, 72, { align: 'center' });

  doc.setFontSize(13);
  setTextColor(doc, GOLD);
  doc.text(locationInfo.name || 'Client Property', pageW / 2, 84, { align: 'center' });

  doc.setFontSize(9);
  setTextColor(doc, WHITE);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared by Corvus · Old Crows Wireless Solutions`, pageW / 2, 93, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW / 2, 98, { align: 'center' });

  // Property info block
  const infoY = 120;
  setFill(doc, '#1A2332');
  doc.rect(14, infoY, 182, 44, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setTextColor(doc, TEAL);
  doc.text('PROPERTY DETAILS', 20, infoY + 8);

  const details = [
    ['Location Type', locationInfo.type || '—'],
    ['Square Footage', locationInfo.sqft ? `${locationInfo.sqft} sq ft` : '—'],
    ['Stories', locationInfo.stories || '—'],
    ['Construction', locationInfo.construction || '—'],
    ['Estimated APs Required', String(analysis.estimatedAPCount || '—')],
  ];

  doc.setFontSize(8);
  details.forEach(([label, value], i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = col === 0 ? 20 : 110;
    const y = infoY + 16 + row * 8;
    doc.setFont('helvetica', 'bold');
    setTextColor(doc, GRAY);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    setTextColor(doc, WHITE);
    doc.text(value, x + 40, y);
  });

  // Floor plan thumbnail if provided
  if (floorPlanBase64) {
    try {
      doc.addImage(floorPlanBase64, 'JPEG', 14, 175, 182, 80);
      setDrawColor(doc, TEAL);
      doc.setLineWidth(0.5);
      doc.rect(14, 175, 182, 80);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      setTextColor(doc, GRAY);
      doc.text('Floor Plan — Reference Only', 14, 258);
    } catch (_) {}
  }

  // Footer
  setFill(doc, TEAL);
  doc.rect(0, 285, pageW, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setTextColor(doc, GRAY);
  doc.text('Corvus, Crow\'s Eye, The Full Reckoning, and Corvus\' Verdict are unregistered trademarks of Old Crows Wireless Solutions LLC.', pageW / 2, 291, { align: 'center' });
  doc.text('oldcrowswireless.com', pageW / 2, 295, { align: 'center' });

  // ── PAGE 2 — EXECUTIVE SUMMARY + FINDINGS ────────────────────
  doc.addPage();
  setFill(doc, NAVY_DARK);
  doc.rect(0, 0, pageW, 297, 'F');
  setFill(doc, TEAL);
  doc.rect(0, 0, pageW, 4, 'F');
  setFill(doc, GOLD);
  doc.rect(0, 4, pageW, 1.5, 'F');

  let y = 16;

  // Executive Summary
  y = sectionHeader(doc, 'Executive Summary', y);
  setFill(doc, '#1A2332');
  doc.rect(14, y, 182, 30, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  setTextColor(doc, CYAN);
  y = wrappedText(doc, `"${analysis.executiveSummary}"`, 19, y + 7, 172, 5.5);
  y = Math.max(y, 60) + 6;

  // Critical Findings
  if (analysis.criticalFindings?.length) {
    y = sectionHeader(doc, `Critical Findings (${analysis.criticalFindings.length})`, y);
    analysis.criticalFindings.forEach((f, i) => {
      y = checkPageBreak(doc, y, 10);
      setFill(doc, '#FF444422');
      doc.rect(14, y - 4, 182, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setTextColor(doc, '#FF4444');
      doc.text(`${i + 1}.`, 18, y + 1);
      doc.setFont('helvetica', 'normal');
      setTextColor(doc, WHITE);
      y = wrappedText(doc, f, 25, y + 1, 165, 5);
      y += 3;
    });
    y += 4;
  }

  // Floor Plan Observations
  if (analysis.floorPlanObservations?.length) {
    y = sectionHeader(doc, 'Floor Plan Observations', y);
    analysis.floorPlanObservations.forEach((obs) => {
      y = checkPageBreak(doc, y, 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setTextColor(doc, TEAL);
      doc.text('▸', 18, y + 1);
      setTextColor(doc, WHITE);
      y = wrappedText(doc, obs, 24, y + 1, 166, 5);
      y += 2;
    });
    y += 4;
  }

  // Interference Risks
  if (analysis.interferenceRisks?.length) {
    y = sectionHeader(doc, 'Interference Risks', y);
    analysis.interferenceRisks.forEach((risk) => {
      y = checkPageBreak(doc, y, 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setTextColor(doc, GOLD);
      doc.text('⚠', 18, y + 1);
      setTextColor(doc, WHITE);
      y = wrappedText(doc, risk, 24, y + 1, 166, 5);
      y += 2;
    });
    y += 4;
  }

  // ── PAGE 3 — AP RECOMMENDATIONS ──────────────────────────────
  doc.addPage();
  setFill(doc, NAVY_DARK);
  doc.rect(0, 0, pageW, 297, 'F');
  setFill(doc, TEAL);
  doc.rect(0, 0, pageW, 4, 'F');
  setFill(doc, GOLD);
  doc.rect(0, 4, pageW, 1.5, 'F');

  y = 16;
  y = sectionHeader(doc, `AP Placement Recommendations — ${analysis.estimatedAPCount} Access Points`, y);

  analysis.apRecommendations?.forEach((ap, i) => {
    y = checkPageBreak(doc, y, 28);
    setFill(doc, '#1A2332');
    doc.rect(14, y, 182, 26, 'F');

    // Priority badge
    setFill(doc, priorityColor(ap.priority));
    doc.rect(14, y, 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setTextColor(doc, NAVY_DARK);
    doc.text(ap.priority.toUpperCase(), 28, y + 4, { align: 'center' });

    // AP number + location
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setTextColor(doc, GOLD);
    doc.text(`AP ${i + 1}`, 19, y + 13);
    setTextColor(doc, WHITE);
    doc.setFontSize(9);
    doc.text(ap.location, 30, y + 13);

    // Band + type
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setTextColor(doc, CYAN);
    doc.text(`${ap.band}  ·  ${ap.apType}  ·  ~${ap.coverageRadius}`, 19, y + 19);

    // Reason
    setTextColor(doc, GRAY);
    doc.setFontSize(7.5);
    const reasonLines = doc.splitTextToSize(ap.reason, 170);
    doc.text(reasonLines[0] || '', 19, y + 24);

    y += 30;
  });

  // Channel Strategy
  y = checkPageBreak(doc, y + 4, 45);
  y = sectionHeader(doc, 'Channel Strategy', y);
  setFill(doc, '#1A2332');
  doc.rect(14, y, 182, 38, 'F');

  const chanItems = [
    ['2.4 GHz Plan', analysis.channelStrategy?.band24],
    ['5 GHz Plan', analysis.channelStrategy?.band5],
    ['TX Power', analysis.channelStrategy?.txPower],
    ['Notes', analysis.channelStrategy?.notes],
  ];

  chanItems.forEach(([label, val]) => {
    if (!val) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setTextColor(doc, TEAL);
    doc.text(`${label}:`, 19, y + 8);
    doc.setFont('helvetica', 'normal');
    setTextColor(doc, WHITE);
    const lines = doc.splitTextToSize(val, 130);
    doc.text(lines, 55, y + 8);
    y += 8;
  });
  y += 16;

  // ── PAGE 4 — COVERAGE ZONES + VERDICT ────────────────────────
  doc.addPage();
  setFill(doc, NAVY_DARK);
  doc.rect(0, 0, pageW, 297, 'F');
  setFill(doc, TEAL);
  doc.rect(0, 0, pageW, 4, 'F');
  setFill(doc, GOLD);
  doc.rect(0, 4, pageW, 1.5, 'F');

  y = 16;
  y = sectionHeader(doc, 'Coverage Zone Analysis', y);

  analysis.coverageZones?.forEach((zone) => {
    y = checkPageBreak(doc, y, 24);
    setFill(doc, '#1A2332');
    doc.rect(14, y, 182, 22, 'F');

    const rc = riskColor(zone.riskLevel);
    setFill(doc, rc);
    doc.rect(14, y, 4, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setTextColor(doc, WHITE);
    doc.text(zone.zone, 21, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setTextColor(doc, rc === GOLD ? GOLD : rc);
    doc.text(zone.riskLevel.toUpperCase(), pageW - 16, y + 7, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setTextColor(doc, GRAY);
    const assLines = doc.splitTextToSize(zone.assessment, 150);
    doc.text(assLines[0] || '', 21, y + 13);

    setTextColor(doc, CYAN);
    const recLines = doc.splitTextToSize(`→ ${zone.recommendation}`, 150);
    doc.text(recLines[0] || '', 21, y + 18);

    y += 26;
  });

  // Hardware Notes
  if (analysis.hardwareNotes) {
    y = checkPageBreak(doc, y + 4, 20);
    y = sectionHeader(doc, 'Hardware Notes', y);
    setFill(doc, '#1A2332');
    doc.rect(14, y, 182, 16, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setTextColor(doc, WHITE);
    y = wrappedText(doc, analysis.hardwareNotes, 19, y + 7, 172, 5);
    y += 12;
  }

  // Corvus Verdict
  y = checkPageBreak(doc, y + 6, 30);
  setFill(doc, TEAL);
  doc.rect(14, y, 182, 2, 'F');
  y += 6;

  setFill(doc, '#0D1520');
  doc.rect(14, y, 182, 32, 'F');
  setDrawColor(doc, GOLD);
  doc.setLineWidth(0.5);
  doc.rect(14, y, 182, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setTextColor(doc, GOLD);
  doc.text("CORVUS' VERDICT", 18, y + 8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  setTextColor(doc, CYAN);
  const verdictLines = doc.splitTextToSize(`"${analysis.corvusVerdict}"`, 170);
  verdictLines.slice(0, 4).forEach((line: string, i: number) => {
    doc.text(line, 18, y + 16 + i * 5.5);
  });

  // Footer all pages
  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setFill(doc, TEAL);
    doc.rect(0, 285, pageW, 1, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setTextColor(doc, GRAY);
    doc.text('Corvus, Crow\'s Eye, The Full Reckoning, and Corvus\' Verdict are unregistered trademarks of Old Crows Wireless Solutions LLC.', pageW / 2, 291, { align: 'center' });
    doc.text(`oldcrowswireless.com  ·  Page ${p} of ${totalPages}`, pageW / 2, 295, { align: 'center' });
  }

  const clientName = locationInfo.name?.replace(/[^a-z0-9]/gi, '_') || 'Client';
  doc.save(`Wireless_Design_Brief_${clientName}.pdf`);
}
