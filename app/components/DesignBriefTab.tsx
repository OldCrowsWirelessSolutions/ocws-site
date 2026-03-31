'use client';

import { useState, useRef } from 'react';
import { generateDesignBriefPdf } from '@/lib/designBriefPdf';

interface Props {
  subscriptionCode: string;
  tier: string;
}

interface LocationInfo {
  name: string;
  type: string;
  sqft: string;
  stories: string;
  construction: string;
  notes: string;
}

const LOCATION_TYPES = ['Residential', 'Office', 'Retail', 'Restaurant/QSR', 'Healthcare', 'Education', 'Hospitality', 'Industrial', 'Warehouse', 'Public Safety', 'Government', 'Other'];
const CONSTRUCTION_TYPES = ['Wood Frame', 'Concrete', 'Steel/Metal', 'Brick/Masonry', 'Mixed', 'Unknown'];

export default function DesignBriefTab({ subscriptionCode, tier }: Props) {
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    name: '', type: 'Residential', sqft: '', stories: '1', construction: 'Unknown', notes: ''
  });
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string>('');
  const [signalFile, setSignalFile] = useState<File | null>(null);
  const [ghz24File, setGhz24File] = useState<File | null>(null);
  const [ghz5File, setGhz5File] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'form' | 'results'>('form');

  const floorPlanRef = useRef<HTMLInputElement>(null);

  const isMurderOrVip = ['murder', 'vip'].includes(tier?.toLowerCase());

  if (!isMurderOrVip) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💀</div>
        <div style={{ color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '16px', marginBottom: '8px' }}>
          Murder Tier Required
        </div>
        <div style={{ color: '#888', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
          The Wireless Design Brief is exclusive to Murder and OCWS Pro subscribers. Upgrade to unlock full AP placement analysis and branded design documents.
        </div>
        <a href="/pricing" style={{
          display: 'inline-block', marginTop: '24px', padding: '10px 24px',
          background: '#0D6E7A', color: '#F4F6F8', borderRadius: '6px',
          textDecoration: 'none', fontSize: '14px', fontWeight: 'bold'
        }}>View Upgrade Options</a>
      </div>
    );
  }

  function handleFloorPlan(file: File) {
    setFloorPlanFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFloorPlanPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsText(file);
    });
  }

  async function readFileAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit() {
    if (!locationInfo.name.trim()) {
      setError('Location name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let floorPlanBase64 = '';
      let floorPlanMimeType = 'image/jpeg';
      if (floorPlanFile) {
        const result = await readFileAsBase64(floorPlanFile);
        floorPlanBase64 = result.base64;
        floorPlanMimeType = result.mimeType;
      }

      const scanParts: string[] = [];
      if (signalFile) scanParts.push(`--- Signal List ---\n${await readFileAsText(signalFile)}`);
      if (ghz24File) scanParts.push(`--- 2.4 GHz Scan ---\n${await readFileAsText(ghz24File)}`);
      if (ghz5File) scanParts.push(`--- 5 GHz Scan ---\n${await readFileAsText(ghz5File)}`);
      const scanData = scanParts.join('\n\n');

      const res = await fetch('/api/design-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionCode,
          tier,
          floorPlanBase64,
          floorPlanMimeType,
          scanData,
          locationInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setAnalysis(data.analysis);
      setPhase('results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!analysis) return;
    await generateDesignBriefPdf(
      analysis,
      locationInfo,
      floorPlanPreview ? floorPlanPreview.split(',')[1] : undefined
    );
  }

  function handleReset() {
    setPhase('form');
    setAnalysis(null);
    setError('');
    setFloorPlanFile(null);
    setFloorPlanPreview('');
    setSignalFile(null);
    setGhz24File(null);
    setGhz5File(null);
    setLocationInfo({ name: '', type: 'Residential', sqft: '', stories: '1', construction: 'Unknown', notes: '' });
  }

  const inputStyle = {
    width: '100%', background: '#0D1520', border: '1px solid #0D6E7A',
    borderRadius: '6px', color: '#F4F6F8', padding: '8px 12px',
    fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  };

  const labelStyle = { display: 'block', color: '#888', fontSize: '11px', marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.05em' };

  const uploadSlotStyle = (hasFile: boolean) => ({
    border: `2px dashed ${hasFile ? '#0D6E7A' : '#1A2332'}`,
    borderRadius: '8px', padding: '20px', textAlign: 'center' as const,
    cursor: 'pointer', background: hasFile ? '#0D6E7A11' : 'transparent',
    transition: 'all 0.2s',
  });

  if (phase === 'results' && analysis) {
    return (
      <div style={{ padding: '20px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', marginBottom: '4px' }}>WIRELESS DESIGN BRIEF</div>
            <div style={{ color: '#F4F6F8', fontSize: '18px', fontWeight: 'bold' }}>{locationInfo.name}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDownloadPdf} style={{
              background: '#0D6E7A', color: '#F4F6F8', border: 'none', borderRadius: '6px',
              padding: '10px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
            }}>⬇ Download PDF</button>
            <button onClick={handleReset} style={{
              background: 'transparent', color: '#888', border: '1px solid #1A2332',
              borderRadius: '6px', padding: '10px 20px', cursor: 'pointer', fontSize: '13px'
            }}>New Brief</button>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ background: '#1A2332', borderRadius: '8px', padding: '16px', marginBottom: '16px', borderLeft: '4px solid #00C2C7' }}>
          <div style={{ color: '#00C2C7', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '8px' }}>EXECUTIVE SUMMARY</div>
          <div style={{ color: '#F4F6F8', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6 }}>"{analysis.executiveSummary}"</div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'APs Required', value: analysis.estimatedAPCount, color: '#00C2C7' },
            { label: 'Critical Findings', value: analysis.criticalFindings?.length || 0, color: '#FF4444' },
            { label: 'Coverage Zones', value: analysis.coverageZones?.length || 0, color: '#0D6E7A' },
            { label: 'Interference Risks', value: analysis.interferenceRisks?.length || 0, color: '#B8922A' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, minWidth: '100px', background: '#0D1520', border: `1px solid ${color}33`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ color, fontSize: '24px', fontWeight: 'bold', fontFamily: 'Share Tech Mono, monospace' }}>{value}</div>
              <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Critical Findings */}
        {analysis.criticalFindings?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#FF4444', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '8px' }}>CRITICAL FINDINGS</div>
            {analysis.criticalFindings.map((f: string, i: number) => (
              <div key={i} style={{ background: '#FF444411', border: '1px solid #FF444433', borderRadius: '6px', padding: '10px 14px', marginBottom: '6px', color: '#F4F6F8', fontSize: '13px' }}>
                <span style={{ color: '#FF4444', marginRight: '8px' }}>✗</span>{f}
              </div>
            ))}
          </div>
        )}

        {/* AP Recommendations */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '8px' }}>AP PLACEMENT RECOMMENDATIONS</div>
          {analysis.apRecommendations?.map((ap: any, i: number) => (
            <div key={i} style={{ background: '#1A2332', borderRadius: '8px', padding: '14px', marginBottom: '8px', borderLeft: `4px solid ${ap.priority === 'Primary' ? '#00C2C7' : ap.priority === 'Secondary' ? '#0D6E7A' : '#888'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ color: '#B8922A', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px' }}>AP {i + 1}</span>
                  <span style={{ color: '#F4F6F8', fontWeight: 'bold', marginLeft: '8px', fontSize: '14px' }}>{ap.location}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#0D6E7A33', color: '#00C2C7', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontFamily: 'Share Tech Mono, monospace' }}>{ap.band}</span>
                  <span style={{ background: '#1A2332', color: '#888', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>{ap.apType}</span>
                  <span style={{ background: '#1A2332', color: '#888', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>~{ap.coverageRadius}</span>
                </div>
              </div>
              <div style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>{ap.reason}</div>
            </div>
          ))}
        </div>

        {/* Channel Strategy */}
        <div style={{ background: '#1A2332', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '12px' }}>CHANNEL STRATEGY</div>
          {[
            ['2.4 GHz', analysis.channelStrategy?.band24],
            ['5 GHz', analysis.channelStrategy?.band5],
            ['TX Power', analysis.channelStrategy?.txPower],
            ['Notes', analysis.channelStrategy?.notes],
          ].filter(([, v]) => v).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#0D6E7A', minWidth: '70px', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', paddingTop: '1px' }}>{label}</span>
              <span style={{ color: '#F4F6F8' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Coverage Zones */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '8px' }}>COVERAGE ZONES</div>
          {analysis.coverageZones?.map((zone: any, i: number) => {
            const rc = zone.riskLevel === 'Critical' ? '#FF4444' : zone.riskLevel === 'High' ? '#FF8C00' : zone.riskLevel === 'Medium' ? '#B8922A' : '#0D6E7A';
            return (
              <div key={i} style={{ background: '#1A2332', borderRadius: '6px', padding: '12px 14px', marginBottom: '6px', borderLeft: `4px solid ${rc}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#F4F6F8', fontWeight: 'bold', fontSize: '13px' }}>{zone.zone}</span>
                  <span style={{ color: rc, fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>{zone.riskLevel.toUpperCase()}</span>
                </div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>{zone.assessment}</div>
                <div style={{ color: '#00C2C7', fontSize: '12px' }}>→ {zone.recommendation}</div>
              </div>
            );
          })}
        </div>

        {/* Corvus Verdict */}
        <div style={{ background: '#0D1520', border: '1px solid #B8922A', borderRadius: '8px', padding: '20px', marginTop: '8px' }}>
          <div style={{ color: '#B8922A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '10px' }}>CORVUS' VERDICT</div>
          <div style={{ color: '#00C2C7', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.7 }}>"{analysis.corvusVerdict}"</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', marginBottom: '4px' }}>WIRELESS DESIGN BRIEF</div>
        <div style={{ color: '#F4F6F8', fontSize: '18px', fontWeight: 'bold', marginBottom: '6px' }}>AP Placement + Coverage Analysis</div>
        <div style={{ color: '#888', fontSize: '13px' }}>Upload a floor plan and wireless scan files. Corvus will analyze both and produce a full design brief with AP placement recommendations, channel strategy, and coverage zone analysis.</div>
      </div>

      {error && (
        <div style={{ background: '#FF444422', border: '1px solid #FF444466', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', color: '#FF4444', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Location Info */}
      <div style={{ background: '#1A2332', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '12px' }}>LOCATION DETAILS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={labelStyle}>LOCATION NAME *</label>
            <input style={inputStyle} value={locationInfo.name} onChange={e => setLocationInfo(p => ({ ...p, name: e.target.value }))} placeholder="Pilcher's Barbershop" />
          </div>
          <div>
            <label style={labelStyle}>LOCATION TYPE</label>
            <select style={inputStyle} value={locationInfo.type} onChange={e => setLocationInfo(p => ({ ...p, type: e.target.value }))}>
              {LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>SQUARE FOOTAGE</label>
            <input style={inputStyle} value={locationInfo.sqft} onChange={e => setLocationInfo(p => ({ ...p, sqft: e.target.value }))} placeholder="2400" />
          </div>
          <div>
            <label style={labelStyle}>STORIES / FLOORS</label>
            <input style={inputStyle} value={locationInfo.stories} onChange={e => setLocationInfo(p => ({ ...p, stories: e.target.value }))} placeholder="1" />
          </div>
          <div>
            <label style={labelStyle}>CONSTRUCTION TYPE</label>
            <select style={inputStyle} value={locationInfo.construction} onChange={e => setLocationInfo(p => ({ ...p, construction: e.target.value }))}>
              {CONSTRUCTION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>NOTES</label>
            <input style={inputStyle} value={locationInfo.notes} onChange={e => setLocationInfo(p => ({ ...p, notes: e.target.value }))} placeholder="Thick concrete walls in server room, etc." />
          </div>
        </div>
      </div>

      {/* Floor Plan Upload */}
      <div style={{ background: '#1A2332', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '12px' }}>FLOOR PLAN</div>
        <input ref={floorPlanRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFloorPlan(e.target.files[0])} />
        <div style={uploadSlotStyle(!!floorPlanFile)} onClick={() => floorPlanRef.current?.click()}>
          {floorPlanPreview ? (
            <img src={floorPlanPreview} alt="Floor plan" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px' }} />
          ) : (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺</div>
              <div style={{ color: '#0D6E7A', fontSize: '13px', marginBottom: '4px' }}>Upload Floor Plan</div>
              <div style={{ color: '#888', fontSize: '11px' }}>PNG, JPG, or PDF — hand-drawn is fine</div>
            </>
          )}
        </div>
        {floorPlanFile && (
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#0D6E7A', fontSize: '12px' }}>✓ {floorPlanFile.name}</span>
            <button onClick={() => { setFloorPlanFile(null); setFloorPlanPreview(''); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
          </div>
        )}
      </div>

      {/* Scan Files */}
      <div style={{ background: '#1A2332', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '4px' }}>WIRELESS SCAN FILES</div>
        <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>Optional — include scan data for deeper analysis. Same files as Crow's Eye.</div>
        {[
          { label: 'All Networks / Signal List', file: signalFile, setter: setSignalFile },
          { label: '2.4 GHz Networks', file: ghz24File, setter: setGhz24File },
          { label: '5 GHz Networks', file: ghz5File, setter: setGhz5File },
        ].map(({ label, file, setter }) => {
          const inputRef = useRef<HTMLInputElement>(null);
          return (
            <div key={label} style={{ marginBottom: '10px' }}>
              <input ref={inputRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setter(e.target.files[0])} />
              <div style={uploadSlotStyle(!!file)} onClick={() => inputRef.current?.click()}>
                {file ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                    <span style={{ color: '#0D6E7A', fontSize: '13px' }}>✓ {file.name}</span>
                    <button onClick={e => { e.stopPropagation(); setter(null); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </div>
                ) : (
                  <div style={{ color: '#888', fontSize: '12px' }}>{label}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !locationInfo.name.trim()}
        style={{
          width: '100%', background: loading ? '#0D6E7A88' : '#0D6E7A',
          color: '#F4F6F8', border: 'none', borderRadius: '8px',
          padding: '14px', fontSize: '15px', fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Share Tech Mono, monospace',
          letterSpacing: '0.05em', transition: 'all 0.2s',
        }}
      >
        {loading ? 'CORVUS IS ANALYZING...' : 'GENERATE DESIGN BRIEF'}
      </button>
    </div>
  );
}
