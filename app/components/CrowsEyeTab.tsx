'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CrowsEyeTabProps {
  code: string;
  isVIP: boolean;
  tier: string; // "nest" | "flock" | "murder" | "vip"
  creditsRemaining: number;
  reckoningCredits: { small: number; standard: number; commercial: number };
  onScanComplete?: () => void;
  navigateToChat?: () => void;
}

const PROCESSING_LINES = [
  'Rolling Perception on your RF environment...',
  'Identifying all networks in range... I see you, channel 11 squatters...',
  'Cross-referencing MAC addresses... someone in this environment needs to be removed...',
  'Analyzing channel congestion... as Proverbs 14:4 says, where there are no oxen the manger is clean... your manger is not clean...',
  'Mapping interference patterns... this is a dungeon crawl and I am reading the room...',
  'Calculating signal strength deltas... Blastoise uses Surf... it\'s super effective...',
  'Reviewing vendor configurations... whoever set this up was rolling disadvantage...',
  'Compiling findings... I want to be the very best at diagnosing your network...',
  'Rendering Verdict... natural 20 on the analysis roll...',
  'Doing a full Marauder\'s Map on your network... I see everything...',
  'Mapping every room before we engage... dungeon crawl protocol active...',
  'In the end it doesn\'t even matter... analyzing your RF environment...',
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
}: CrowsEyeTabProps) {
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
        setError(data.error || 'Scan failed. Please try again.');
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
    if (!report) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });

      const margin = 48;
      let y = 60;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 194, 199);
      doc.text("Crow's Eye Wireless Analysis", margin, y);
      y += 28;

      doc.setFontSize(10);
      doc.setTextColor(100, 120, 140);
      doc.text(`Report ID: ${report.reportId}`, margin, y);
      y += 16;
      doc.text(`Generated: ${new Date(report.createdAt).toLocaleString()}`, margin, y);
      y += 28;

      // Client info
      doc.setFontSize(12);
      doc.setTextColor(30, 40, 60);
      doc.text(`Client: ${report.clientName}`, margin, y);
      y += 18;
      if (report.ssid) {
        doc.text(`SSID: ${report.ssid}`, margin, y);
        y += 18;
      }
      if (report.address) {
        doc.text(`Address: ${report.address}`, margin, y);
        y += 18;
      }
      doc.text(`Product: ${report.product}`, margin, y);
      y += 28;

      // Summary
      doc.setFontSize(11);
      doc.setTextColor(50, 60, 80);
      doc.text(`Problems Found: ${report.problems_found}  |  Critical: ${report.critical_count}  |  Warnings: ${report.warning_count}  |  Good: ${report.good_count}`, margin, y);
      y += 28;

      if (report.corvus_opening) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 100);
        const lines = doc.splitTextToSize(report.corvus_opening, 520);
        doc.text(lines, margin, y);
        y += lines.length * 14 + 16;
      }

      // Findings
      doc.setFontSize(14);
      doc.setTextColor(0, 50, 80);
      doc.text('Findings', margin, y);
      y += 20;

      for (const finding of report.findings) {
        const severityColor = finding.severity?.toUpperCase() === 'CRITICAL'
          ? [239, 68, 68]
          : finding.severity?.toUpperCase() === 'WARNING'
            ? [234, 179, 8]
            : [34, 197, 94];
        doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
        doc.setFontSize(10);
        doc.text(`[${finding.severity?.toUpperCase()}]`, margin, y);
        doc.setTextColor(30, 40, 60);
        doc.setFontSize(11);
        doc.text(finding.title || '', margin + 60, y);
        y += 16;

        if (finding.description) {
          doc.setFontSize(9);
          doc.setTextColor(60, 70, 90);
          const descLines = doc.splitTextToSize(finding.description, 500);
          doc.text(descLines, margin + 8, y);
          y += descLines.length * 12 + 8;
        }

        if (finding.fix_summary) {
          doc.setFontSize(9);
          doc.setTextColor(0, 120, 130);
          const fixLines = doc.splitTextToSize(`Fix: ${finding.fix_summary}`, 500);
          doc.text(fixLines, margin + 8, y);
          y += fixLines.length * 12 + 4;
        }

        if (finding.steps && finding.steps.length > 0) {
          doc.setFontSize(8);
          doc.setTextColor(60, 70, 90);
          finding.steps.forEach((step, i) => {
            const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, 490);
            if (y > 720) {
              doc.addPage();
              y = 60;
            }
            doc.text(stepLines, margin + 16, y);
            y += stepLines.length * 11 + 3;
          });
        }

        y += 12;
        if (y > 720) {
          doc.addPage();
          y = 60;
        }
      }

      // Recommendations
      if (report.recommendations && report.recommendations.length > 0) {
        if (y > 650) { doc.addPage(); y = 60; }
        doc.setFontSize(14);
        doc.setTextColor(0, 50, 80);
        doc.text('Recommendations', margin, y);
        y += 20;

        doc.setFontSize(9);
        doc.setTextColor(40, 50, 70);
        report.recommendations.forEach((rec, i) => {
          const recLines = doc.splitTextToSize(`${i + 1}. ${rec}`, 510);
          if (y > 720) { doc.addPage(); y = 60; }
          doc.text(recLines, margin, y);
          y += recLines.length * 12 + 6;
        });
      }

      // Corvus summary
      if (report.corvus_summary) {
        if (y > 650) { doc.addPage(); y = 60; }
        y += 16;
        doc.setFontSize(10);
        doc.setTextColor(0, 120, 130);
        const summaryLines = doc.splitTextToSize(report.corvus_summary, 510);
        doc.text(summaryLines, margin, y);
      }

      const filename = `corvus-report-${report.clientName.replace(/\s+/g, '-').toLowerCase()}-${report.reportId}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
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
        border: `1px solid ${file ? 'rgba(0,194,199,0.4)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 8,
        padding: '8px 12px',
      }}>
        <label style={{
          display: 'inline-block',
          background: 'rgba(0,194,199,0.12)',
          border: '1px solid rgba(0,194,199,0.3)',
          borderRadius: 6,
          padding: '5px 12px',
          color: '#00C2C7',
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
          color: file ? '#00C2C7' : 'rgba(244,246,248,0.35)',
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

      {/* Credits display */}
      <div style={{
        background: isVIP ? 'rgba(184,146,42,0.06)' : 'rgba(0,194,199,0.04)',
        border: isVIP ? '1px solid rgba(184,146,42,0.2)' : '1px solid rgba(0,194,199,0.15)',
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
            color: isVIP ? '#B8922A' : '#00C2C7',
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
            {mode === 'verdict' ? 'Verdict Credits' : `Reckoning Credits (${size})`}
          </div>
        </div>

        {mode === 'reckoning' && !isVIP && (
          <div style={{ display: 'flex', gap: 16 }}>
            {(['small', 'standard', 'commercial'] as const).map(sz => (
              <div key={sz} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '1.4rem',
                  color: reckoningCredits[sz] > 0 ? '#00C2C7' : 'rgba(244,246,248,0.3)',
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
            color: '#B8922A',
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
        border: '1px solid rgba(0,194,199,0.15)',
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
              border: mode === m ? '1px solid rgba(0,194,199,0.3)' : 'none',
              background: mode === m ? 'rgba(0,194,199,0.15)' : 'transparent',
              color: mode === m ? '#00C2C7' : 'rgba(244,246,248,0.5)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease',
            }}
          >
            {m === 'verdict' ? 'Verdict' : 'Reckoning'}
          </button>
        ))}
      </div>

      {/* Reckoning size selector */}
      {mode === 'reckoning' && (
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Reckoning Size</div>
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
                      ? '1px solid rgba(0,194,199,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected
                      ? 'rgba(0,194,199,0.12)'
                      : isAvailable
                        ? 'rgba(13,21,32,0.6)'
                        : 'rgba(13,21,32,0.3)',
                    color: isSelected
                      ? '#00C2C7'
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
              background: 'rgba(184,146,42,0.06)',
              border: '1px solid rgba(184,146,42,0.2)',
              borderRadius: 8,
              padding: '10px 14px',
              color: 'rgba(244,246,248,0.6)',
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              lineHeight: 1.5,
            }}>
              Pro Certified Reckoning includes professional review and certification by an OCWS-certified technician.
              An OCWS team member will contact you to schedule your Pro-level assessment.
            </div>
          )}

          {/* Hybrid Reckoning toggle — VIP, flock, murder only */}
          {(isVIP || ['flock', 'murder', 'vip', 'full'].includes(tier)) && size !== 'pro' && (
            <div style={{
              marginTop: 12,
              background: isHybrid ? 'rgba(0,194,199,0.08)' : 'rgba(13,21,32,0.4)',
              border: isHybrid ? '1px solid rgba(0,194,199,0.3)' : '1px solid rgba(255,255,255,0.08)',
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
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: isHybrid ? '#00C2C7' : 'rgba(244,246,248,0.7)', fontWeight: 700, letterSpacing: '0.06em' }}>
                  Hybrid Reckoning
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#888', marginTop: 2 }}>
                  Cross-structure analysis — multiple buildings, mixed environments
                </div>
              </div>
              <div style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: isHybrid ? '#00C2C7' : 'rgba(255,255,255,0.12)',
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

      {/* Collapsible instructions */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={toggleInstructions}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'rgba(0,194,199,0.7)',
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
          How to prepare your screenshots
        </button>

        {showInstructions && (
          <div style={{
            marginTop: 10,
            background: 'rgba(13,21,32,0.7)',
            border: '1px solid rgba(0,194,199,0.15)',
            borderRadius: 8,
            padding: '14px 16px',
            color: 'rgba(244,246,248,0.7)',
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            lineHeight: 1.7,
          }}>
            <p style={{ margin: '0 0 8px' }}>
              <strong style={{ color: '#00C2C7' }}>Download WiFi Analyzer (open source)</strong> on any Android device.
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <strong style={{ color: '#F4F6F8' }}>Signal List:</strong> Tap the AP List tab — screenshot the full list showing SSIDs, dBm values, channels, and BSSIDs. This is required.
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <strong style={{ color: '#F4F6F8' }}>2.4 GHz Channel Graph:</strong> Tap the Channel Graph tab and select 2.4 GHz. Screenshot the full channel distribution.
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <strong style={{ color: '#F4F6F8' }}>5 GHz Channel Graph:</strong> Same tab, switch to 5 GHz band. Screenshot.
            </p>
            <p style={{ margin: 0, color: 'rgba(244,246,248,0.5)' }}>
              Tip: Stay in the same spot where the Wi-Fi connection matters most — typically where you work or where issues occur.
            </p>
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

            <label style={labelStyle}>Client's Wi-Fi Network Name (SSID)</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Smith_Home_WiFi or NETGEAR_5G"
              value={ssid}
              onChange={e => setSsid(e.target.value)}
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
                  border: '1px solid rgba(0,194,199,0.15)',
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
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,194,199,0.4)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,194,199,0.15)'; }}
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
                      ? '1px solid rgba(0,194,199,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: comfortLevel === lv.n
                      ? 'rgba(0,194,199,0.15)'
                      : 'rgba(13,21,32,0.6)',
                    color: comfortLevel === lv.n ? '#00C2C7' : 'rgba(244,246,248,0.5)',
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
              <FileUploadSlot
                label="Signal List / AP List"
                required
                file={signalListFile}
                onChange={setSignalListFile}
              />
              <FileUploadSlot
                label="2.4 GHz Channel Graph (optional)"
                file={ghz24File}
                onChange={setGhz24File}
              />
              <FileUploadSlot
                label="5 GHz Channel Graph (optional)"
                file={ghz5File}
                onChange={setGhz5File}
              />
            </div>
          )}

          {/* Multi-location upload cards (Reckoning Standard / Commercial) */}
          {isMultiLocation && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#B8922A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Scan Locations ({reckoningLocations.length} of {getMaxLocations()})
                </div>
                <button
                  onClick={addLocation}
                  disabled={reckoningLocations.length >= getMaxLocations()}
                  style={{
                    padding: '5px 14px',
                    background: 'rgba(0,194,199,0.08)',
                    border: '1px solid rgba(0,194,199,0.2)',
                    borderRadius: 6,
                    color: reckoningLocations.length >= getMaxLocations() ? 'rgba(0,194,199,0.3)' : '#00C2C7',
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
                  border: '1px solid rgba(0,194,199,0.15)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#00C2C7', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
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
                    label="Signal List / AP List"
                    required
                    file={loc.signalListFile}
                    onChange={f => updateLocation(loc.id, 'signalListFile', f)}
                  />
                  <FileUploadSlot
                    label="2.4 GHz Channel Graph (optional)"
                    file={loc.ghz24File}
                    onChange={f => updateLocation(loc.id, 'ghz24File', f)}
                  />
                  <FileUploadSlot
                    label="5 GHz Channel Graph (optional)"
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
                    style={{ background: 'transparent', border: '1px solid rgba(0,194,199,0.15)', borderRadius: 6, color: '#888', fontFamily: 'monospace', fontSize: '0.6rem', padding: '4px 12px', cursor: 'pointer' }}
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
                  ? 'rgba(0,194,199,0.15)'
                  : 'linear-gradient(135deg, #00C2C7 0%, #00A8B0 100%)',
                border: 'none',
                borderRadius: 10,
                color: (!clientName.trim() || (isMultiLocation ? reckoningLocations.filter(l => l.signalListFile).length === 0 : !signalListFile)) ? 'rgba(0,194,199,0.4)' : '#0D1520',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: (!clientName.trim() || (isMultiLocation ? reckoningLocations.filter(l => l.signalListFile).length === 0 : !signalListFile)) ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {mode === 'verdict' ? '▶ Run Verdict Scan' : `▶ Run Reckoning (${size.charAt(0).toUpperCase() + size.slice(1)})`}
            </button>
          )}

          {size === 'pro' && (
            <button
              onClick={() => window.location.href = 'mailto:info@oldcrowswireless.com?subject=Pro Certified Reckoning Request'}
              style={{
                width: '100%',
                padding: '14px 0',
                background: 'linear-gradient(135deg, #B8922A 0%, #9A7520 100%)',
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
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(13,21,32,0.8)', border: '1px solid rgba(0,194,199,0.25)', borderRadius: '12px', padding: '20px', margin: '20px 0' }}>
          <img src="/corvus_still.png" style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0 }} alt="Corvus" />
          <div>
            <div style={{ color: '#00C2C7', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', marginBottom: '4px' }}>CORVUS · ANALYZING</div>
            <div style={{ color: '#F4F6F8', fontSize: '0.85rem', lineHeight: 1.5 }}>{processingLine}</div>
          </div>
        </div>
      )}

      {/* Report display */}
      {report && !isProcessing && (
        <div>
          {/* Report header */}
          <div style={{
            background: 'rgba(0,194,199,0.06)',
            border: '1px solid rgba(0,194,199,0.2)',
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
              color: 'rgba(0,194,199,0.5)',
              marginBottom: 12,
            }}>
              {report.reportId}
            </div>
            <div style={{ fontSize: '0.95rem', color: '#F4F6F8', marginBottom: 4 }}>
              <strong>{report.clientName}</strong>
              {report.ssid && <span style={{ color: '#00C2C7', marginLeft: 8 }}>· {report.ssid}</span>}
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
                background: 'rgba(0,194,199,0.04)',
                border: '1px solid rgba(0,194,199,0.1)',
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

              {report.findings.map((finding, i) => (
                <div key={i} style={getSeverityStyle(finding.severity)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
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
                      marginTop: 2,
                    }}>
                      {finding.severity?.toUpperCase()}
                    </span>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#F4F6F8',
                    }}>
                      {finding.title}
                    </div>
                  </div>

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
                      border: '1px solid rgba(0,194,199,0.15)',
                      borderRadius: 6,
                      padding: '8px 10px',
                      marginBottom: 8,
                    }}>
                      <span style={{ color: '#00C2C7', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.1em' }}>FIX: </span>
                      <span style={{ color: 'rgba(244,246,248,0.85)', fontSize: '0.78rem' }}>{finding.fix_summary}</span>
                    </div>
                  )}

                  {finding.steps && finding.steps.length > 0 && (
                    <details style={{ marginTop: 6 }}>
                      <summary style={{
                        cursor: 'pointer',
                        color: 'rgba(0,194,199,0.7)',
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
                  )}
                </div>
              ))}
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
            border: '1px solid rgba(0,194,199,0.25)',
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
              <div style={{ color: '#00C2C7', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', marginBottom: 4 }}>
                CORVUS · AVAILABLE
              </div>
              <div style={{ color: '#F4F6F8', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 10 }}>
                Have questions about this report? I can walk you through any finding, explain what it means for your client, or help you plan your remediation approach.
              </div>
              {navigateToChat && (
                <button
                  onClick={handleAskCorvus}
                  style={{
                    background: 'rgba(0,194,199,0.15)',
                    border: '1px solid rgba(0,194,199,0.3)',
                    borderRadius: 7,
                    padding: '8px 14px',
                    color: '#00C2C7',
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
              style={{
                flex: '1 1 160px',
                padding: '11px 16px',
                background: 'rgba(0,194,199,0.12)',
                border: '1px solid rgba(0,194,199,0.3)',
                borderRadius: 9,
                color: '#00C2C7',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
                letterSpacing: '0.08em',
              }}
            >
              ↓ Download PDF Report
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
              border: '1px solid rgba(0,194,199,0.25)',
              borderRadius: 12,
              padding: 24,
              marginTop: 24,
            }}>
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: 'rgba(0,194,199,0.05)',
                border: '1px solid rgba(0,194,199,0.15)',
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
                  <div style={{ color: '#00C2C7', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: 4 }}>
                    CORVUS
                  </div>
                  <div style={{ color: 'rgba(244,246,248,0.85)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                    You just ran your first scan. Subscribe and get regular access — monthly Verdicts, Reckonings, and direct access to me whenever you need it.
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}>
                {[
                  { tier: 'nest', name: 'Nest', price: '$29/mo', features: ['3 Verdicts/mo', '1 Small Reckoning', '1 seat'] },
                  { tier: 'flock', name: 'Flock', price: '$79/mo', features: ['15 Verdicts/mo', 'Standard + Commercial', '5 seats'], featured: true },
                  { tier: 'murder', name: 'Murder', price: '$199/mo', features: ['Unlimited Verdicts', 'All Reckonings', '15 seats'] },
                ].map(plan => (
                  <div
                    key={plan.tier}
                    style={{
                      background: plan.featured ? 'rgba(0,194,199,0.05)' : '#1A2332',
                      border: plan.featured ? '1px solid rgba(0,194,199,0.35)' : '1px solid rgba(255,255,255,0.08)',
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
                        color: '#00C2C7',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                      }}>
                        Most Popular
                      </div>
                    )}
                    <div style={{ color: '#F4F6F8', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                      {plan.name}
                    </div>
                    <div style={{ color: plan.featured ? '#00C2C7' : 'rgba(244,246,248,0.6)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
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
                        background: '#00C2C7',
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
              border: '1px solid rgba(184,146,42,0.2)',
              borderRadius: 12,
              padding: 24,
              marginTop: 24,
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                color: '#B8922A',
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
                  background: 'rgba(184,146,42,0.15)',
                  border: '1px solid rgba(184,146,42,0.3)',
                  borderRadius: 8,
                  color: '#B8922A',
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
    </div>
  );
}
