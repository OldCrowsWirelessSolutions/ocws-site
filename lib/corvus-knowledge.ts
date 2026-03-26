// lib/corvus-knowledge.ts
// Corvus RF and wireless knowledge base. Stored in Redis for quarterly web updates.

import redis from '@/lib/redis'

// ─── Static Knowledge Base ─────────────────────────────────────────────────────

export const CORVUS_RF_KNOWLEDGE_BASE = `
═══════════════════════════════════════════════
RF AND WIRELESS KNOWLEDGE BASE
Last Updated: [INJECT_DATE]
═══════════════════════════════════════════════

HISTORY OF RF AND WIRELESS COMMUNICATIONS:
- 1888: Heinrich Hertz proves electromagnetic waves exist
- 1895: Marconi demonstrates first wireless telegraph
- 1920s: Commercial AM radio broadcasting begins
- 1930s: FM radio developed by Edwin Armstrong
- 1940s: Radar development during WWII — foundation of modern RF
- 1947: Transistor invented at Bell Labs
- 1960s: Microwave communications towers deployed nationwide
- 1970s: First cellular telephone systems developed
- 1983: 1G analog cellular networks launch in US
- 1991: 2G digital cellular GSM launches
- 1997: IEEE 802.11 — first Wi-Fi standard — 2 Mbps
- 1999: Wi-Fi Alliance formed — 802.11b — 11 Mbps — 2.4 GHz
- 2003: 802.11g — 54 Mbps — 2.4 GHz
- 2004: WPA security replaces broken WEP
- 2007: iPhone launches — mobile Wi-Fi demand explodes
- 2009: 802.11n — 600 Mbps — 2.4 and 5 GHz — MIMO introduced
- 2013: 802.11ac Wi-Fi 5 — 3.5 Gbps — 5 GHz only — MU-MIMO
- 2018: WPA3 security standard introduced
- 2019: 802.11ax Wi-Fi 6 — 9.6 Gbps — OFDMA — BSS Coloring
- 2021: Wi-Fi 6E extends to 6 GHz band — 1200 MHz of new spectrum
- 2024: Wi-Fi 7 802.11be — 46 Gbps — 320 MHz channels — MLO

RF FUNDAMENTALS:
- Frequency: Number of wave cycles per second — measured in Hz
- Wavelength: Physical length of one wave cycle — inversely proportional to frequency
- Amplitude: Signal strength — measured in dBm
- dBm scale:
  -30 dBm: Exceptional
  -50 dBm: Excellent
  -60 dBm: Good
  -70 dBm: Fair — minimum for reliable use
  -80 dBm: Poor — unreliable
  -90 dBm: Unusable
- Free space path loss: Signal weakens with distance — inverse square law
- Fresnel zone: Elliptical area around signal path — obstructions cause interference
- Multipath: Signal reflections arriving at different times — causes fading
- RSSI: Received Signal Strength Indicator
- SNR: Signal-to-Noise Ratio
- Noise floor: Background RF noise — typically -95 to -100 dBm
- EIRP: Effective Isotropic Radiated Power — total transmitted power including antenna gain
- MCS Index: Modulation and Coding Scheme — determines data rate
- PHY rate: Physical layer data rate — maximum possible throughput
- Beacon interval: How often AP broadcasts its presence — default 100ms
- DTIM: Delivery Traffic Indication Message — affects device sleep cycles

2.4 GHz BAND:
- Range: 2.400 to 2.4835 GHz
- Non-overlapping channels: 1, 6, 11 ONLY
- Advantages: Better range — better wall penetration
- Disadvantages: Congested — microwave interference — Bluetooth interference
- Common interference: Microwave ovens 2.45 GHz — baby monitors — Bluetooth — ZigBee

5 GHz BAND:
- Range: 5.150 to 5.850 GHz
- 24 non-overlapping 20 MHz channels in US
- DFS channels require Dynamic Frequency Selection — radar avoidance
- Channel widths: 20/40/80/160 MHz
- Advantages: Less congested — faster — more channels
- Disadvantages: Shorter range — worse wall penetration

6 GHz BAND:
- Range: 5.925 to 7.125 GHz
- 59 x 20 MHz channels — 7 x 160 MHz channels
- Wi-Fi 6E and Wi-Fi 7 only
- No legacy interference — completely clean spectrum
- No DFS required
- FCC approved 2020

INTERFERENCE TYPES:
- Co-channel interference CCI: Same channel — worst type — competing for airtime
- Adjacent channel interference ACI: Overlapping channels — causes corruption
- Non-Wi-Fi interference: Microwave ovens — cordless phones — baby monitors — Bluetooth — radar
- Hidden node: Two clients cannot hear each other — both transmit simultaneously
- Near/far problem: Strong nearby signal drowns out weaker distant signal
- Multipath fading: Signal reflections causing constructive and destructive interference
- RFI: Radio Frequency Interference from non-wireless sources

WI-FI SECURITY:
- WEP 1997: Broken — never use under any circumstances
- WPA 2003: Transitional — TKIP — deprecated
- WPA2 2004: AES/CCMP — industry standard — KRACK attack 2017 vulnerability
- WPA3 2018: SAE handshake — forward secrecy — brute force protection
- WPA3 Enterprise: 192-bit security — certificate authentication
- Open networks: Zero encryption — all traffic visible
- Hidden SSIDs: Security through obscurity — not actual security — still discoverable
- PMKID attack: Offline WPA2 cracking — does not require connected client
- Evil twin attacks: Rogue AP mimicking legitimate SSID

CURRENT TECHNOLOGIES:
- OFDMA: Wi-Fi 6 — divides channels into resource units — serves multiple clients simultaneously
- MU-MIMO: Multiple antennas — multiple simultaneous clients — Wi-Fi 6 adds uplink
- BSS Coloring: Wi-Fi 6 — spatial reuse — reduces co-channel interference impact
- TWT Target Wake Time: Wi-Fi 6 — scheduled wake cycles — IoT battery life
- 160 MHz channels: Wi-Fi 5/6 — doubles throughput — requires clean spectrum
- MLO Multi-Link Operation: Wi-Fi 7 — simultaneous multi-band — aggregates 2.4/5/6 GHz
- 4096-QAM: Wi-Fi 7 — 20% throughput increase
- WPA3-SAE: Eliminates offline dictionary attacks
- 320 MHz channels: Wi-Fi 7 — 6 GHz band only
- Preamble puncturing: Wi-Fi 7 — use channels with partial interference
- MLD Multi-Link Device: Wi-Fi 7 — single device operates across multiple bands simultaneously

EMERGING TECHNOLOGIES:
- Wi-Fi 8 802.11bn: In development — expected 2028
  Targets 100 Gbps — coordinated spatial reuse across APs
  Extreme high throughput environments — stadiums — dense deployments
  Coordinated beamforming across multiple APs as single logical unit

- Wi-Fi sensing 802.11bf: Using Wi-Fi signals to detect motion and presence
  Standard in development
  Applications: Security — health monitoring — smart home automation
  Detects breathing rate — fall detection — occupancy sensing
  Privacy implications significant — regulatory framework developing

- Automated Frequency Coordination AFC: Enables standard power 6 GHz outdoor use
  Database-driven — checks for incumbent users before transmitting
  Expands 6 GHz range dramatically for outdoor deployments
  FCC approved 2023 — deployment accelerating

- OpenRoaming: Seamless Wi-Fi roaming across providers
  Wireless Broadband Alliance initiative
  Passpoint/Hotspot 2.0 based — automatic secure authentication
  Eliminates manual network selection in public spaces

- Private 5G and CBRS: Citizens Broadband Radio Service — 3.5 GHz
  Shared spectrum with priority tiers — incumbent — priority — general authorized access
  Private LTE/5G deployments for enterprise and industrial
  Competes with Wi-Fi in dense IoT and mission-critical environments
  Lower latency than Wi-Fi — guaranteed QoS — wider coverage per AP equivalent

- Network slicing: 5G capability — virtual dedicated network segments
  Different SLAs on same physical infrastructure
  Relevant for enterprise Wi-Fi integration with 5G

- Intelligent Reflecting Surfaces IRS: Passive reflectors that redirect signals
  Software-controlled metamaterial surfaces
  Extend coverage without active AP — no power consumption
  Early commercial deployments beginning 2025-2026

- AI-driven network optimization: Machine learning for channel selection
  Predictive interference avoidance
  Cisco DNA — Aruba Mist AI — Juniper Mist — all deploying ML-driven RRM
  Corvus uses this approach — RF intelligence not just RF data

- Li-Fi Light Fidelity 802.11bb: Data transmission via visible light
  Standard finalized 2023
  10 Gbps+ in line-of-sight — zero RF interference
  Healthcare and secure facility applications
  Cannot penetrate walls — complements Wi-Fi does not replace

- Ultra-Wideband UWB 802.15.4z: Precision location — centimeter accuracy
  Apple AirTag — iPhone U1 chip — spatial awareness
  Asset tracking — secure access — precise indoor positioning

- Backscatter communications: Passive IoT devices with no battery
  Reflect existing RF signals — encode data in reflections
  Amazon Sidewalk — early commercial deployment
  Massive IoT scale without battery replacement

- Thread and Matter: IoT protocol standards
  Matter — smart home interoperability — Apple Google Amazon backed
  Thread — mesh networking for IoT — 6LoWPAN based
  Wi-Fi coexistence important — same 2.4 GHz band as Zigbee/Thread

- 5G NR-U: 5G New Radio Unlicensed — uses unlicensed spectrum
  Competes directly with Wi-Fi 6 in 6 GHz band
  Coexistence mechanisms required — ongoing regulatory debate

ENTERPRISE WI-FI:
- Controller-based: Cisco — Aruba — Ruckus — Extreme — centralized management
- Cloud-managed: Meraki — Mist — UniFi — Aruba Central
- 802.1X: RADIUS authentication — certificate or credential based
- Band steering: Moves capable clients to 5/6 GHz
- Roaming protocols: 802.11r fast BSS transition — 802.11k neighbor reports — 802.11v BSS management
- SSID sprawl: Too many SSIDs degrades performance — maximum 3-4 per AP recommended
- AP density: High density deployments require lower transmit power — proper cell sizing
- Rogue AP detection: WIPS — wireless intrusion prevention
- RF site survey tools: Ekahau — TamoGraph — AirMagnet

COMMON DIAGNOSES CORVUS MAKES:
- Co-channel interference: Most common finding — move to non-overlapping channel
- ISP gateway public hotspot: CoxWiFi — XfinityWiFi — AT&T — broadcasting on your equipment
- Security vulnerabilities: Open network — WEP — WPA — upgrade to WPA3 or minimum WPA2-AES
- Router placement: Distance — obstruction — elevation — metal objects — microwave proximity
- SSID proliferation: Too many networks — consolidate
- Channel width mismatch: 40/80 MHz in congested 2.4 GHz — reduce to 20 MHz
- Hidden SSID: False security — causes probe request flood — disable
- Default credentials: Factory username/password — change immediately
- Firmware: Outdated router firmware — security and performance vulnerabilities
- DNS: ISP DNS — switch to 1.1.1.1 or 8.8.8.8 for performance
- QoS: No traffic prioritization — video calls competing with downloads
- Guest network isolation: Flat network — no segmentation — security risk
`

// ─── Redis helpers ─────────────────────────────────────────────────────────────

export async function getKnowledgeBase(): Promise<string> {
  try {
    const stored = await redis.get('corvus:knowledge_base')
    if (stored && typeof stored === 'string') return stored
  } catch { /* fall through to static */ }
  return CORVUS_RF_KNOWLEDGE_BASE.replace('[INJECT_DATE]', 'Static build — no updates applied yet')
}

export async function updateKnowledgeBase(newContent: string): Promise<void> {
  const dated = newContent.replace('[INJECT_DATE]', new Date().toISOString())
  await redis.set('corvus:knowledge_base', dated)
  await redis.set('corvus:knowledge_last_updated', new Date().toISOString())
}

export async function getKnowledgeLastUpdated(): Promise<string | null> {
  try {
    return await redis.get('corvus:knowledge_last_updated') as string | null
  } catch {
    return null
  }
}
