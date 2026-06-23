'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DesignBriefTab from './DesignBriefTab';
import CorvusTooltip from './CorvusTooltip';

interface CrowsEyeTabProps {
  code: string;
  isVIP: boolean;
  tier: string; // "nest" | "flock" | "murder" | "vip"
  creditsRemaining: number;
  reckoningCredits: { small: number; standard: number; commercial: number };
  onScanComplete?: () => void;
  navigateToChat?: () => void;
  lockedSSID?: string;
}

// Step-by-step fixes are FREE during the first-1,000-scans promo. When the promo
// ends, flip this to true to re-gate steps behind the paywall (blurred + unlock CTA).
// Single source of truth — the findings renderer below branches on it.
const STEPS_GATED = false;

const PROCESSING_LINES = [
  'Rolling Perception on your WiFi environment...',
  'Identifying all networks in range... I see you, channel 11 squatters...',
  'Cross-referencing MAC addresses... someone in this environment needs to be removed...',
  'Analyzing channel congestion... as Proverbs 14:4 says, where there are no oxen the manger is clean... your manger is not clean...',
  'Mapping interference patterns... this is a dungeon crawl and I am reading the room...',
  'Calculating signal strength deltas... Blastoise uses Surf... it\'s super effective...',
  'Reviewing vendor configurations... whoever set this up was rolling disadvantage...',
  'Compiling findings... I want to be the very best at diagnosing your network...',
  'Rendering WiFi Health Report... natural 20 on the analysis roll...',
  'Doing a full Marauder\'s Map on your network... I see everything...',
  'Mapping every room before we engage... dungeon crawl protocol active...',
  'In the end it doesn\'t even matter... analyzing your WiFi environment...',
  'Crawling through your network configuration...',
  'Crikey. Look at the size of that channel congestion...',
  'Approaching the interference carefully... from behind... don\'t startle it...',
  'Checking your network... the number of problems is too many...',
  'Fine on their end. It\'s always fine on their end. Scanning anyway...',
  'By the grace of God and acceptable performance margins... analyzing...',
];

const ENVIRONMENTS = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'mixed', label: 'Mixed' },
];

const LOCATION_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'small_office', label: 'Small Office' },
  { value: 'large_office', label: 'Large Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'multi_unit', label: 'Multi-Unit Residential' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

interface ReportFinding {
  severity: string;
  title: string;
  description: string;
  fix?: string;
  fix_summary?: string;
  steps?: string[];
  router_info?: {
    vendor: string;
    gateway_ip: string | null;
    default_username: string;
    default_password: string;
    confidence: string;
  };
  login_disclaimer?: string;
}

interface ReportData {
  reportId: string;
  product: string;
  clientName: string;
  ssid: string;
  address: string;
  createdAt: string;
  corvus_opening?: string;
  corvusAnalysis?: string;
  findings: ReportFinding[];
  recommendations: string[];
  problems_found: number;
  critical_count: number;
  warning_count: number;
  good_count: number;
  corvus_summary?: string;
  device?: { vendor: string; model?: string; type?: string; } | null;
}

function getSeverityStyle(severity: string): React.CSSProperties {
  const s = severity?.toUpperCase();
  if (s === 'CRITICAL') {
    return {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.35)',
      borderRadius: 10,
      padding: '16px 18px',
      marginBottom: 12,
    };
  }
  if (s === 'WARNING') {
    return {
      background: 'rgba(234,179,8,0.12)',
      border: '1px solid rgba(234,179,8,0.35)',
      borderRadius: 10,
      padding: '16px 18px',
      marginBottom: 12,
    };
  }
  // GOOD / INFO
  return {
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.35)',
    borderRadius: 10,
    padding: '16px 18px',
    marginBottom: 12,
  };
}

function getSeverityColor(severity: string): string {
  const s = severity?.toUpperCase();
  if (s === 'CRITICAL') return '#f87171';
  if (s === 'WARNING') return '#fbbf24';
  return '#4ade80';
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0D1520',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#ffffff',
  fontSize: 16,
  fontFamily: 'monospace',
  outline: 'none',
  marginBottom: 10,
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'rgba(244,246,248,0.6)',
  fontFamily: 'monospace',
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  marginBottom: 4,
  textTransform: 'uppercase',
};

async function compressImage(file: File, maxSizeKB = 300): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX) { height = (height * MAX) / width; width = MAX; }
      if (height > MAX) { width = (width * MAX) / height; height = MAX; }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.85;
      const attempt = () => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size / 1024 <= maxSizeKB || quality <= 0.2) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            quality -= 0.1;
            attempt();
          }
        }, 'image/jpeg', quality);
      };
      attempt();
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export default function CrowsEyeTab({
  code,
  isVIP,
  tier,
  creditsRemaining,
  reckoningCredits,
  onScanComplete,
  navigateToChat,
  lockedSSID,
}: CrowsEyeTabProps) {
  const isMurderOrVip = isVIP || ['murder', 'vip', 'full'].includes(tier?.toLowerCase());
  const [activeTab, setActiveTab] = useState<'verdict' | 'design-brief'>('verdict');

  // Mode / size
  const [mode, setMode] = useState<'verdict' | 'reckoning'>('verdict');
  const [size, setSize] = useState<'small' | 'standard' | 'commercial' | 'pro'>('small');
  const [isHybrid, setIsHybrid] = useState(false);

  // Instructions collapsible
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  // Form fields
  const [clientName, setClientName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('FL');
  const [zip, setZip] = useState('');
  const [ssid, setSsid] = useState('');
  const [clientComplaints, setClientComplaints] = useState('');
  const [environment, setEnvironment] = useState('indoor');
  const [locationType, setLocationType] = useState('residential');
  const [comfortLevel, setComfortLevel] = useState<number>(2);

  // File uploads (Verdict / Reckoning Small — single location)
  const [signalListFile, setSignalListFile] = useState<File | null>(null);
  const [ghz24File, setGhz24File] = useState<File | null>(null);
  const [ghz5File, setGhz5File] = useState<File | null>(null);

  // Multi-location Reckoning (standard / commercial)
  interface ReckoningLocation {
    id: number;
    name: string;
    signalListFile: File | null;
    ghz24File: File | null;
    ghz5File: File | null;
  }
  const [reckoningLocations, setReckoningLocations] = useState<ReckoningLocation[]>([
    { id: 1, name: '', signalListFile: null, ghz24File: null, ghz5File: null },
  ]);

  const getMaxLocations = useCallback(() => {
    if (size === 'standard') return 15;
    if (size === 'commercial') return 30;
    return 5;
  }, [size]);

  const addLocation = () => {
    setReckoningLocations(prev => {
      if (prev.length >= getMaxLocations()) return prev;
      return [...prev, { id: Date.now(), name: '', signalListFile: null, ghz24File: null, ghz5File: null }];
    });
  };

  const removeLocation = (id: number) => {
    setReckoningLocations(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev);
  };

  const updateLocation = (id: number, field: keyof ReckoningLocation, value: string | File | null) => {
    setReckoningLocations(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  // Only reset locations when MODE changes (not when size changes — preserve uploaded files)
  const prevModeRef = useRef<'verdict' | 'reckoning'>(mode);
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      if (mode === 'reckoning') {
        setReckoningLocations([{ id: Date.now(), name: '', signalListFile: null, ghz24File: null, ghz5File: null }]);
      }
      if (mode !== 'reckoning') setIsHybrid(false);
    }
  }, [mode]);

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLine, setProcessingLine] = useState(PROCESSING_LINES[0]);
  const [processingIdx, setProcessingIdx] = useState(0);

  // Report
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfLogos, setPdfLogos] = useState<{
    ocws: string | null; ocwsAspect: number;
    crows: string | null; crowsAspect: number;
  }>({ ocws: null, ocwsAspect: 1, crows: null, crowsAspect: 1 });

  // Derived
  const canUseStandardOrCommercial = isVIP || ['flock', 'murder', 'vip', 'full'].includes(tier);
  const isOneTimePurchaser = !tier || tier === 'none';
  const isMonthlySubscriber = ['nest', 'flock', 'murder'].includes(tier) && !isVIP;

  // Load instructions pref
  useEffect(() => {
    try {
      const stored = localStorage.getItem('corvus_show_instructions');
      if (stored !== null) setShowInstructions(stored === 'true');
    } catch {}
  }, []);

  // Pre-fill SSID when locked by team lead
  useEffect(() => {
    if (lockedSSID) setSsid(lockedSSID);
  }, [lockedSSID]);

  const toggleInstructions = () => {
    setShowInstructions(prev => {
      const next = !prev;
      try { localStorage.setItem('corvus_show_instructions', String(next)); } catch {}
      return next;
    });
  };

  // Processing line cycling
  const processingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isProcessing) {
      processingTimer.current = setInterval(() => {
        setProcessingIdx(prev => {
          const next = (prev + 1) % PROCESSING_LINES.length;
          setProcessingLine(PROCESSING_LINES[next]);
          return next;
        });
      }, 3000);
    } else {
      if (processingTimer.current) {
        clearInterval(processingTimer.current);
        processingTimer.current = null;
      }
    }
    return () => {
      if (processingTimer.current) clearInterval(processingTimer.current);
    };
  }, [isProcessing]);

  // Load PDF logos at mount so they are ready when the PDF generates
  useEffect(() => {
    (async () => {
      async function fetchLogo(path: string) {
        try {
          const r = await fetch(path);
          const blob = await r.blob();
          const data = await new Promise<string>((res) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result as string);
            fr.readAsDataURL(blob);
          });
          const aspect = await new Promise<number>((res) => {
            const img = new Image();
            img.onload = () => res(img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1);
            img.onerror = () => res(1);
            img.src = data;
          });
          return { data, aspect };
        } catch { return { data: null as string | null, aspect: 1 }; }
      }
      const [ocws, crows] = await Promise.all([
        fetchLogo("/OCWS_Logo_Transparent.png"),
        fetchLogo("/Crows_Eye_Logo.png"),
      ]);
      setPdfLogos({ ocws: ocws.data, ocwsAspect: ocws.aspect, crows: crows.data, crowsAspect: crows.aspect });
    })();
  }, []);

  const productValue = mode === 'verdict'
    ? 'verdict'
    : `reckoning_${size}` as string;

  const isMultiLocation = mode === 'reckoning';

  const handleRunScan = async () => {
    if (!clientName.trim()) {
      setError('Client name is required.');
      return;
    }

    if (isMultiLocation) {
      const readyLocations = reckoningLocations.filter(l => l.signalListFile);
      if (readyLocations.length === 0) {
        setError('At least one location with a Signal List screenshot is required.');
        return;
      }
    } else {
      if (!signalListFile) {
        setError('Signal List upload is required.');
        return;
      }
    }

    setError(null);
    setIsProcessing(true);
    setReport(null);
    setProcessingIdx(0);
    setProcessingLine(PROCESSING_LINES[0]);

    try {
      const formData = new FormData();
      formData.append('code', code);
      formData.append('product', productValue);
      formData.append('clientName', clientName.trim());
      formData.append('street', street.trim());
      formData.append('city', city.trim());
      formData.append('state', state);
      formData.append('zip', zip.trim());
      formData.append('ssid', ssid.trim());
      formData.append('clientComplaints', clientComplaints.trim());
      formData.append('environment', environment);
      formData.append('locationType', locationType);
      formData.append('comfortLevel', String(comfortLevel));
      if (mode === 'reckoning') formData.append('isHybrid', String(isHybrid));

      if (isMultiLocation) {
        const readyLocations = reckoningLocations.filter(l => l.signalListFile);
        formData.append('locationCount', String(readyLocations.length));
        for (let i = 0; i < readyLocations.length; i++) {
          const loc = readyLocations[i];
          formData.append(`location_${i}_name`, loc.name || `Location ${i + 1}`);
          const locationCount = readyLocations.length;
          const maxKB = locationCount >= 10 ? 150 : locationCount >= 5 ? 200 : locationCount >= 3 ? 250 : 300;
          formData.append(`location_${i}_signalList`, await compressImage(loc.signalListFile as File, maxKB));
          if (loc.ghz24File) formData.append(`location_${i}_ghz24`, await compressImage(loc.ghz24File, maxKB));
          if (loc.ghz5File) formData.append(`location_${i}_ghz5`, await compressImage(loc.ghz5File, maxKB));
        }
      } else {
        formData.append('signalList', await compressImage(signalListFile as File, 300));
        if (ghz24File) formData.append('ghz24', await compressImage(ghz24File, 300));
        if (ghz5File) formData.append('ghz5', await compressImage(ghz5File, 300));
      }

      console.log('[handleRunScan] sending request, locationCount:', isMultiLocation ? reckoningLocations.filter(l => l.signalListFile).length : 1);
      const res = await fetch('/api/dashboard/run-scan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        console.error('[handleRunScan] server error:', res.status, data.error, data.detail);
        setError(`${data.error || 'Scan failed.'} (${res.status}${data.detail ? ': ' + data.detail : ''})`);
        return;
      }

      setReport(data.report);
      onScanComplete?.();
    } catch (err) {
      console.error('[handleRunScan] error:', err);
      setError(err instanceof Error ? err.message : 'Scan failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskCorvus = () => {
    if (!report) return;
    try {
      sessionStorage.setItem('corvus_active_report', JSON.stringify(report));
    } catch {}
    navigateToChat?.();
  };

  const handleDownloadPDF = async () => {
    if (!report || pdfGenerating) return;
    setPdfGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      doc.setLineHeightFactor(1.4);

      const PW = 612, PH = 792, ML = 36, MR = 36, CW = PW - ML - MR;
      const FOOTER_H = 36, SAFE_BTM = PH - FOOTER_H - 8;

      const NAVY:  [number,number,number] = [26,  35,  50];
      const NAVYL: [number,number,number] = [26,  38,  69];
      const NAVYD: [number,number,number] = [13,  21,  32];
      const TEAL:  [number,number,number] = [13,  110, 122];
      const CYAN:  [number,number,number] = [0,   194, 199];
      const GOLD:  [number,number,number] = [216, 172, 50];
      const WHITE: [number,number,number] = [255, 255, 255];
      const LGRAY: [number,number,number] = [244, 246, 248];
      const MGRAY: [number,number,number] = [170, 170, 170];
      const DGRAY: [number,number,number] = [100, 120, 145];
      const RED:   [number,number,number] = [224, 85,  85];
      const GREEN: [number,number,number] = [34,  197, 94];
      const SEV: Record<string, [number,number,number]> = {
        CRITICAL: RED, WARNING: GOLD, GOOD: GREEN,
      };

      const now = new Date(report.createdAt || Date.now());
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      let y = 0, pg = 1;

      const sf = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2]);
      const st = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2]);
      const sd = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2]);
      const fn = (style: 'normal'|'bold'|'italic'|'bolditalic', sz: number) => {
        doc.setFont('helvetica', style); doc.setFontSize(sz);
      };
      const th = (n: number, sz: number) => n * sz * 1.4;
      const wrap = (t: string, maxW: number) => doc.splitTextToSize(t, maxW);
      function txt(lines: string | string[], x: number, topY: number, sz: number): number {
        const arr = typeof lines === 'string' ? [lines] : lines;
        doc.text(arr, x, topY + sz * 0.8);
        return th(arr.length, sz);
      }

      function drawBg() { sf(NAVY); doc.rect(0, 0, PW, PH, 'F'); }

      function drawFooter() {
        sf(NAVYD); doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, 'F');
        const copyrightText = '\u00A9 2026 Old Crows Wireless Solutions LLC. Corvus, Crow\u2019s Eye, The Full Reckoning, and Corvus\u2019 Verdict are unregistered trademarks of Old Crows Wireless Solutions LLC. All rights reserved.';
        st(DGRAY); fn('normal', 6.5);
        const copyrightLines = doc.splitTextToSize(copyrightText, PW - ML - MR - 30);
        const lineH = 6.5 * 1.4;
        const blockH = copyrightLines.length * lineH;
        const startY = PH - FOOTER_H + (FOOTER_H - blockH) / 2 + 6.5 * 0.8;
        doc.text(copyrightLines, PW / 2, startY, { align: 'center' });
        st(DGRAY); fn('normal', 7);
        doc.text(String(pg), PW - MR, PH - FOOTER_H + 18, { align: 'right' });
      }

      function newPage() {
        drawFooter(); doc.addPage(); pg++; drawBg();
        sf(NAVYD); doc.rect(0, 0, PW, 26, 'F');
        sf(TEAL);  doc.rect(0, 23, PW, 3, 'F');
        st(CYAN); fn('bold', 7.5); doc.text('WIFI HEALTH REPORT', ML, 17);
        st(DGRAY); fn('normal', 7); doc.text(report!.reportId, PW - MR, 17, { align: 'right' });
        y = 36;
      }

      function ensure(needed: number) { if (y + needed > SAFE_BTM) newPage(); }

      function sectionBar(title: string) {
        ensure(26);
        sf(TEAL); doc.rect(0, y, PW, 22, 'F');
        st(WHITE); fn('bold', 9); doc.text(title, ML, y + 15);
        y += 22;
      }

      drawBg();

      // Header
      const HDR = 72;
      sf(NAVYD); doc.rect(0, 0, PW, HDR, 'F');
      sf(GOLD);  doc.rect(0, HDR - 2, PW, 2, 'F');

      const LOGO_H = 44;
      if (pdfLogos.ocws) {
        const ocwsW = Math.round(LOGO_H * pdfLogos.ocwsAspect);
        doc.addImage(pdfLogos.ocws, 'PNG', ML, (HDR - LOGO_H) / 2, ocwsW, LOGO_H);
      }
      if (pdfLogos.crows) {
        const crowsW = Math.round(LOGO_H * pdfLogos.crowsAspect);
        doc.addImage(pdfLogos.crows, 'PNG', PW - MR - crowsW, (HDR - LOGO_H) / 2, crowsW, LOGO_H);
      }

      st(CYAN); fn('bold', 20);
      doc.text('WIFI HEALTH REPORT', PW / 2, HDR / 2 + 7, { align: 'center' });
      st(GOLD); fn('bold', 7.5);
      doc.text('CROW\u2019S EYE BY CORVUS', PW - MR, HDR / 2 - 6, { align: 'right' });
      st(DGRAY); fn('normal', 7.5);
      doc.text(report.reportId, PW - MR, HDR / 2 + 5, { align: 'right' });
      doc.text(dateStr, PW - MR, HDR / 2 + 16, { align: 'right' });
      y = HDR + 2;

      // Client info block
      const CPAD = 16, HALF = CW / 2 - 8;
      const nameW = wrap(report.clientName || '\u2014', HALF);
      const addrW = report.address ? wrap(report.address, HALF) : [];
      const ssidW = report.ssid ? wrap(`WiFi Network: ${report.ssid}`, HALF) : [];
      const rightRows: Array<[string, string]> = [
        ['REPORT', report.reportId],
        ['DATE', dateStr],
        ['PRODUCT', report.product || 'WiFi Health Report'],
      ];
      let leftColH = th(nameW.length, 13) + 4;
      if (addrW.length) leftColH += th(addrW.length, 9) + 4;
      if (ssidW.length) leftColH += th(ssidW.length, 9) + 4;
      const rightColH = rightRows.reduce((a, [,v]) => a + th(1, 6.5) + 2 + th(wrap(v, HALF).length, 8.5) + 6, 0);
      const clientH = Math.max(leftColH, rightColH) + CPAD * 2;
      ensure(clientH + 4);
      sf(NAVY); doc.rect(0, y, PW, clientH, 'F');

      let ly = y + CPAD;
      st(WHITE); fn('bold', 13); ly += txt(nameW, ML, ly, 13) + 4;
      if (addrW.length) { st(MGRAY); fn('normal', 9); ly += txt(addrW, ML, ly, 9) + 4; }
      if (ssidW.length) { st(CYAN);  fn('normal', 9); txt(ssidW, ML, ly, 9); }

      let ry = y + CPAD;
      const rx = ML + CW / 2 + 8;
      for (const [label, val] of rightRows) {
        const valW = wrap(val, HALF);
        st(GOLD); fn('bold', 6.5); ry += txt(label, rx, ry, 6.5) + 2;
        st(DGRAY); fn('normal', 8.5); ry += txt(valW, rx, ry, 8.5) + 6;
      }
      y += clientH + 8;

      // Corvus analysis
      sectionBar('CORVUS ANALYSIS');
      y += 6;
      if (report.corvus_opening) {
        const INNER_W = CW - 3 - 16;
        fn('italic', 9); const openW = wrap(`\u201C${report.corvus_opening}\u201D`, INNER_W);
        const aH = th(openW.length, 9) + 24;
        ensure(aH + 4);
        sf(NAVYL); doc.rect(ML, y, CW, aH, 'F');
        sf(CYAN);  doc.rect(ML, y, 3, aH, 'F');
        st(LGRAY); fn('italic', 9); txt(openW, ML + 3 + 12, y + 12, 9);
        y += aH + 8;
      }

      // Stats row
      ensure(52);
      const SW = (CW - 9) / 4;
      [
        { label: 'ISSUES',   val: report.problems_found,  clr: LGRAY },
        { label: 'CRITICAL', val: report.critical_count,  clr: RED   },
        { label: 'WARNINGS', val: report.warning_count,   clr: GOLD  },
        { label: 'GOOD',     val: report.good_count,      clr: GREEN },
      ].forEach((s, i) => {
        const sx = ML + i * (SW + 3);
        sf(NAVYL); doc.roundedRect(sx, y, SW, 46, 3, 3, 'F');
        st(s.clr); fn('bold', 20); doc.text(String(s.val), sx + SW / 2, y + 30, { align: 'center' });
        st(DGRAY); fn('normal', 6.5); doc.text(s.label, sx + SW / 2, y + 40, { align: 'center' });
      });
      y += 54;

      // Findings
      sectionBar('FINDINGS');
      y += 6;

      for (const f of report.findings) {
        const sc = SEV[f.severity?.toUpperCase()] ?? GOLD;
        const CP = 12, CARD_IW = CW - 3 - CP * 2;

        fn('bold', 10); const titleW = wrap(f.title || '', CARD_IW - 58);
        fn('bold', 9);  const fixSumW = wrap(f.fix_summary || f.fix || '', CARD_IW - 16);
        fn('normal', 9); const descW = wrap(f.description || '', CARD_IW);
        fn('normal', 8);
        const stepsW: string[][] = f.steps?.length
          ? f.steps.map((s: string, si: number) => wrap(`${si + 1}.  ${s}`, CARD_IW - 10))
          : [];

        const FIX_BOX_PAD = 8;
        const fixSumBoxH = FIX_BOX_PAD + th(1, 7) + 3 + th(fixSumW.length, 9) + FIX_BOX_PAD;
        const S = stepsW.length ? stepsW.reduce((a: number, sl: string[]) => a + th(sl.length, 8) + 3, 0) + 5 : 0;
        const cardH = CP * 2 + th(titleW.length, 10) + 6 + fixSumBoxH + 8 + th(descW.length, 9) + 6 + S;

        ensure(cardH + 8);

        sf(NAVYL); doc.rect(ML, y, CW, cardH, 'F');
        sf(sc);    doc.rect(ML, y, 3, cardH, 'F');

        const bb: [number,number,number] = [
          Math.round(sc[0] * 0.12 + NAVYL[0] * 0.88),
          Math.round(sc[1] * 0.12 + NAVYL[1] * 0.88),
          Math.round(sc[2] * 0.12 + NAVYL[2] * 0.88),
        ];
        sf(bb); doc.roundedRect(ML + CW - 58, y + CP - 4, 52, 14, 2, 2, 'F');
        st(sc); fn('bold', 7);
        doc.text(f.severity?.toUpperCase() || '', ML + CW - 32, y + CP + 5.5, { align: 'center' });

        let cy = y + CP;
        const cx = ML + 3 + CP;
        st(WHITE); fn('bold', 10); cy += txt(titleW, cx, cy, 10) + 6;

        // Fix box
        sf(NAVYL); doc.rect(cx, cy, CARD_IW, fixSumBoxH, 'F');
        sf(TEAL);  doc.rect(cx, cy, 3, fixSumBoxH, 'F');
        st(CYAN);  fn('bold', 7); txt('THE FIX', cx + 8, cy + FIX_BOX_PAD, 7);
        st(WHITE); fn('bold', 9); txt(fixSumW, cx + 8, cy + FIX_BOX_PAD + th(1, 7) + 3, 9);
        cy = cy + fixSumBoxH + 8;

        st(MGRAY); fn('normal', 9); cy += txt(descW, cx, cy, 9) + 6;

        if (stepsW.length) {
          for (const sl of stepsW) {
            st(MGRAY); fn('normal', 8); cy += txt(sl, cx + 10, cy, 8) + 3;
          }
        }

        y += cardH + 8;
      }

      // Recommendations
      if (report.recommendations?.length) {
        sectionBar('RECOMMENDATIONS');
        y += 8;
        report.recommendations.forEach((rec: string, i: number) => {
          fn('normal', 9); const rW = wrap(rec, CW - 28);
          const rH = th(rW.length, 9) + 8;
          ensure(rH + 4);
          sf(TEAL); doc.circle(ML + 9, y + rH / 2, 7, 'F');
          st(WHITE); fn('bold', 7); doc.text(String(i + 1), ML + 9, y + rH / 2 + 2.5, { align: 'center' });
          st(LGRAY); fn('normal', 9); txt(rW, ML + 22, y + 4, 9);
          y += rH + 6;
        });
      }

      // Corvus final word
      if (report.corvus_summary) {
        y += 10;
        fn('italic', 9); const fwW = wrap(`\u201C${report.corvus_summary}\u201D`, CW - 24);
        const fwH = th(fwW.length, 9) + 28;
        ensure(fwH + 8);
        sf(NAVYL); doc.rect(ML, y, CW, fwH, 'F');
        sf(GOLD);  doc.rect(ML, y, 3, fwH, 'F');
        st(GOLD);  fn('bold', 7);   txt('CORVUS\u2019 FINAL WORD', ML + 10, y + 8, 7);
        st(LGRAY); fn('italic', 9); txt(fwW, ML + 10, y + 18, 9);
        y += fwH + 14;
      }

      // Corvus chat callout
      const CALLOUT_H = 62;
      ensure(CALLOUT_H + 10);
      sf(NAVY); doc.roundedRect(ML, y, CW, CALLOUT_H, 5, 5, 'F');
      sd(TEAL); doc.setLineWidth(0.5); doc.roundedRect(ML, y, CW, CALLOUT_H, 5, 5, 'S');
      sd(TEAL); doc.setLineWidth(3); doc.line(ML, y + 5, ML, y + CALLOUT_H - 5);
      st(CYAN); fn('bold', 7); txt('QUESTIONS ABOUT THIS REPORT?', ML + 10, y + 14, 7);
      st(WHITE); fn('normal', 7.5);
      txt('Have questions? Open the Ask Corvus tab in your dashboard.', ML + 10, y + 26, 7.5);
      txt('Corvus has full context on this report and can answer any follow-up', ML + 10, y + 37, 7.5);
      txt('questions about your specific findings and exactly how to fix them.', ML + 10, y + 48, 7.5);
      st(CYAN); fn('bold', 7.5); txt('oldcrowswireless.com', ML + 10, y + 60, 7.5);
      y += CALLOUT_H + 10;

      // Certification
      const CERT_H = 74;
      ensure(CERT_H + 10);
      sf(NAVY); doc.rect(ML, y, CW, CERT_H, 'F');
      sd(TEAL); doc.setLineWidth(0.8); doc.roundedRect(ML, y, CW, CERT_H, 4, 4);
      sf(TEAL); doc.rect(ML, y, 3, CERT_H, 'F');
      let sealW = 0;
      if (pdfLogos.ocws) {
        const SEAL_H = 42;
        sealW = Math.round(SEAL_H * pdfLogos.ocwsAspect);
        doc.addImage(pdfLogos.ocws, 'PNG', ML + 10, y + (CERT_H - SEAL_H) / 2, sealW, SEAL_H);
      }
      const certX = ML + 10 + sealW + 12;
      st(CYAN);  fn('bold',   7);  txt('CERTIFICATION', certX, y + 10, 7);
      st(WHITE); fn('bold',  11);  txt('Joshua Turner', certX, y + 22, 11);
      st(MGRAY); fn('normal', 9);  txt('Managing Member  \u00B7  Old Crows Wireless Solutions LLC', certX, y + 37, 9);
      st(CYAN);  fn('normal', 9);  txt('17 Years U.S. Navy Electronic Warfare Experience', certX, y + 50, 9);
      st(GOLD);  fn('normal', 8);  txt(`Rendered by Crow\u2019s Eye  \u00B7  ${dateStr}`, certX, y + 63, 8);
      y += CERT_H + 10;

      // Google review callout
      const REVIEW_H = 48;
      ensure(REVIEW_H + 10);
      sf(NAVY); doc.roundedRect(ML, y, CW, REVIEW_H, 5, 5, 'F');
      sd(GOLD); doc.setLineWidth(0.5); doc.roundedRect(ML, y, CW, REVIEW_H, 5, 5, 'S');
      sd(GOLD); doc.setLineWidth(3); doc.line(ML, y + 5, ML, y + REVIEW_H - 5);
      st(GOLD); fn('bold', 7); txt('ENJOYING CROW\u2019S EYE?', ML + 10, y + 14, 7);
      st(WHITE); fn('normal', 7.5);
      txt('Leave us a Google review \u2014 it helps other small businesses find Corvus.', ML + 10, y + 26, 7.5);
      txt('It takes 30 seconds and means everything to a small business.', ML + 10, y + 37, 7.5);
      const reviewUrl = 'https://g.page/r/CZBz3UO1fcs0EBM/review';
      st(CYAN); fn('bold', 7.5); txt(reviewUrl, ML + 10, y + 48, 7.5);
      doc.link(ML + 10, y + 42, CW - 20, 10, { url: reviewUrl });
      y += REVIEW_H + 10;

      drawFooter();

      const safeName = (report.clientName || 'Client').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, ' ');
      const fileDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      doc.save(`WiFi Health Report - ${safeName} - ${fileDate}.pdf`);
    } finally {
      setPdfGenerating(false);
    }
  };

  const resetScan = () => {
    setReport(null);
    setError(null);
    setSignalListFile(null);
    setGhz24File(null);
    setGhz5File(null);
    setReckoningLocations([{ id: 1, name: '', signalListFile: null, ghz24File: null, ghz5File: null }]);
  };

  // File upload row
  const FileUploadSlot = ({
    label,
    required,
    file,
    onChange,
  }: {
    label: string;
    required?: boolean;
    file: File | null;
    onChange: (f: File | null) => void;
  }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>}
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#0D1520',
        border: `1px solid ${file ? 'rgba(34,214,220,0.4)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 8,
        padding: '8px 12px',
      }}>
        <label style={{
          display: 'inline-block',
          background: 'rgba(34,214,220,0.12)',
          border: '1px solid rgba(34,214,220,0.3)',
          borderRadius: 6,
          padding: '5px 12px',
          color: '#22D6DC',
          fontFamily: 'monospace',
          fontSize: '0.7rem',
          cursor: 'pointer',
          letterSpacing: '0.08em',
          flexShrink: 0,
        }}>
          {file ? 'Change' : 'Upload'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
        <span style={{
          color: file ? '#22D6DC' : 'rgba(244,246,248,0.35)',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {file ? file.name : 'No file selected'}
        </span>
        {file && (
          <button
            onClick={() => onChange(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'rgba(244,246,248,0.4)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '0 4px',
              flexShrink: 0,
            }}
            aria-label="Remove file"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ color: '#F4F6F8', fontFamily: 'monospace' }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #1A2332', paddingBottom: '0' }}>
        {[
          { id: 'verdict', label: "Crow's Eye" },
          ...(isMurderOrVip ? [{ id: 'design-brief', label: 'Design Brief' }] : []),
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'verdict' | 'design-brief')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', fontSize: '13px', fontFamily: 'Share Tech Mono, monospace',
              letterSpacing: '0.05em', color: activeTab === tab.id ? '#22D6DC' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #22D6DC' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'design-brief' && (
        <DesignBriefTab subscriptionCode={code} tier={tier} />
      )}

      {activeTab === 'verdict' && (
      <>

      {/* Credits display */}
      <div style={{
        background: isVIP ? 'rgba(216,172,50,0.06)' : 'rgba(34,214,220,0.04)',
        border: isVIP ? '1px solid rgba(216,172,50,0.2)' : '1px solid rgba(34,214,220,0.15)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '3rem',
            color: isVIP ? '#D8AC32' : '#22D6DC',
            lineHeight: 1,
            fontWeight: 700,
          }}>
            {isVIP ? '∞' : creditsRemaining}
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.55rem',
            color: '#888888',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            {mode === 'verdict' ? 'WiFi Health Report Credits' : `Whole-Home Survey Credits (${size})`}
          </div>
        </div>

        {mode === 'reckoning' && !isVIP && (
          <div style={{ display: 'flex', gap: 16 }}>
            {(['small', 'standard', 'commercial'] as const).map(sz => (
              <div key={sz} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '1.4rem',
                  color: reckoningCredits[sz] > 0 ? '#22D6DC' : 'rgba(244,246,248,0.3)',
                  fontWeight: 700,
                  lineHeight: 1,
                }}>
                  {reckoningCredits[sz]}
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.5rem',
                  color: '#888888',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}>
                  {sz}
                </div>
              </div>
            ))}
          </div>
        )}

        {isVIP && (
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.6rem',
            color: '#D8AC32',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            VIP · Unlimited
          </div>
        )}
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        background: 'rgba(13,21,32,0.6)',
        border: '1px solid rgba(34,214,220,0.15)',
        borderRadius: 10,
        padding: 6,
      }}>
        {(['verdict', 'reckoning'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 7,
              border: mode === m ? '1px solid rgba(34,214,220,0.3)' : 'none',
              background: mode === m ? 'rgba(34,214,220,0.15)' : 'transparent',
              color: mode === m ? '#22D6DC' : 'rgba(244,246,248,0.5)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease',
            }}
          >
            {m === 'verdict' ? 'WiFi Health Report' : 'Whole-Home Survey'}
          </button>
        ))}
      </div>

      {/* Reckoning size selector */}
      {mode === 'reckoning' && (
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Whole-Home Survey Size</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {([
              { key: 'small', label: 'Small', desc: '1–5 locations', always: true },
              { key: 'standard', label: 'Standard', desc: '6–15 locations', always: false },
              { key: 'commercial', label: 'Commercial', desc: '16+ locations', always: false },
              { key: 'pro', label: 'Pro Certified', desc: 'Joshua certifies every scan', always: true },
            ] as { key: 'small'|'standard'|'commercial'|'pro'; label: string; desc: string; always: boolean }[]).map(opt => {
              const isAvailable = opt.always || canUseStandardOrCommercial;
              const isSelected = size === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => isAvailable && setSize(opt.key)}
                  disabled={!isAvailable}
                  style={{
                    flex: '1 1 120px',
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: isSelected
                      ? '1px solid rgba(34,214,220,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected
                      ? 'rgba(34,214,220,0.12)'
                      : isAvailable
                        ? 'rgba(13,21,32,0.6)'
                        : 'rgba(13,21,32,0.3)',
                    color: isSelected
                      ? '#22D6DC'
                      : isAvailable
                        ? 'rgba(244,246,248,0.7)'
                        : 'rgba(244,246,248,0.2)',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>{opt.desc}</div>
                  {!isAvailable && (
                    <div style={{ fontSize: '0.55rem', color: '#888', marginTop: 2 }}>Flock+</div>
                  )}
                </button>
              );
            })}
          </div>

          {size === 'pro' && (
            <div style={{
              marginTop: 10,
              background: 'rgba(216,172,50,0.06)',
              border: '1px solid rgba(216,172,50,0.2)',
              borderRadius: 8,
              padding: '10px 14px',
              color: 'rgba(244,246,248,0.6)',
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              lineHeight: 1.5,
            }}>
              Pro Certified Whole-Home Survey includes professional review and certification by an OCWS-certified technician.
              An OCWS team member will contact you to schedule your Pro-level assessment.
            </div>
          )}

          {/* Hybrid Reckoning toggle — VIP, flock, murder only */}
          {(isVIP || ['flock', 'murder', 'vip', 'full'].includes(tier)) && size !== 'pro' && (
            <div style={{
              marginTop: 12,
              background: isHybrid ? 'rgba(34,214,220,0.08)' : 'rgba(13,21,32,0.4)',
              border: isHybrid ? '1px solid rgba(34,214,220,0.3)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              cursor: 'pointer',
            }}
            onClick={() => setIsHybrid(h => !h)}
            >
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: isHybrid ? '#22D6DC' : 'rgba(244,246,248,0.7)', fontWeight: 700, letterSpacing: '0.06em' }}>
                  Hybrid Whole-Home Survey
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#888', marginTop: 2 }}>
                  Cross-structure analysis — multiple buildings, mixed environments
                </div>
              </div>
              <div style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: isHybrid ? '#22D6DC' : 'rgba(255,255,255,0.12)',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute',
                  top: 3,
                  left: isHybrid ? 19 : 3,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: isHybrid ? '#0D1520' : 'rgba(244,246,248,0.5)',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* App download prompt */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={toggleInstructions}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'rgba(34,214,220,0.7)',
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            padding: 0,
          }}
        >
          <span style={{
            display: 'inline-block',
            transform: showInstructions ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}>▶</span>
          How to get Crow&apos;s Eye
        </button>

        {showInstructions && (
          <div style={{ marginTop: 10, background: 'rgba(13,21,32,0.7)', border: '1px solid rgba(34,214,220,0.15)', borderRadius: 8, padding: '14px 16px' }}>
            <p style={{ color: 'rgba(244,246,248,0.7)', fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.7, margin: '0 0 12px' }}>
              Download Crow&apos;s Eye on Android to scan your network. The app handles everything automatically.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.oldcrowswireless.crowseye"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#000', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, padding: '8px 14px', textDecoration: 'none', color: '#fff',
                fontSize: '0.75rem', fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M2 3.27L12.73 12L2 20.73V3.27Z" fill="#4285F4" />
                <path d="M2 3.27L16.5 7.5L12.73 12L2 3.27Z" fill="#EA4335" />
                <path d="M2 20.73L12.73 12L16.5 16.5L2 20.73Z" fill="#FBBC04" />
                <path d="M16.5 7.5L22 12L16.5 16.5L12.73 12L16.5 7.5Z" fill="#34A853" />
              </svg>
              Download on Google Play
            </a>
          </div>
        )}
      </div>

      {/* Show form only if no report yet and not processing */}
      {!report && !isProcessing && (
        <>
          {/* Intake form */}
          <div style={{
            background: 'rgba(13,21,32,0.5)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            padding: '18px 16px',
            marginBottom: 20,
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.6rem',
              color: '#888',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              Client Information
            </div>

            <label style={labelStyle}>Client / Location Name *</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Smith Residence or Main Street Office"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <div>
                <label style={labelStyle}>Street Address</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="123 Main St"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Pensacola"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <div>
                <label style={labelStyle}>State</label>
                <select
                  style={inputStyle}
                  value={state}
                  onChange={e => setState(e.target.value)}
                >
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>ZIP Code</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="32501"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>

            <CorvusTooltip tip="Enter the exact network name your client connects to. Corvus uses this to identify your router's make and model." position="right">
              <label style={labelStyle}>Client's WiFi Network Name</label>
            </CorvusTooltip>
            {lockedSSID && (
              <div style={{ fontSize: '11px', color: '#22D6DC', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace' }}>
                🔒 Network locked by team lead: {lockedSSID}
              </div>
            )}
            <input
              style={{ ...inputStyle, ...(lockedSSID ? { opacity: 0.7, cursor: 'not-allowed', borderColor: 'rgba(34,214,220,0.4)' } : {}) }}
              type="text"
              placeholder="e.g. Smith_Home_WiFi or NETGEAR_5G"
              value={ssid}
              onChange={e => !lockedSSID ? setSsid(e.target.value) : undefined}
              readOnly={!!lockedSSID}
            />

            <div style={{ marginBottom: 10 }}>
              <label style={{ ...labelStyle, marginBottom: 6 }}>
                Client Complaints &amp; Symptoms
                <span style={{
                  display: 'block',
                  fontFamily: 'sans-serif',
                  fontSize: '0.7rem',
                  color: '#888888',
                  letterSpacing: 0,
                  textTransform: 'none',
                  fontWeight: 'normal',
                  marginTop: 2,
                }}>
                  What is the client experiencing? Describe the problem in their words.
                </span>
              </label>
              <textarea
                placeholder="e.g. Wi-Fi drops every evening around 7pm · Can't get signal in the back office · POS system disconnects during transactions · Dead zone near the conference room..."
                value={clientComplaints}
                onChange={e => setClientComplaints(e.target.value)}
                rows={4}
                autoComplete="off"
                autoCorrect="off"
                style={{
                  width: '100%',
                  background: 'rgba(13,21,32,0.8)',
                  border: '1px solid rgba(34,214,220,0.15)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  color: '#F4F6F8',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 16,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  minHeight: 80,
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(34,214,220,0.4)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(34,214,220,0.15)'; }}
              />
              <div style={{ fontSize: '0.65rem', color: '#888888', marginTop: 4, fontStyle: 'italic' }}>
                The more detail you provide, the more targeted Corvus&rsquo; analysis will be.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <div>
                <label style={labelStyle}>Environment</label>
                <select
                  style={inputStyle}
                  value={environment}
                  onChange={e => setEnvironment(e.target.value)}
                >
                  {ENVIRONMENTS.map(env => (
                    <option key={env.value} value={env.value}>{env.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location Type</label>
                <select
                  style={inputStyle}
                  value={locationType}
                  onChange={e => setLocationType(e.target.value)}
                >
                  {LOCATION_TYPES.map(lt => (
                    <option key={lt.value} value={lt.value}>{lt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={{ ...labelStyle, marginTop: 4 }}>
              Client IT Comfort Level
            </label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[
                { n: 1, label: 'Just fix it' },
                { n: 2, label: 'Basic' },
                { n: 3, label: 'Technical' },
                { n: 4, label: 'IT Pro' },
                { n: 5, label: 'Network Pro' },
              ].map(lv => (
                <button
                  key={lv.n}
                  onClick={() => setComfortLevel(lv.n)}
                  title={lv.label}
                  style={{
                    flex: 1,
                    padding: '7px 4px',
                    borderRadius: 7,
                    border: comfortLevel === lv.n
                      ? '1px solid rgba(34,214,220,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: comfortLevel === lv.n
                      ? 'rgba(34,214,220,0.15)'
                      : 'rgba(13,21,32,0.6)',
                    color: comfortLevel === lv.n ? '#22D6DC' : 'rgba(244,246,248,0.5)',
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{lv.n}</div>
                  <div style={{ fontSize: '0.5rem', opacity: 0.8, marginTop: 1 }}>{lv.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload slots — single location (Verdict or Reckoning Small) */}
          {!isMultiLocation && (
            <div style={{
              background: 'rgba(13,21,32,0.5)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '18px 16px',
              marginBottom: 20,
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                color: '#888',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}>
                Screenshots
              </div>
              <CorvusTooltip tip="Required. Use Crow's Eye on Android to scan, then upload the scan data here." position="right">
                <FileUploadSlot
                  label="WiFi Scan Data (required)"
                  required
                  file={signalListFile}
                  onChange={setSignalListFile}
                />
              </CorvusTooltip>
              <CorvusTooltip tip="Optional but recommended. 2.4 GHz channel scan from Crow's Eye." position="right">
                <FileUploadSlot
                  label="2.4 GHz Scan (optional)"
                  file={ghz24File}
                  onChange={setGhz24File}
                />
              </CorvusTooltip>
              <CorvusTooltip tip="Optional but recommended. 5 GHz channel scan from Crow's Eye." position="right">
                <FileUploadSlot
                  label="5 GHz Scan (optional)"
                  file={ghz5File}
                  onChange={setGhz5File}
                />
              </CorvusTooltip>
            </div>
          )}

          {/* Multi-location upload cards (Reckoning Standard / Commercial) */}
          {isMultiLocation && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#D8AC32', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Scan Locations ({reckoningLocations.length} of {getMaxLocations()})
                </div>
                <button
                  onClick={addLocation}
                  disabled={reckoningLocations.length >= getMaxLocations()}
                  style={{
                    padding: '5px 14px',
                    background: 'rgba(34,214,220,0.08)',
                    border: '1px solid rgba(34,214,220,0.2)',
                    borderRadius: 6,
                    color: reckoningLocations.length >= getMaxLocations() ? 'rgba(34,214,220,0.3)' : '#22D6DC',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    cursor: reckoningLocations.length >= getMaxLocations() ? 'not-allowed' : 'pointer',
                  }}
                >
                  + Add Location
                </button>
              </div>

              {reckoningLocations.map((loc, index) => (
                <div key={loc.id} style={{
                  background: 'rgba(13,21,32,0.5)',
                  border: '1px solid rgba(34,214,220,0.15)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#22D6DC', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      Location {index + 1}
                    </div>
                    {reckoningLocations.length > 1 && (
                      <button
                        onClick={() => removeLocation(loc.id)}
                        style={{ background: 'transparent', border: 'none', color: '#e05555', fontFamily: 'monospace', fontSize: '0.65rem', cursor: 'pointer', padding: '2px 6px' }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Location name (e.g. Main Office, Floor 2...)`}
                    value={loc.name}
                    onChange={e => updateLocation(loc.id, 'name', e.target.value)}
                    style={{ ...inputStyle, marginBottom: 10, fontSize: 16 }}
                    autoComplete="off"
                  />
                  <FileUploadSlot
                    label="WiFi Scan Data (required)"
                    required
                    file={loc.signalListFile}
                    onChange={f => updateLocation(loc.id, 'signalListFile', f)}
                  />
                  <FileUploadSlot
                    label="2.4 GHz Scan (optional)"
                    file={loc.ghz24File}
                    onChange={f => updateLocation(loc.id, 'ghz24File', f)}
                  />
                  <FileUploadSlot
                    label="5 GHz Scan (optional)"
                    file={loc.ghz5File}
                    onChange={f => updateLocation(loc.id, 'ghz5File', f)}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#888', letterSpacing: '0.08em' }}>
                  {reckoningLocations.filter(l => l.signalListFile).length} of {reckoningLocations.length} location{reckoningLocations.length !== 1 ? 's' : ''} ready
                </div>
                {reckoningLocations.length < getMaxLocations() && (
                  <button
                    onClick={addLocation}
                    style={{ background: 'transparent', border: '1px solid rgba(34,214,220,0.15)', borderRadius: 6, color: '#888', fontFamily: 'monospace', fontSize: '0.6rem', padding: '4px 12px', cursor: 'pointer' }}
                  >
                    + Add another location
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#f87171',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Run Scan button */}
          {size !== 'pro' && (
            <button
              onClick={handleRunScan}
              disabled={!clientName.trim() || (isMultiLocation ? reckoningLocations.filter(l => l.signalListFile).length === 0 : !signalListFile)}
              style={{
                width: '100%',
                padding: '14px 0',
                background: (!clientName.trim() || (isMultiLocation ? reckoningLocations.filter(l => l.signalListFile).length === 0 : !signalListFile))
                  ? 'rgba(34,214,220,0.15)'
                  : 'linear-gradient(135deg, #22D6DC 0%, #00A8B0 100%)',
                border: 'none',
                borderRadius: 10,
                color: (!clientName.trim() || (isMultiLocation ? reckoningLocations.filter(l => l.signalListFile).length === 0 : !signalListFile)) ? 'rgba(34,214,220,0.4)' : '#0D1520',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: (!clientName.trim() || (isMultiLocation ? reckoningLocations.filter(l => l.signalListFile).length === 0 : !signalListFile)) ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {mode === 'verdict' ? '▶ Run WiFi Health Report' : `▶ Run Whole-Home Survey (${size.charAt(0).toUpperCase() + size.slice(1)})`}
            </button>
          )}

          {size === 'pro' && (
            <button
              onClick={() => window.location.href = 'mailto:info@oldcrowswireless.com?subject=Pro Certified Whole-Home Survey Request'}
              style={{
                width: '100%',
                padding: '14px 0',
                background: 'linear-gradient(135deg, #D8AC32 0%, #9A7520 100%)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Request Pro Certified Assessment
            </button>
          )}
        </>
      )}

      {/* Processing panel */}
      {isProcessing && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(13,21,32,0.8)', border: '1px solid rgba(34,214,220,0.25)', borderRadius: '12px', padding: '20px', margin: '20px 0' }}>
          <img src="/corvus_still.png" style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0 }} alt="Corvus" />
          <div>
            <div style={{ color: '#22D6DC', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', marginBottom: '4px' }}>CORVUS · ANALYZING</div>
            <div style={{ color: '#F4F6F8', fontSize: '0.85rem', lineHeight: 1.5 }}>{processingLine}</div>
          </div>
        </div>
      )}

      {/* Report display */}
      {report && !isProcessing && (
        <div>
          {/* Report header */}
          <div style={{
            background: 'rgba(34,214,220,0.06)',
            border: '1px solid rgba(34,214,220,0.2)',
            borderRadius: 12,
            padding: '20px',
            marginBottom: 20,
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.55rem',
              color: '#888',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Corvus · Analysis Complete
            </div>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.7rem',
              color: 'rgba(34,214,220,0.5)',
              marginBottom: 12,
            }}>
              {report.reportId}
            </div>
            <div style={{ fontSize: '0.95rem', color: '#F4F6F8', marginBottom: 4 }}>
              <strong>{report.clientName}</strong>
              {report.ssid && <span style={{ color: '#22D6DC', marginLeft: 8 }}>· {report.ssid}</span>}
            </div>
            {report.address && (
              <div style={{ fontSize: '0.75rem', color: 'rgba(244,246,248,0.5)', marginBottom: 12 }}>
                {report.address}
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
              {[
                { label: 'Problems', value: report.problems_found, color: '#F4F6F8' },
                { label: 'Critical', value: report.critical_count, color: '#f87171' },
                { label: 'Warnings', value: report.warning_count, color: '#fbbf24' },
                { label: 'Good', value: report.good_count, color: '#4ade80' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', minWidth: 50 }}>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '1.8rem',
                    color: stat.color,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.5rem',
                    color: '#888',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Corvus opening */}
            {report.corvus_opening && (
              <div style={{
                marginTop: 16,
                padding: '12px 14px',
                background: 'rgba(34,214,220,0.04)',
                border: '1px solid rgba(34,214,220,0.1)',
                borderRadius: 8,
                color: 'rgba(244,246,248,0.85)',
                fontStyle: 'italic',
                fontSize: '0.82rem',
                lineHeight: 1.6,
              }}>
                "{report.corvus_opening}"
              </div>
            )}
          </div>

          {/* Findings */}
          {report.findings && report.findings.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                color: '#888',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Findings
              </div>

              {/* Collapse affordance: hide native marker, rotate our chevron on open */}
              <style>{`
                details.ce-finding > summary { list-style: none; }
                details.ce-finding > summary::-webkit-details-marker { display: none; }
                details.ce-finding > summary .ce-chev { transition: transform 0.15s ease; }
                details.ce-finding[open] > summary .ce-chev { transform: rotate(180deg); }
              `}</style>

              {report.findings.map((finding, i) => {
                // CRITICAL findings start expanded; everything else collapses to a headline.
                const startOpen = finding.severity?.toUpperCase() === 'CRITICAL';
                return (
                <details key={i} className="ce-finding" style={getSeverityStyle(finding.severity)} {...(startOpen ? { open: true } : {})}>
                  <summary style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.55rem',
                      letterSpacing: '0.1em',
                      color: getSeverityColor(finding.severity),
                      background: 'rgba(0,0,0,0.2)',
                      border: `1px solid ${getSeverityColor(finding.severity)}40`,
                      borderRadius: 4,
                      padding: '2px 6px',
                      flexShrink: 0,
                    }}>
                      {finding.severity?.toUpperCase()}
                    </span>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#F4F6F8',
                      flex: 1,
                    }}>
                      {finding.title}
                    </div>
                    <span className="ce-chev" style={{
                      color: 'rgba(34,214,220,0.6)',
                      fontSize: '0.7rem',
                      flexShrink: 0,
                    }}>▾</span>
                  </summary>

                  <div style={{ marginTop: 10 }}>
                    {finding.description && (
                      <p style={{
                        margin: '0 0 8px',
                        color: 'rgba(244,246,248,0.75)',
                        fontSize: '0.8rem',
                        lineHeight: 1.6,
                      }}>
                        {finding.description}
                      </p>
                    )}

                    {finding.fix_summary && (
                      <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(34,214,220,0.15)',
                        borderRadius: 6,
                        padding: '8px 10px',
                        marginBottom: 8,
                      }}>
                        <span style={{ color: '#22D6DC', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.1em' }}>FIX: </span>
                        <span style={{ color: 'rgba(244,246,248,0.85)', fontSize: '0.78rem' }}>{finding.fix_summary}</span>
                      </div>
                    )}

                    {finding.steps && finding.steps.length > 0 && (
                      STEPS_GATED ? (
                        /* Paywall returns after the 1,000-scan promo: blurred preview + unlock CTA */
                        <div style={{
                          marginTop: 6,
                          padding: '12px 12px 14px',
                          background: 'rgba(0,0,0,0.25)',
                          border: '1px dashed rgba(216,172,50,0.4)',
                          borderRadius: 8,
                        }}>
                          <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                            <div style={{ height: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 4, marginBottom: 8, width: '100%' }} />
                            <div style={{ height: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 4, marginBottom: 8, width: '85%' }} />
                            <div style={{ height: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 4, width: '65%' }} />
                          </div>
                          <div style={{ marginTop: 10, color: '#D8AC32', fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                            🔒 Unlock the {finding.steps.length}-step fix
                          </div>
                        </div>
                      ) : (
                        <details style={{ marginTop: 6 }}>
                          <summary style={{
                            cursor: 'pointer',
                            color: 'rgba(34,214,220,0.7)',
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            letterSpacing: '0.08em',
                            userSelect: 'none',
                            listStyle: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}>
                            <span>▶</span> Step-by-step instructions ({finding.steps.length} steps)
                          </summary>
                          <ol style={{
                            margin: '8px 0 0',
                            paddingLeft: 20,
                            color: 'rgba(244,246,248,0.7)',
                            fontSize: '0.75rem',
                            lineHeight: 1.7,
                          }}>
                            {finding.steps.map((step, si) => (
                              <li key={si} style={{ marginBottom: 4 }}>{step}</li>
                            ))}
                          </ol>
                          {finding.login_disclaimer && (
                            <div style={{
                              marginTop: 8,
                              padding: '6px 10px',
                              background: 'rgba(234,179,8,0.06)',
                              border: '1px solid rgba(234,179,8,0.15)',
                              borderRadius: 6,
                              color: 'rgba(244,246,248,0.5)',
                              fontSize: '0.65rem',
                              lineHeight: 1.5,
                            }}>
                              {finding.login_disclaimer}
                            </div>
                          )}
                        </details>
                      )
                    )}
                  </div>
                </details>
                );
              })}
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div style={{
              background: 'rgba(13,21,32,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '16px 18px',
              marginBottom: 20,
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                color: '#888',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Recommendations
              </div>
              <ol style={{
                margin: 0,
                paddingLeft: 20,
                color: 'rgba(244,246,248,0.8)',
                fontSize: '0.8rem',
                lineHeight: 1.8,
              }}>
                {report.recommendations.map((rec, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{rec}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Corvus chat callout */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            background: 'rgba(13,21,32,0.8)',
            border: '1px solid rgba(34,214,220,0.25)',
            borderRadius: '12px',
            padding: '18px 20px',
            marginBottom: 20,
          }}>
            <img
              src="/corvus_still.png"
              style={{ width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0 }}
              alt="Corvus"
            />
            <div>
              <div style={{ color: '#22D6DC', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', marginBottom: 4 }}>
                CORVUS · AVAILABLE
              </div>
              <div style={{ color: '#F4F6F8', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 10 }}>
                Have questions about this report? I can walk you through any finding, explain what it means for your client, or help you plan your remediation approach.
              </div>
              {navigateToChat && (
                <button
                  onClick={handleAskCorvus}
                  style={{
                    background: 'rgba(34,214,220,0.15)',
                    border: '1px solid rgba(34,214,220,0.3)',
                    borderRadius: 7,
                    padding: '8px 14px',
                    color: '#22D6DC',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                  }}
                >
                  Ask Corvus about this report →
                </button>
              )}
            </div>
          </div>

          {/* Post-report action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              style={{
                flex: '1 1 160px',
                padding: '11px 16px',
                background: 'rgba(34,214,220,0.12)',
                border: '1px solid rgba(34,214,220,0.3)',
                borderRadius: 9,
                color: '#22D6DC',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                cursor: pdfGenerating ? 'default' : 'pointer',
                letterSpacing: '0.08em',
                opacity: pdfGenerating ? 0.6 : 1,
              }}
            >
              {pdfGenerating ? 'Generating PDF...' : '⬇ Download PDF Report'}
            </button>
            {navigateToChat && (
              <button
                onClick={handleAskCorvus}
                style={{
                  flex: '1 1 160px',
                  padding: '11px 16px',
                  background: 'rgba(13,21,32,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9,
                  color: 'rgba(244,246,248,0.7)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                Ask Corvus about this report
              </button>
            )}
            <button
              onClick={resetScan}
              style={{
                flex: '1 1 140px',
                padding: '11px 16px',
                background: 'rgba(13,21,32,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9,
                color: 'rgba(244,246,248,0.45)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
                letterSpacing: '0.08em',
              }}
            >
              + New Scan
            </button>
          </div>

          {/* Subscription upsell for one-time purchasers */}
          {isOneTimePurchaser && (
            <div style={{
              background: 'rgba(13,21,32,0.9)',
              border: '1px solid rgba(34,214,220,0.25)',
              borderRadius: 12,
              padding: 24,
              marginTop: 24,
            }}>
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: 'rgba(34,214,220,0.05)',
                border: '1px solid rgba(34,214,220,0.15)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
              }}>
                <img
                  src="/corvus_still.png"
                  style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}
                  alt="Corvus"
                />
                <div>
                  <div style={{ color: '#22D6DC', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: 4 }}>
                    CORVUS
                  </div>
                  <div style={{ color: 'rgba(244,246,248,0.85)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                    You just ran your first scan. Subscribe and get regular access — monthly WiFi Health Reports, Whole-Home Surveys, and direct access to me whenever you need it.
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}>
                {[
                  { tier: 'nest', name: 'Nest', price: '$29/mo', features: ['3 WiFi Health Reports/mo', '1 Small Whole-Home Survey', '1 seat'] },
                  { tier: 'flock', name: 'Flock', price: '$79/mo', features: ['15 WiFi Health Reports/mo', 'Standard + Commercial', '5 seats'], featured: true },
                  { tier: 'murder', name: 'Murder', price: '$199/mo', features: ['Unlimited WiFi Health Reports', 'All Whole-Home Surveys', '15 seats'] },
                ].map(plan => (
                  <div
                    key={plan.tier}
                    style={{
                      background: plan.featured ? 'rgba(34,214,220,0.05)' : '#1A2332',
                      border: plan.featured ? '1px solid rgba(34,214,220,0.35)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {plan.featured && (
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.5rem',
                        color: '#22D6DC',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                      }}>
                        Most Popular
                      </div>
                    )}
                    <div style={{ color: '#F4F6F8', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                      {plan.name}
                    </div>
                    <div style={{ color: plan.featured ? '#22D6DC' : 'rgba(244,246,248,0.6)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {plan.price}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 14, color: 'rgba(244,246,248,0.6)', fontSize: '0.7rem', lineHeight: 1.8 }}>
                      {plan.features.map((f, fi) => (
                        <li key={fi}>{f}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        try { sessionStorage.setItem('corvus_presub_report', report.reportId); } catch {}
                        window.location.href = `/#pricing?highlight=${plan.tier}`;
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#22D6DC',
                        color: '#0D1520',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: 'auto',
                        fontFamily: 'monospace',
                      }}
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Annual upsell for monthly subscribers */}
          {isMonthlySubscriber && (
            <div style={{
              background: 'rgba(13,21,32,0.9)',
              border: '1px solid rgba(216,172,50,0.2)',
              borderRadius: 12,
              padding: 24,
              marginTop: 24,
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                color: '#D8AC32',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Save with Annual
              </div>
              <p style={{
                color: 'rgba(244,246,248,0.75)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                margin: '0 0 14px',
              }}>
                Switch to an annual plan and save 2 months — pay for 10, get 12. Same credits, same access, lower cost.
              </p>
              <button
                onClick={() => window.location.href = `/#pricing?annual=true&tier=${tier}`}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(216,172,50,0.15)',
                  border: '1px solid rgba(216,172,50,0.3)',
                  borderRadius: 8,
                  color: '#D8AC32',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                See Annual Plans →
              </button>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}
