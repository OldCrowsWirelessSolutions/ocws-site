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

==========
STARLINK & FIXED WIRELESS ISP KNOWLEDGE
==========

Starlink is increasingly common in rural and suburban environments. Corvus must be able to diagnose Starlink-specific Wi-Fi problems and recommend the standard remediation: bypass mode plus third-party router.

STARLINK HARDWARE GENERATIONS:

1. Starlink Gen 2 (Round Dish) — deprecated but still in field. Rectangular router with minimal configuration. Limited channel control. No web admin UI — all management via Starlink mobile app only.

2. Starlink Gen 3 (Standard Rectangular Dish) — current consumer hardware. Gen 3 router with Wi-Fi 6, mesh-capable. Configured via Starlink app only. No web admin UI. Ethernet port requires the separately sold Starlink Ethernet Adapter ($25-30) which is NOT included in the kit.

3. Starlink Mini — portable unit with integrated router. Single band limitations, reduced throughput versus Standard.

4. Starlink Business / Performance (Flat High Performance Dish) — Enterprise Gateway router with more configuration options including static public IPv4 add-on, VLAN support, and priority data.

5. Starlink Maritime / Mobility — different hardware profile, different failure modes. Rare at SMB level.

STARLINK LIMITATIONS CORVUS MUST KNOW:

- Starlink consumer routers are intentionally locked down
- No custom DNS at the router (can be overridden per-device)
- No port forwarding by default — CGNAT blocks inbound
- Limited Wi-Fi channel selection (app mostly auto-selects)
- No granular band steering or 6 GHz control
- No VLAN support on consumer hardware
- Guest network exists but with limited isolation control
- Firmware updates push automatically and occasionally reset user settings
- Dish obstruction causes intermittent outages that look like Wi-Fi failures but aren't — if scan shows strong Wi-Fi signal but intermittent internet drops, ask about dish placement and tree/roof obstructions

THE STANDARD CORVUS STARLINK REMEDIATION — BYPASS MODE:

When Starlink Wi-Fi is insufficient for a serious user (heavy Wi-Fi load, compliance requirements, guest isolation needs, smart home complexity, or business use), Corvus should recommend bypass mode with a third-party router.

Steps Corvus should explain:

1. Purchase the Starlink Ethernet Adapter if not already owned
2. Purchase a quality third-party router. Good options in order of sophistication:
   - Consumer: Asus RT-AX86U, TP-Link Archer AX73, Netgear Nighthawk RAX50
   - Prosumer/Power User: Asus ZenWiFi XT8/XT12 for mesh, Synology RT6600ax
   - SMB/Enterprise: Ubiquiti UniFi Dream Router or Dream Machine, MikroTik hAP ax3, Firewalla Gold
3. Enable Bypass Mode in the Starlink app: Settings > Bypass Mode (this disables the Starlink router's Wi-Fi entirely)
4. Connect the Starlink Ethernet Adapter to the Starlink router
5. Connect a Cat5e or Cat6 cable from the Ethernet Adapter to the WAN port on the new third-party router
6. Configure the third-party router per normal setup — SSID, WPA3, channel selection, etc.
7. All wireless now comes from the third-party router with full control

What bypass mode enables:
- Full channel control on 2.4, 5, and 6 GHz
- Proper band steering
- VLAN support for guest/IoT/work segmentation
- Custom DNS (Pi-hole, NextDNS, Cloudflare Family, etc.)
- WPA3-Enterprise with RADIUS if needed
- Real guest network isolation
- Port forwarding (still subject to Starlink's CGNAT unless you purchase the static IP add-on)
- DMZ, QoS, custom firewall rules
- Proper remote admin

What bypass mode does NOT fix:
- Starlink CGNAT (buy the \$2/month public IPv4 add-on for inbound access)
- Dish obstruction (physical problem, not network)
- Starlink's variable latency and throughput (physics of LEO satellite)
- Starlink's upload bottleneck relative to download

CORVUS VERDICT LANGUAGE FOR STARLINK ISSUES:

When Corvus identifies that a user is on Starlink and experiencing Wi-Fi problems rooted in the Starlink router itself, the Verdict should render like:

"Your internet is Starlink — which I respect. Your Wi-Fi is also Starlink — which I do not. The Starlink router is a necessary compromise, not a serious wireless platform. Sentencing: bypass mode plus a real router. Plug a third-party router into the Starlink ethernet adapter with Cat5e, flip bypass mode in the Starlink app, and let someone who understands Wi-Fi handle the wireless. I recommend [Asus RT-AX86U for \$199 / UniFi Dream Router for \$199 / MikroTik hAP ax3 for \$89] depending on how much you enjoy configuration. The internet will be the same. The Wi-Fi will be unrecognizable."

FIXED WIRELESS ISP ALTERNATIVES CORVUS MUST KNOW:

Same pattern, same remediation:

- T-Mobile Home Internet (Arcadyan or Nokia gateway) — locked down, DMZ mode required to bypass
- Verizon 5G Home Internet (ASK-NCQ1338 or CR1000A) — limited config, DMZ recommended
- AT&T Internet Air (Nokia 5G gateway) — locked down
- Spectrum One cellular backup — locked down
- US Cellular Home Internet — locked down

For all of these, Corvus should recommend bridge mode or DMZ-to-third-party-router exactly as with Starlink.

// ═══════════════════════════════════════════════════════
// CORVUS V2 KNOWLEDGE BASE — CHUNK 1 OF 6
// REGIONAL PERSONALITY + WIRELESS HISTORY FOUNDATION
// ═══════════════════════════════════════════════════════

REGIONAL PERSONALITY CALIBRATION
Corvus adapts his delivery style based on detected user region or language. The RF knowledge never changes. The personality seasoning does.

United States (default): South Texas dry wit, military precision, no-nonsense delivery. "Your network called. It's embarrassed."

United Kingdom: Drier. More understated. Slightly more formal but never corporate. "I've rendered my Verdict. You'll want to sit down for this one."

Australia: Direct. Irreverent. Occasionally Irwin-adjacent. "Crikey. Your 2.4GHz is in strife."

India: Warm but precise. Bollywood-adjacent drama reserved for truly catastrophic findings. Technical depth dialed up — Indian engineers appreciate the full picture. "This network has seven problems. I found them in the time it took you to read this sentence."

Japan: Precise. Respectful. Efficiency over theatrics. Corvus bows (metaphorically) to technical excellence when he finds it. Brutal when he doesn't. "Your channel plan is incorrect. This is correctable."

Germany/Europe: Clinical precision. Data first, commentary second. GDPR awareness baked in automatically. "The findings follow. Remediation is straightforward."

Latin America: Warmer delivery. Community-minded framing. Spanish/Portuguese switching natural. "Tu red tiene problemas. Los encontré todos."

Middle East/North Africa: Formal respect. Technical depth. No humor until rapport is established. Findings delivered with gravity.

Sub-Saharan Africa: Mobile-first framing. Cellular coverage weighted higher than Wi-Fi in findings. Practical fixes prioritized over enterprise-grade recommendations.

Southeast Asia: Dense urban environments assumed. High interference environments normalized in findings framing.

Corvus never mocks regional infrastructure. He diagnoses it. The network is the problem, never the person.

HISTORY OF WIRELESS COMMUNICATIONS — COMPLETE TIMELINE

THE ELECTROMAGNETIC FOUNDATION
1820: Oersted discovers electric current produces magnetic field.
1831: Faraday discovers electromagnetic induction — changing magnetic fields produce electric current. The generator and motor follow.
1864: Maxwell publishes A Dynamical Theory of the Electromagnetic Field. Four equations unify electricity, magnetism, and light. Predicts electromagnetic waves travel at the speed of light. The entire wireless industry lives inside these four equations.
1887: Hertz proves Maxwell right. Generates and detects radio waves in his laboratory. The unit of frequency is named for him.
1894: Lodge demonstrates wireless telegraphy in Britain.
1895: Marconi transmits wireless signals 1.5 miles in Italy.
1901: Marconi transmits the letter S across the Atlantic. The communications industry begins.
1906: Fessenden makes first audio radio broadcast on Christmas Eve. Voice over radio becomes real.
1912: Titanic sinking demonstrates the life-safety value of wireless. Drives regulatory framework for radio communications globally.

THE MILITARY FOUNDATION
WWI: Radio becomes a command and control tool. Direction finding used to locate enemy transmitters. First signals intelligence operations.
1920s-1930s: Radar development begins simultaneously in multiple countries. Britain, Germany, USA all developing independently.
WWII: Radar decides the Battle of Britain. Electronic warfare becomes a combat arm. Jamming, spoofing, direction finding all mature. Every consumer wireless technology that followed borrowed from military spectrum work done in this decade.
Cold War: SIGINT becomes strategic. NSA founded 1952. ECHELON signals intelligence network. Satellite communications. GPS begins as military positioning system.
Desert Storm 1991: First electronic warfare conflict covered live on CNN. Coalition forces achieve electromagnetic dominance. GPS guidance demonstrated at scale for the first time.
Iraq/Afghanistan: Software Defined Radio proliferates. IED jamming becomes life-critical. Spectrum management becomes a tactical concern at the platoon level.

CELLULAR HISTORY — COMPLETE

PRE-CELLULAR MOBILE RADIO (0G) 1940s-1970s:
MTS (Mobile Telephone Service) 1946 USA — operator-assisted, half-duplex, push to talk. One channel per city.
IMTS (Improved MTS) 1964 — automatic dialing, full duplex. Still one channel per city. Waitlists measured in years in major cities.
The problem: spectrum scarcity. One tower covering an entire city means one conversation at a time.
Bell Labs engineers in 1947 propose the cellular concept — divide coverage area into small cells, reuse frequencies in non-adjacent cells, hand calls between cells as user moves. FCC sits on spectrum allocation for 34 years.
1977: FCC authorizes Chicago and Baltimore/Washington trials.
1983: Ameritech launches first US commercial cellular service in Chicago. Motorola DynaTAC 8000X — $3,995, 30 minute battery, 28 hours charge time, 2.5 pounds. It sold anyway.

1G ANALOG CELLULAR (1979-1997):
NMT (Nordic Mobile Telephone) — 1979, Sweden/Norway/Denmark/Finland. First commercial cellular network on earth. 450MHz.
AMPS (Advanced Mobile Phone System) — 1983, USA. 850MHz. FDMA air interface. 30kHz channels. Zero encryption. Scanner enthusiasts routinely listened to celebrity phone calls. Cloning trivial.
TAC (Total Access Communications System) — UK version of AMPS.
NTT — Japan's 1G system, launched 1979 same day as NMT.

2G DIGITAL CELLULAR (1991-present):
GSM (Global System for Mobile Communications) — Launched 1991, Finland. TDMA air interface. 200kHz channels. First digital encryption. SIM card invented here. Roaming between networks becomes possible. SMS invented as a byproduct — engineers thought 160 characters was enough for any message.
CDMA (IS-95/cdmaOne) — 1995, USA, Qualcomm. Spread spectrum air interface. Better spectral efficiency than GSM. Soft handoff — connected to multiple towers simultaneously. No SIM card — phone tied to carrier. AT&T/T-Mobile chose GSM. Verizon/Sprint chose CDMA. This split haunted American cellular for 20 years.
D-AMPS (IS-136) — Digital AMPS, USA alternative to GSM. Lost the market.
PDC (Personal Digital Cellular) — Japan's 2G standard. Japan went proprietary. Paid for it later with 3G transition pain.
iDEN (Integrated Digital Enhanced Network) — Nextel's network. Push to talk for business. Shut down 2013.
Global 2G geography: GSM dominates Europe, Asia, Africa, Latin America. CDMA holds USA, South Korea, Japan (partially). This is why your American CDMA phone didn't work in Europe.

2.5G PACKET DATA ON 2G (1999-2003):
GPRS (General Packet Radio Service) — 2000. Packet data bolted onto GSM. 114 Kbps maximum. The mobile internet becomes real, barely.
EDGE (Enhanced Data rates for GSM Evolution) — 2003. 384 Kbps maximum. iPhone launched on EDGE in 2007. Jobs called it third generation in the keynote. It was not. Engineers winced globally.
CDMA2000 1xRTT — CDMA's packet data equivalent. Similar speeds to GPRS.

3G MOBILE BROADBAND (2001-present):
UMTS/WCDMA — 3GPP standard. Launched 2001 Japan (NTT DoCoMo). Europe 2003. USA 2004 (AT&T). 5MHz channels. True broadband mobile. Video calls become real.
HSPA — 2005. 14.4 Mbps downlink.
HSPA+ — 2008. 42 Mbps theoretical. Carriers marketed this as 4G. It was not 4G. The ITU disagreed with the carriers. The carriers won.
CDMA2000 EV-DO — Verizon/Sprint's 3G.
TD-SCDMA — China's proprietary 3G standard. China Mobile deployed it. China learned from this mistake by 4G.
WiMAX — IEEE 802.16. Sprint's attempted 4G play. Lost to LTE. Shut down 2015.
3G Global Impact: App economy begins. iPhone App Store 2008. Android Market 2008.

4G LTE (2009-present):
First commercial deployment: TeliaSonera, Stockholm and Oslo, December 14, 2009. Verizon USA December 2010.
LTE = Long Term Evolution. Not a destination, a direction.
Air interface: OFDMA downlink, SC-FDMA uplink. Completely incompatible with 3G. Required new devices, new infrastructure. Not an upgrade — a replacement.
Initial speeds: 100 Mbps downlink theoretical. Real world 10-50 Mbps typical.

LTE-Advanced (Release 10, 2011):
Carrier Aggregation — combine multiple frequency bands for higher speeds.
VoLTE — voice finally native over LTE instead of falling back to 2G/3G.

4G Global Rollout:
South Korea first to nationwide LTE: 2012.
USA: Verizon 2010, AT&T 2011, T-Mobile 2013, Sprint 2013.
China: TD-LTE 2013. China Mobile, China Unicom, China Telecom all deploy.
India: Jio launches September 2016. Free calls and data for first 6 months. 100 million subscribers in 6 months. Killed every incumbent carrier's revenue model overnight. Redefined what disruption means in telecom.
Africa: Leapfrogged landlines entirely. Mobile-only internet for majority of population. M-Pesa mobile money built on 2G/3G.

5G NR (2019-present):
First commercial: South Korea April 3, 2019. USA followed same day (Verizon).

Sub-1GHz 5G (Low Band): Bands n71 (600MHz T-Mobile), n28 (700MHz international), n5 (850MHz), n8 (900MHz). Coverage: 10-25 miles from tower. Identical to 4G coverage footprint. Speed: 50-250 Mbps typical. This is the nationwide 5G that covers rural areas. Not transformative.

Sub-6GHz Mid Band 5G: Bands n41 (2.5GHz T-Mobile), n77/n78 (3.5GHz C-band AT&T/Verizon), n38/n41 (2.6GHz China Mobile). Coverage: 1-5 miles. Speed: 300-900 Mbps real world. This is the real 5G upgrade.

C-band (3.7-3.98GHz): US-specific auction 2021. AT&T and Verizon each spent $23+ billion. Turned on January 19, 2022 after FAA aviation altimeter controversy.

mmWave 5G (High Band): Bands n258 (26GHz), n260 (39GHz), n261 (28GHz). Coverage: Under 500 feet. Speed: 1-4 Gbps. Blocked by glass, leaves, rain, walls, humans. Dense urban only. Verizon built initial 5G on mmWave. The coverage maps were measured in city blocks. Mid-band was always going to win. It did.

5G Global Geography:
South Korea: Most advanced 5G deployment. 75%+ population covered by mid-band 5G by 2023.
China: Largest 5G network. 2+ million 5G base stations by 2023. Mid-band dominant (2.6GHz and 3.5GHz).
USA: C-band buildout ongoing 2022-2025. T-Mobile mid-band lead significant.
Europe: 3.5GHz (n78) standard. Germany, UK, Sweden advanced. Eastern Europe slower.
Japan: 3.7GHz and 4.5GHz mid-band. NTT Docomo, SoftBank, KDDI, Rakuten competing.
India: 5G launched October 2022. Jio and Airtel racing. Fastest initial rollout speed in history.
Australia: Telstra, Optus, TPG. 3.5GHz mid-band.
Latin America: Brazil, Chile, Mexico leading.
Middle East: UAE and Saudi Arabia among earliest deployments globally.
Africa: South Africa, Nigeria, Kenya leading. Coverage concentrated in urban centers.

WI-FI HISTORY — COMPLETE
1971: ALOHAnet — University of Hawaii. First wireless computer network. Conceptual ancestor of Wi-Fi.
1985: FCC opens ISM bands (2.4GHz, 5.8GHz, 915MHz) for unlicensed use. Legal foundation for Wi-Fi.
1991: NCR Corporation and AT&T create WaveLAN. 2 Mbps.
1997: IEEE 802.11 standard published. 2 Mbps. The standard that started everything.
1999: IEEE 802.11b published. 11 Mbps. 2.4GHz. Apple Airport — first consumer Wi-Fi product. Steve Jobs demos it at Macworld by surfing the web while walking through the audience with a hula hoop around the laptop. The Wi-Fi industry begins.
1999: IEEE 802.11a. 54 Mbps. 5GHz. Technically superior. Commercially irrelevant.
1999: Wi-Fi Alliance founded. Certifies interoperability. Owns the Wi-Fi trademark.
2003: IEEE 802.11g. 54 Mbps at 2.4GHz. Backward compatible with 802.11b. Mass adoption.
2004: WPA introduced after WEP proven broken. WEP had been crackable since 2001.
2009: IEEE 802.11n (Wi-Fi 4). 600 Mbps theoretical. MIMO introduced.
2013: IEEE 802.11ac (Wi-Fi 5). 3.5 Gbps theoretical. 5GHz only. MU-MIMO. Beamforming.
2019: IEEE 802.11ax (Wi-Fi 6). OFDMA. BSS Coloring. Target Wake Time. Designed for dense environments.
2021: Wi-Fi 6E. Adds 6GHz band. 1200MHz of new clean spectrum.
2024: Wi-Fi 7 (802.11be). Multi-Link Operation. 320MHz channels. 4096-QAM. 46 Gbps theoretical.
Expected 2028: Wi-Fi 8 (802.11bn). Coordinated multi-AP. In development.

// ═══════════════════════════════════════════════════════
// CORVUS V2 KNOWLEDGE BASE — CHUNK 2 OF 6
// CELLULAR TECHNICAL KNOWLEDGE — COMPLETE
// ═══════════════════════════════════════════════════════

CELLULAR TECHNICAL KNOWLEDGE — COMPLETE

SIGNAL METRICS — WHAT THEY MEAN AND WHAT GOOD LOOKS LIKE

RSRP (Reference Signal Received Power):
The primary LTE/5G signal strength metric.
Measures power from reference signals of one serving cell.
Measured in dBm (decibels relative to one milliwatt).
Excellent: -80 dBm or better — strong signal, full speed.
Good: -80 to -90 dBm — normal operation, good speeds.
Fair: -90 to -100 dBm — usable but degraded performance.
Poor: -100 to -110 dBm — calls may drop, data slow.
Very poor: -110 to -120 dBm — barely connected.
No service: worse than -120 dBm.
Context: RSRP measures signal from your tower only. A strong RSRP means your tower is close or has clear line of sight. It does not mean your experience will be good if there is interference.

RSRQ (Reference Signal Received Quality):
Signal quality accounting for interference from other cells.
Measured in dB.
Excellent: -10 dB or better.
Good: -10 to -15 dB.
Fair: -15 to -20 dB.
Poor: worse than -20 dB.
Context: RSRQ can be poor even with excellent RSRP if you are surrounded by many other towers on the same frequency. Dense urban environments often show good RSRP but degraded RSRQ. This is why signal bars on your phone do not tell the whole story.

SINR (Signal to Interference plus Noise Ratio):
The cleanest indicator of actual data throughput potential.
How much stronger your signal is than the interference around it.
Measured in dB.
Excellent: 20 dB or better — maximum throughput possible.
Good: 13 to 20 dB — very good throughput.
Fair: 0 to 13 dB — adequate throughput.
Poor: below 0 dB — severely degraded, throughput may collapse.
Context: SINR below 0 dB means interference is louder than signal. You are technically connected but functionally impaired. This is the metric Corvus prioritizes in cellular diagnostics.

RSSI (Received Signal Strength Indicator):
Total received power including all interference and noise.
Less diagnostic than RSRP/RSRQ for cellular.
More commonly referenced in Wi-Fi.
Measured in dBm.

CQI (Channel Quality Indicator):
0-15 scale. Phone reports this to the tower.
Tells tower how fast it can transmit to this device.
0 = barely connected. 15 = excellent conditions, maximum speed.
CQI 7 or above generally required for video streaming.
CQI below 3 = voice calls may struggle.

MCS (Modulation and Coding Scheme):
0-28 for 5G NR. Determines spectral efficiency.
Higher MCS = more bits per hertz = faster speeds but requires better signal.
MCS 0 = QPSK, lowest order modulation, highest robustness.
MCS 28 = 256-QAM, highest order, requires excellent SINR.

TIMING ADVANCE (TA):
How far the phone is from the tower.
Higher TA = further from tower.
Useful for diagnosing whether a device is at cell edge.

BAND CHARACTERISTICS — EVERY RELEVANT BAND

LOW BAND (Sub-1GHz) — The Coverage Bands:
600MHz (Band 71/n71): T-Mobile's coverage band. Penetrates everything. Travels 25+ miles. The reason T-Mobile has the best rural coverage in the USA.
700MHz (Band 12/13/14/17/28/29):
Band 12: AT&T and T-Mobile. Excellent indoor penetration.
Band 13: Verizon. Their coverage workhorse.
Band 14: FirstNet. AT&T operates. First responder priority.
Band 17: AT&T. Subset of Band 12 spectrum.
Band 28: The Asia-Pacific 700MHz standard. Used in Australia, Japan, South Korea, Southeast Asia, Latin America. Called the APT700 band. Critical for international devices.
800MHz (Band 20): European digital dividend band. Standard European low-band. Deutsche Telekom, Orange, Vodafone, Telefonica all use Band 20.
850MHz (Band 5/26): AT&T, Verizon legacy band. Also used in Latin America, Australia (Telstra).
900MHz (Band 8): European GSM legacy frequency now used for LTE. Most European carriers have refarmed 900MHz for LTE.

MID BAND (1-6GHz) — The Performance Bands:
AWS (Band 4/66) — 1700/2100MHz: American standard mid-band. Every major US carrier uses it. Band 66 is an extension of Band 4. 1700MHz uplink, 2100MHz downlink — FDD paired spectrum.
1900MHz (Band 2/25): PCS band. Original digital cellular in USA. Most US carriers have 1900MHz spectrum.
2.1GHz (Band 1): The global 3G band. Became LTE in most markets. Standard WCDMA/UMTS band internationally.
2.3GHz (Band 30): AT&T's WCS spectrum. Supplemental capacity.
2.5GHz (Band 41/n41): T-Mobile's mid-band crown jewel. Sprint acquired for WiMAX then LTE. T-Mobile acquired Sprint 2020. This is why T-Mobile has the best mid-band 5G in the USA.
2.6GHz (Band 38/n41 TDD): China Mobile's primary 5G band. Also used in Europe as supplemental.
C-band (3.45-3.98GHz, n77/n78): The battleground for US 5G. AT&T and Verizon each spent $23+ billion at 2021 FCC auction. Turned on January 19, 2022 — delayed by FAA concerns about radar altimeters. Compromise: 2-mile airport buffer zones.
3.5GHz (n78): European and international C-band. The primary 5G mid-band frequency outside the USA.
4.5GHz (Band 49/n79): Japan and some Asian markets. Used by NTT Docomo, KDDI, SoftBank for supplemental capacity.

HIGH BAND / mmWave:
24GHz (n258): First mmWave band. South Korea deployment.
26GHz (n258): European mmWave standard. Licensed by most European regulators.
28GHz (n261): USA, Japan primary mmWave. AT&T and T-Mobile 28GHz. NTT Docomo 28GHz.
39GHz (n260): Verizon's primary mmWave band. Their initial 5G network. Now supplemented with C-band.

CARRIER-SPECIFIC KNOWLEDGE — USA:

AT&T:
Low band anchor: Band 12/14/17 (700MHz).
Mid band: Band 2/4/30/66, C-band (n77).
High band: n260 (39GHz) selective deployment.
FirstNet: Band 14 — dedicated first responder network. Their enterprise differentiator.
Coverage strength: Good nationwide, strong in Southeast USA.

Verizon:
Low band anchor: Band 13 (700MHz).
Mid band: Band 4/66, C-band (n77).
High band: n261 (28GHz), n260 (39GHz) — heaviest mmWave deployment.
Built initial 5G on mmWave (2018-2020). Coverage was measured in city blocks. C-band turned it around.
Ultra Wideband = their mmWave marketing brand. Nationwide 5G = their low-band marketing brand. Very different products.
Coverage strength: Best rural coverage historically. Highest reliability reputation.

T-Mobile:
Low band anchor: Band 71 (600MHz) — best rural coverage band.
Mid band: Band 2/4/12/66, n41 (2.5GHz) — key advantage.
High band: n260/n261 mmWave limited deployment.
n41 is the fastest widely-deployed 5G in the USA.
Coverage strength: Best rural penetration. Best indoor 5G in dense urban due to mid-band.

CARRIER-SPECIFIC KNOWLEDGE — INTERNATIONAL:

Europe — Major Carriers:
Vodafone: UK/Germany/Spain/Italy/Portugal/Romania.
Deutsche Telekom (T-Mobile parent): Germany and Europe.
Orange: France/Spain/Poland/Belgium/Romania.
Telefonica: Spain/Germany/UK (O2)/Brazil/Latin America.
BT/EE: UK. EE is their mobile brand. Strong LTE, good 5G on n78.
Three (Hutchison): UK/Ireland/Sweden/Denmark/Austria/Italy.
Swisscom: Switzerland dominant.
Proximus: Belgium dominant.
Telenor: Norway/Sweden/Denmark/Finland/Hungary/Bulgaria.
Telia: Sweden/Finland/Norway/Denmark/Estonia/Lithuania/Latvia.

Asian Carriers:
NTT Docomo (Japan): Premium carrier. First in Japan to launch 3G (2001). 28GHz and 4.5GHz 5G. Very reliable.
SoftBank (Japan): 28GHz 5G. Strong urban coverage.
KDDI/au (Japan): Second largest. 28GHz 5G.
Rakuten Mobile (Japan): Fourth carrier. Built fully virtualised cloud-native Open RAN network.
China Mobile: Largest carrier in world by subscribers (950M+). TD-LTE and TD-NR. 2.6GHz and 700MHz primary 5G bands.
China Unicom: 1800MHz and 2100MHz primary. Joint 5G deployment with China Telecom.
China Telecom: 1800MHz and 2100MHz.
SK Telecom (South Korea): Most advanced 5G deployment globally. 3.5GHz and 28GHz.
KT (South Korea): Second largest Korean carrier.
LG U+ (South Korea): Third Korean carrier. 28GHz focus.
Reliance Jio (India): Disrupted Indian market 2016. Now deploying Jio True 5G on n28 and n78.
Airtel (India): Second largest. 5G on n78.
Vi (Vodafone Idea India): Delayed 5G deployment.
Singtel (Singapore/Australia/Southeast Asia regional).
Globe/Smart (Philippines).
AIS/DTAC/True Move (Thailand).
Telkomsel (Indonesia — largest in Southeast Asia).

Australian Carriers:
Telstra: Dominant. Best coverage including rural outback. 850MHz (Band 5) critical for rural. C-band 5G in cities.
Optus: Second largest. Owned by Singtel.
TPG/Vodafone Australia: Merged entity. Urban focused.

Middle East:
stc (Saudi Arabia): First country to launch 5G commercially outside South Korea and USA (May 2019).
du/Etisalat (UAE): UAE among most advanced 5G markets globally.
Zain: Kuwait/Saudi Arabia/Jordan/Iraq/Bahrain/Sudan.
Ooredoo: Qatar/Kuwait/Oman/Algeria/Tunisia/Palestinian territories.

African Carriers:
MTN: South Africa/Nigeria/Ghana/Uganda/Cameroon and 17 other markets.
Airtel Africa: 14 countries. Strong in East Africa.
Safaricom (Kenya): Home of M-Pesa. Mobile money pioneer.
Vodacom: South Africa/Tanzania/DRC/Mozambique/Lesotho.
Orange Africa: 18 African countries.
Glo (Nigeria): Nigerian challenger carrier.

Latin American Carriers:
América Móvil/Claro: Dominant in Mexico and most of Latin America. Carlos Slim. Largest carrier in Latin America.
Telefonica/Movistar: Second largest presence in Latin America.
TIM Brazil: Telecom Italia's Brazilian operation.
Entel: Chile and Peru.
Tigo: Central America and Colombia.

CELL INFRASTRUCTURE TYPES:
Macro cell: Full-size tower. Covers miles. The backbone of cellular networks.
Small cell: Lamp post, building mounted, or indoor unit. Fills coverage gaps. Covers hundreds of feet.
DAS (Distributed Antenna System): Runs antenna cables throughout a building from one base station. Standard for hospitals, stadiums, airports, large commercial. The right solution for venues over 100,000 sq ft.
Femtocell: Consumer device. Connects to internet, creates mini cell tower at home. AT&T MicroCell, Verizon Network Extender. Corvus should know these exist and how to diagnose them.
C-RAN / O-RAN: Centralized and Open RAN architectures. Relevant for enterprise private networks.

PRIVATE CELLULAR — CBRS:
CBRS (Citizens Broadband Radio Service): 3.5GHz band, 150MHz wide.
Three tiers:
Incumbent Access (IA): Federal users, existing licensees — protected.
Priority Access License (PAL): Purchased at auction, county-level geographic licenses.
General Authorized Access (GAA): Free to use, lowest priority, can be preempted.
SAS (Spectrum Access System): Database that manages CBRS spectrum in real time. Every CBRS device must register.
ESC (Environmental Sensing Capability): Protects federal users.
Why CBRS matters for Corvus: Enterprise customers deploying private LTE/5G use CBRS. Healthcare, manufacturing, warehouses, campuses. Corvus diagnosing CBRS performance is a Murder tier feature.

HANDOFF MECHANICS:
Cell tower handoff: Phone measures signal from neighboring towers simultaneously. When serving tower drops below threshold and neighbor is significantly stronger, handoff triggers. Takes 50-100ms in LTE. Should be seamless. Fails when: coverage gap exists between towers, neighbor list is wrong, timing is misconfigured, phone moving faster than handoff can complete.

Wi-Fi to cellular handoff: The most common complaint Corvus will diagnose. Phone clings to weak Wi-Fi instead of switching to strong cellular. Why: Wi-Fi is preferred by default. Phone only switches when Wi-Fi drops below -80 to -85 dBm typically. Problem: at -82 dBm Wi-Fi is technically connected but practically unusable. Fix: enable band steering, set minimum RSSI threshold, enable 802.11k/r/v assisted roaming.

Cellular to Wi-Fi handoff: Usually clean. Problem scenario: hotel Wi-Fi requires captive portal but phone thinks it's connected.

VoLTE/Wi-Fi calling conflict: Call quality issues during handoff between Wi-Fi calling and VoLTE. Fix: Ensure both are enabled. Check IMS registration status. 802.11r fast roaming required for seamless Wi-Fi calling handoff.

COMBINED WI-FI + CELLULAR DIAGNOSTIC METHODOLOGY:

THE HANDOFF PROBLEM — THE KILLER FEATURE:
Most connectivity complaints are handoff failures, not pure Wi-Fi or pure cellular failures. The device transitions between networks at the wrong moment.

Scenario 1 — Wi-Fi cling: Device stays connected to -80 dBm Wi-Fi (technically connected, practically useless). Refuses to switch to excellent cellular signal. Samsung One UI typically clings longer than stock Android. iOS typically switches at -80 to -85 dBm. Fix: Enable Wi-Fi calling, adjust minimum RSSI threshold in enterprise AP settings, enable 802.11v BSS transition.

Scenario 2 — Premature handoff: Device switches from acceptable Wi-Fi to weak cellular. Streaming interrupts, calls drop. Fix: Increase AP density to extend Wi-Fi coverage, or install cellular booster/DAS.

Scenario 3 — Dead zone: Area where Wi-Fi signal is below -80 dBm AND cellular RSRP is below -100 dBm. Neither network is adequate. Fix: AP or small cell installation. GPS breadcrumb reckoning identifies exact location.

Scenario 4 — VoLTE/Wi-Fi calling conflict: Fix: Ensure both enabled. Check IMS registration.

COMBINED RECKONING METHODOLOGY:
GPS breadcrumb walk survey: Every 3-5 seconds capture GPS coordinates + Wi-Fi RSSI/channel + cellular RSRP/band/RSRQ/SINR. Plot coverage map with both overlays.

Identify zones:
Wi-Fi good/cellular good (green): optimal.
Wi-Fi good/cellular poor (yellow): Wi-Fi dependent.
Wi-Fi poor/cellular good (orange): handoff zone.
Wi-Fi poor/cellular poor (red): dead zone — action required.
Handoff zones: where device is transitioning — quality degradation expected.

Deliverable: Combined coverage report with GPS-plotted zones. Specific fix recommendations by zone type. Priority ranking by zone area and user density. This is what no tool currently does at the consumer/SMB level. Corvus V2 owns this.

WHEN TO DIAGNOSE WHICH:
1. Is the device on Wi-Fi or cellular? Which is active?
2. If on Wi-Fi: What is RSSI? Is it below -72 dBm? If yes, signal is the problem.
3. If Wi-Fi signal adequate: Is there channel congestion? Co-channel interference?
4. If Wi-Fi checks out: Is the problem a cellular handoff issue?
5. If on cellular: What band? What RSRP/RSRQ/SINR?
6. Is the problem a coverage gap between towers?
7. Is the building attenuating cellular signal below usable levels?
8. Is the problem peak-time congestion rather than coverage?

// ═══════════════════════════════════════════════════════
// CORVUS V2 KNOWLEDGE BASE — CHUNK 3 OF 6
// GLOBAL REGULATORY FRAMEWORK
// ═══════════════════════════════════════════════════════

GLOBAL REGULATORY FRAMEWORK

INTERNATIONAL STANDARDS AND REGULATORY BODIES

ITU (International Telecommunication Union):
UN agency founded 1865. Oldest international organization.
Allocates global spectrum at World Radiocommunication Conferences (WRC).
WRC held every 4 years. WRC-23 completed November 2023.
Sets International Radio Regulations — binding treaty.
Three regions for spectrum allocation:
Region 1: Europe, Africa, Middle East, Russia.
Region 2: Americas.
Region 3: Asia-Pacific.
This is why band allocations differ globally. Each region negotiated different spectrum at WRC.

3GPP (3rd Generation Partnership Project):
Technical body that writes LTE and 5G specifications.
Not a standards body itself — produces technical specifications adopted by regional standards bodies.
Members: ETSI (Europe), ARIB/TTC (Japan), TSDSI (India), ATIS (USA), TCCEP (Korea), CCSA (China).
Release numbering: Release 15 = baseline 5G. Release 16 = 5G-Advanced features. Release 17 = more advanced. Release 18 = 5G-Advanced official name. Release 19 ongoing.

IEEE (Institute of Electrical and Electronics Engineers):
Writes Wi-Fi (802.11) and Ethernet (802.3) standards.
Wi-Fi 802.11 Task Group produces the technical specification.
Wi-Fi Alliance takes IEEE specification and creates consumer certification and marketing (Wi-Fi 6, Wi-Fi 7 names).

Wi-Fi Alliance:
Founded 1999. Owns Wi-Fi trademark.
Certifies device interoperability.
WPA3 certification required for Wi-Fi 6 and later.
Key programs: Wi-Fi CERTIFIED 6, Wi-Fi CERTIFIED 6E, Wi-Fi CERTIFIED 7, Wi-Fi CERTIFIED WPA3.

GSMA (Global System for Mobile Communications Association):
Trade body for mobile network operators globally.
800+ operators, 300+ companies in 220 countries.
Produces technical specifications for SIM/eSIM, roaming frameworks, messaging standards (RCS).
Runs Mobile World Congress annually in Barcelona.

IETF (Internet Engineering Task Force):
Produces internet protocol standards (RFCs).
TCP/IP, HTTP, DNS, DHCP — all IETF standards.
Relevant for Wi-Fi because the network layer above Wi-Fi is entirely IETF standards.

REGIONAL REGULATORY BODIES:

FCC (Federal Communications Commission) — USA:
Independent agency. 5 commissioners appointed by President.
Allocates spectrum. Enforces communications law.
Key regulations relevant to Corvus:
Part 15: Unlicensed devices (Wi-Fi, Bluetooth).
Part 22: Public mobile radio services.
Part 24: Personal Communications Services.
Part 25: Satellite communications.
Part 27: Miscellaneous wireless services.
Part 90: Private land mobile radio.

OFCOM (Office of Communications) — UK:
Regulates UK telecoms, broadcasting, postal services.
Spectrum management post-Brexit independent of EU.
UK opened 6GHz for Wi-Fi use (lower portion only, 5925-6425MHz).
Different from full EU 6GHz opening.

ETSI (European Telecommunications Standards Institute):
European standards body. Produces EN (European Norm) standards.
Harmonized standards required for CE marking.
Key for Wi-Fi: EN 301 893 (5GHz RLAN), EN 300 328 (2.4GHz RLAN).
DFS requirements more stringent in Europe than USA.

European Commission / BEREC:
EC sets framework regulation. BEREC coordinates national regulators.
EECC (European Electronic Communications Code) — 2018 directive.
Net neutrality rules in Europe.
Roaming within EU: No roaming charges since 2017.

ARCEP (France), Bundesnetzagentur (Germany), AGCOM (Italy), CNMC (Spain):
National regulators implementing EU framework.
Each manages national spectrum allocation within EU framework.

ACMA (Australian Communications and Media Authority):
Manages spectrum, telecoms, broadcasting regulation.
Australia opened 6GHz for Wi-Fi (lower portion) 2021.

TRAI (Telecom Regulatory Authority of India):
Spectrum management. Tariff regulation.
India opened 6GHz (lower portion) for Wi-Fi 2024.

MIC (Ministry of Internal Affairs and Communications) — Japan:
Spectrum allocation and telecoms regulation.
Japan opened 6GHz for Wi-Fi 2022.
Japan has unique spectrum allocations in some bands due to historical domestic standards.

MIIT (Ministry of Industry and Information Technology) — China:
Spectrum allocation, equipment approval.
China has NOT opened 6GHz for Wi-Fi as of training cutoff — the 6GHz band is allocated to cellular use (5G/6G research) in China.
This is a significant difference from rest of world.
SRRC (State Radio Regulation of China) — equipment certification body.

ANACOM (Portugal), ANATEL (Brazil):
Brazil: ANATEL regulates spectrum independently.
Brazil opened 6GHz for Wi-Fi 2021.

ISED (Innovation, Science and Economic Development) — Canada:
Canada opened 6GHz for Wi-Fi (full band) 2020 — among first countries globally.
Close alignment with FCC on spectrum decisions.

6GHz WI-FI AVAILABILITY BY COUNTRY (as of training cutoff):
Full 6GHz (5925-7125MHz): USA, Canada, Brazil, Chile, Saudi Arabia, South Korea, UAE.
Lower 6GHz only (5925-6425MHz): UK, most of EU, Australia, Japan, India, Peru, Colombia.
No 6GHz Wi-Fi: China (allocated to cellular), Russia, some others.
This matters for Corvus: Wi-Fi 6E devices behave differently in these regions. A device purchased in the USA may not use 6GHz in the UK. Verify current status at regulator websites — this is changing rapidly.

CHANNEL PLANNING — GLOBAL DIFFERENCES

2.4GHz Channels:
USA/Canada: Channels 1-11 available. Non-overlapping: 1, 6, 11.
Europe: Channels 1-13. Non-overlapping: 1, 5, 9, 13 possible though 1/6/11 still most common.
Japan: Channels 1-14. Channel 14: 802.11b only, legacy. Never used in practice outside Japan.
Rule universally: Adjacent channel interference worse than co-channel. Always use non-overlapping channels.

5GHz Channels and DFS:
UNII-1 (5150-5250MHz, Channels 36-48): Indoor use only in most countries. No DFS required.
UNII-2A (5250-5350MHz, Channels 52-64): DFS and TPC required globally. Radar detection mandated — satellite and weather radar protection.
UNII-2C (5470-5725MHz, Channels 100-144): DFS required. Higher power allowed.
UNII-3 (5725-5850MHz, Channels 149-165):
USA: No DFS, higher power.
Europe: Most channels NOT available. Channels 149-161 not permitted in most of EU. This is a critical difference — American enterprise APs configured for channels 149+ may be illegal in Europe.

DFS (Dynamic Frequency Selection):
Mandatory in most countries for UNII-2 channels.
AP must detect radar signals and vacate channel within 10 seconds.
Causes brief outages — 1-2 minutes to find clear channel.
Problem in environments near airports, weather stations, military.
Solution: Use UNII-1 channels (36-48) for reliable operation in radar-adjacent environments.

RF PROPAGATION — MATERIAL ATTENUATION BY BUILDING TYPE

Attenuation values (approximate):
2.4GHz / 5GHz / 6GHz

Interior drywall: 3dB / 4dB / 5dB.
Exterior drywall with insulation: 5dB / 7dB / 9dB.
Brick (single): 8dB / 10dB / 12dB.
Brick (double): 15dB / 18dB / 22dB.
Poured concrete: 15dB / 20dB / 25dB.
Cinder block / CMU: 12dB / 15dB / 18dB.
Reinforced concrete (rebar): 20dB+ / 25dB+ / 30dB+.
Glass (standard clear): 3dB / 4dB / 5dB.
Low-E glass (common in Europe, energy efficient): 12dB / 15dB / 20dB — significant. Scandinavian and German triple-pane windows: up to 25dB at 5GHz. Buildings become Faraday cages.
Tinted/reflective glass: 10dB / 15dB / 20dB.
Metal (steel door, filing cabinet, elevator): 25dB+ / 30dB+ / 35dB+.
Wood door (hollow core): 3dB / 4dB / 5dB.
Wood door (solid): 5dB / 7dB / 9dB.
Human body: 3dB / 5dB / 6dB.
Dense crowd: 6-10dB / 10-15dB / 12-18dB.
Water: 10dB / 15dB / 18dB.
Vegetation (trees, bushes): 3-5dB / 5-10dB / 7-12dB. Wet vegetation significantly worse.

REGIONAL BUILDING CONSTRUCTION AND RF IMPLICATIONS:

North America (USA/Canada):
Wood frame construction dominant for residential.
Lower attenuation than European masonry.
2.4GHz typically travels 2-3 rooms in residential. 5GHz one room less.
Vapor barriers with metallic coating in new construction create unexpected RF blocking.

Western Europe (UK, Germany, France, Netherlands, Scandinavia):
Masonry construction standard. Brick, concrete block, poured concrete.
Significantly higher attenuation than North American wood frame.
5GHz may not penetrate more than one room in German/Scandinavian concrete construction.
Triple-pane Low-E windows: buildings effectively sealed to RF.
Indoor cellular coverage frequently requires DAS or small cells.
Corvus finding: European buildings with poor Wi-Fi coverage need AP density recommendations appropriate for masonry, not American wood frame assumptions.

Southern Europe (Italy, Spain, Greece):
Thick masonry walls, terracotta tiles, stone construction.
Similar to northern Europe for RF but older buildings often have irregular layouts.
Heat-reflective exterior coatings add attenuation.

Japan:
Mixed construction — reinforced concrete commercial, wood/steel residential.
Earthquake-resistant construction means more structural steel, which increases attenuation.
High building density in urban areas — extreme adjacent-building interference.
Indoor DAS standard in large commercial buildings.

Middle East (UAE, Saudi Arabia, Kuwait):
Glass-and-steel high-rise construction in urban centers.
Heat-reflective glass everywhere — very high RF attenuation.
Indoor 5GHz coverage often poor in modern high-rises.
DAS standard in commercial buildings.
Outdoor coverage excellent — clear line of sight in desert suburban environments.

South Asia (India, Pakistan, Bangladesh):
Mix of modern concrete commercial and older brick/masonry residential.
Urban density extreme in cities like Mumbai, Delhi, Dhaka.
Co-channel interference major issue in dense apartments.
Cellular outdoor coverage good. Indoor penetration poor.

Sub-Saharan Africa:
Varied — modern concrete commercial in cities, mixed materials in residential/rural.
Wi-Fi deployment concentrated in urban and commercial.
Cellular primary connectivity for majority of population.
Outdoor cellular propagation often excellent due to flat terrain.
Rural: cellular coverage sparse, satellite becoming relevant.

Latin America:
Brazil: Concrete and brick residential standard.
Colombia, Chile: Similar masonry construction.
Mexico: Mix — modern concrete commercial, varied residential.
Attenuation profiles similar to southern Europe.

// ═══════════════════════════════════════════════════════
// CORVUS V2 KNOWLEDGE BASE — CHUNK 4 OF 6
// LEGAL FRAMEWORK — GLOBAL + WI-FI TECHNICAL COMPLETE
// ═══════════════════════════════════════════════════════

LEGAL FRAMEWORK — GLOBAL

UNITED STATES — COMPLETE

FCC Part 15 (Unlicensed Devices):
Governs Wi-Fi, Bluetooth, Zigbee, Z-Wave, UWB, and all unlicensed spectrum devices.
Key rules:
Must accept interference from other devices.
Must not cause harmful interference to licensed services.
Devices must be FCC certified before sale in USA.
Maximum power: 1W EIRP for 2.4GHz Wi-Fi point-to-point, 200mW for 5GHz (varies by channel), 1W for 6GHz indoor, 250mW for 6GHz standard power outdoor (AFC required).
AFC (Automated Frequency Coordination): Required for 6GHz standard power operation. Database checks that operation won't interfere with incumbents.

Communications Act of 1934 (47 USC):
Foundation of US communications law.
Section 605: Prohibits unauthorized interception of radio communications.
Receiving cellular signals: generally legal for personal use.
Decoding/publishing cellular traffic content: illegal.

Electronic Communications Privacy Act (ECPA) 1986 (18 USC 2510-2522):
Wiretap Act (Title I): Prohibits real-time interception.
Stored Communications Act (Title II): Protects stored data.
Pen Register Act (Title III): Metadata collection rules.
Corvus operates entirely within legal bounds: reads beacon frames (public broadcast), device-reported metrics (your own device's data), never intercepts communications content.

Computer Fraud and Abuse Act (CFAA) 18 USC 1030:
Prohibits unauthorized access to protected computers. Any internet-connected device qualifies.
Connecting to a Wi-Fi network without authorization: illegal under CFAA.
Passive RF scanning: not access — legal.
Van Buren v. United States (2021 Supreme Court): Narrowed CFAA — exceeds authorized access means accessing data you are not permitted to access.

Wi-Fi Scanning Legality:
Passive scanning (listening to beacon frames): Legal everywhere in the US. Beacon frames are publicly broadcast.
Active scanning (probe requests): Legal. This is how every device finds Wi-Fi networks.
Capturing data frames from networks you don't own: Illegal under the Wiretap Act (18 USC 2511).
Key case: Joffe v. Google (9th Circuit 2013): Google Street View cars collected payload data from open Wi-Fi networks. Court left unresolved whether open Wi-Fi is readily accessible to the public.
Corvus never captures payload data. Management frames only. This is legal, passive, and exactly what every commercial Wi-Fi analyzer does.

Cellular Signal Monitoring Legality:
Reading your own device's signal metrics (RSRP, RSRQ, SINR): Completely legal. This is your device reporting its own status.
Passive monitoring of cellular signals with software defined radio: Legal for research and testing under Part 15.
Decoding cellular traffic: Illegal under 47 USC 605 and ECPA for voice.
Corvus reads device-reported metrics only via Android TelephonyManager API. Same data your carrier shows in diagnostic menus. 100% legal.

HIPAA Security Rule (45 CFR Part 164):
Applies to Covered Entities and Business Associates handling PHI.
Wireless network requirements:
Required: Encryption in transit for all ePHI.
Addressable: Automatic logoff, unique user identification, access controls, audit controls.
Minimum acceptable: WPA2-Enterprise with RADIUS.
Preferred: WPA3-Enterprise.
Guest network: Must be completely isolated from PHI networks on separate VLAN with ACL restrictions.
Corvus finding in healthcare: Open network or WPA2-Personal on any network that could carry ePHI = HIPAA finding. Flag it every time.

PCI DSS v4.0:
Requirement 11.2.1: Maintain inventory of trusted wireless access points.
Requirement 11.2.2: Scan for unauthorized wireless access points. Quarterly minimum.
Requirement 4.2.1: Encrypt cardholder data in transit over open/public networks.
Requirement 1.3.2: Restrict wireless networks from cardholder data environment.
WPA3 strongly recommended. WPA2-Enterprise minimum.
WEP or WPA: Immediate critical finding. Not compliant.
Corvus finding in retail: Any POS-adjacent network running deprecated security or without rogue AP detection = PCI finding.

CIPA (Children's Internet Protection Act) — 47 USC 254:
Schools and libraries receiving E-Rate funds must certify they have technology protection measures for minors.
Content filtering required on all internet-accessible wireless networks used by minors.
Annual E-Rate certification required.
Corvus finding in education: Unfiltered guest network accessible by students = CIPA compliance risk.

FERPA (Family Educational Rights and Privacy Act) — 20 USC 1232g:
Protects student education records.
Indirectly requires appropriate network security for systems containing student records.
Any network carrying student data must be secured against unauthorized access.

E-Rate Program (FCC):
Subsidizes internet and networking for schools and libraries.
Category 1: Internet access — 20-90% discount.
Category 2: Internal connections including Wi-Fi — 20-90% discount.
Poverty level determines discount percentage.
5-year minimum service life for Category 2 equipment.
Wi-Fi survey work required to justify equipment purchases.
Category 2 budget: $167/student over 5 years (updated periodically by FCC).
OCWS opportunity: Provide pre-application Wi-Fi surveys that document current state and justify E-Rate funding requests.

FirstNet:
Band 14 (758-768 MHz / 788-798 MHz) — dedicated to first responders.
AT&T is the network operator under contract with FirstNet Authority.
Priority and preemption: First responders get network access even when commercial traffic is congested.
Venues over certain size may be required to provide FirstNet coverage.
Corvus finding: Any public safety facility without Band 14 coverage is a finding worth flagging.

State Laws — Key Jurisdictions:

Florida (OCWS home state):
Florida Computer Crimes Act (F.S. 815.01-815.07): Prohibits unauthorized access to computer systems. Passive RF monitoring not covered.
Florida Security of Communications Act (F.S. 934): State analog to Wiretap Act. Same scope.

California:
California Invasion of Privacy Act (CIPA) — Penal Code 630-638: Broader than federal wiretap. Applies to confidential communications.
CCPA (California Consumer Privacy Act): If Corvus processes any California user data, data handling requirements apply. Right to know, right to delete, right to opt-out of sale.

Texas:
Texas Penal Code 16.02: Electronic interception law.
Texas Computer Crimes Act: Similar to federal CFAA. No additional wireless-specific restrictions.

New York:
New York Penal Law Article 250: Wiretapping.
New York PHL 4406-d: Healthcare information privacy (state HIPAA equivalent).

Illinois:
Illinois Eavesdropping Act: Two-party consent for recordings. Applies to oral communications. Not to passive RF scanning.

EUROPEAN UNION

GDPR (General Data Protection Regulation — EU 2016/679):
Effective May 25, 2018. Applies to processing of EU residents' personal data.
Wi-Fi scanning relevance: MAC addresses are personal data under GDPR if they can identify an individual.
Commercial Wi-Fi analytics that track device MACs require: Legal basis, privacy notice, data retention limits, data subject rights (access, deletion, portability).
Corvus single-time diagnostic scan without storing MAC addresses likely falls under legitimate interest.
Persistent tracking of MAC addresses requires consent.
GDPR penalties: Up to €20M or 4% of global annual turnover, whichever is higher.

ePrivacy Directive (2002/58/EC):
Governs electronic communications privacy.
Requires consent for cookies and similar tracking technologies.

Radio Equipment Directive (RED — 2014/53/EU):
CE marking required for all radio equipment sold in EU.
Essential requirements: Health/safety, EMC, radio spectrum efficiency.

UNITED KINGDOM (POST-BREXIT)

UK GDPR (retained EU law, amended):
Functionally identical to EU GDPR. ICO (Information Commissioner's Office) enforces.
UK adequacy decision from EU allows data flows UK<->EU.

UK Communications Act 2003: OFCOM powers. Spectrum management.
Wireless Telegraphy Act 2006: Spectrum licensing. Using a radio scanner to receive communications: legal in UK. Disclosing content of intercepted communications: illegal.
Investigatory Powers Act 2016: Government surveillance powers. Not relevant to commercial diagnostic scanning.

AUSTRALIA

Privacy Act 1988 (amended):
Applies to businesses with >$3M turnover or certain categories.
Australian Privacy Principles (APPs) govern data handling.
MAC addresses: personal information if linkable to individual.

Telecommunications (Interception and Access) Act 1979:
Prohibits interception of communications in transmission. Passive scanning of management frames: legal.

Radiocommunications Act 1992:
ACMA administers. Spectrum licensing.
Wi-Fi covered by Radiocommunications (Low Interference Potential Devices) Class Licence.

CANADA

PIPEDA (Personal Information Protection and Electronic Documents Act):
Federal private sector privacy law.
MAC addresses: personal information under PIPEDA.
Bill C-27 (proposed CPPA) pending to modernize PIPEDA.
CASL (Canada's Anti-Spam Legislation): Commercial electronic messages require consent.

INDIA

Information Technology Act 2000 (amended 2008):
Governs cyber offenses. Section 66: Computer related offenses. Section 43: Unauthorized access penalties.
Digital Personal Data Protection Act 2023: India's comprehensive data protection law. Implementation rules pending.
Telecom Act 2023: New framework replacing Indian Telegraph Act 1885.

JAPAN

Act on Protection of Personal Information (APPI):
Amended 2022. Comprehensive privacy framework.
MAC addresses: personal information if linkable to individual.
Telecommunications Business Act: Governs communications providers.
Radio Act: Spectrum management under MIC. Unauthorized use of radio equipment: criminal offense.

CHINA

Cybersecurity Law (网络安全法) 2017:
Requires localization of certain data. Network security obligations for operators.
Personal Information Protection Law (PIPL) 2021: China's GDPR equivalent. Comprehensive.
Data Security Law (DSL) 2021: Classifies data by importance. Graduated obligations.
Regulations on Radio Administration: MIIT administers. Stringent equipment approval (SRRC).
Scanning or monitoring wireless communications without authorization: serious offense in China.
Corvus operating in China: significant legal complexity. User should consult local legal counsel.

BRAZIL

LGPD (Lei Geral de Proteção de Dados) 2020:
Brazil's comprehensive data protection law. GDPR-influenced.
ANPD (Autoridade Nacional de Proteção de Dados) enforces.
MAC addresses: personal data under LGPD.
Marco Civil da Internet (Internet Civil Rights Framework) 2014: Net neutrality. Data localization. User rights.

SOUTH KOREA

Personal Information Protection Act (PIPA):
Among strictest data protection laws globally. Explicit consent required for collection.
Korea has among most advanced spectrum policy globally — first 5G commercial launch reflects this.

WI-FI TECHNICAL KNOWLEDGE — COMPLETE AND EXPANDED

SECURITY PROTOCOLS — COMPLETE

WEP (Wired Equivalent Privacy) — 1997:
Broken. Do not use. RC4 encryption with static keys. Crackable in under 5 minutes with modern tools. IV collisions reveal key material.
Corvus finding: Any network running WEP = critical. Shut down immediately. Replace.

WPA (Wi-Fi Protected Access) — 2003:
Transitional. TKIP encryption. Patched WEP weaknesses but TKIP itself has vulnerabilities. Acceptable in 2003. Unacceptable in 2026.
Corvus finding: WPA with TKIP = critical finding. Replace.

WPA2-Personal (PSK) — 2004:
AES/CCMP encryption. Significant improvement over WPA.
Vulnerable to: offline dictionary attacks if weak passphrase, PMKID attack, KRACK (Key Reinstallation Attack — patched in most devices).
Acceptable for home networks with strong passphrase. Not appropriate for business networks with sensitive data.

WPA2-Enterprise (802.1X/RADIUS) — 2004:
Each user authenticates with unique credentials. No shared password.
RADIUS server validates credentials.
EAP methods: EAP-TLS (certificates, most secure), EAP-PEAP (username/password with TLS tunnel), EAP-TTLS, EAP-FAST.
Required for: HIPAA-adjacent networks, PCI environments, enterprise deployments with sensitive data.
Corvus finding: Any healthcare or financial network without 802.1X = significant finding.

WPA3-Personal (SAE) — 2018:
SAE (Simultaneous Authentication of Equals) replaces PSK 4-way handshake.
Eliminates offline dictionary attacks. Forward secrecy. Dragonfly handshake.
Backward compatible with WPA2 devices in transition mode.
Required for Wi-Fi 6 and Wi-Fi 7 certification. Should be standard for all new deployments in 2026.

WPA3-Enterprise — 2018:
192-bit security mode for highest sensitivity environments.
Required for: government, defense, national security. Overkill for most commercial.
Suite B cryptography (AES-256, SHA-384).

OWE (Opportunistic Wireless Encryption) — 2018:
Encryption for open networks without authentication.
Protects against passive eavesdropping even without password.
Appearing on: airport, hotel, coffee shop networks.
Corvus finding: Open networks without OWE in 2026 = unnecessary exposure. Flag it.

Management Frame Protection (802.11w):
Protects management frames from spoofing.
Without 802.11w: deauth attacks trivially execute.
Required for WPA3. Optional for WPA2.
Corvus finding: WPA2 networks without MFP in healthcare or financial environments = finding.

ROAMING PROTOCOLS:
802.11k: Neighbor reports — AP tells client which other APs are nearby. Enables smart roaming decisions.
802.11r: Fast BSS Transition — pre-authenticates with neighboring APs before roaming. Reduces handoff from 50-100ms to under 10ms. Critical for VoIP and video calls.
802.11v: BSS Transition Management — AP can suggest or force client to roam to better AP. Enables load balancing.
All three together = enterprise-grade roaming. Required for hospital, hotel, campus deployments.

WI-FI 6 TECHNICAL DEPTH:
OFDMA (Orthogonal Frequency Division Multiple Access):
Borrowed from LTE. Divides channel into resource units (RUs). Multiple clients served simultaneously on same channel. Unlike Wi-Fi 5 where one client used entire channel at a time. Critical improvement for dense environments — classrooms, stadiums, offices.

BSS Coloring:
Assigns a color (number) to each BSS (Basic Service Set). Devices can detect same-channel transmissions from other BSSes and ignore them if different color. Dramatically reduces unnecessary deferrals in dense Wi-Fi environments. First time Wi-Fi handled interference intelligently rather than just avoiding it.

Target Wake Time (TWT):
AP schedules when each device wakes up to communicate. IoT devices and smartphones sleep between scheduled windows. Battery life improvement: up to 7x for IoT devices. Critical for battery-powered sensors, wearables, smart home devices.

MU-MIMO in Wi-Fi 6:
8x8 MU-MIMO (vs 4x4 in Wi-Fi 5). Serves 8 clients simultaneously on downlink. Uplink MU-MIMO new in Wi-Fi 6 — Wi-Fi 5 only had downlink MU-MIMO.

NETWORK ARCHITECTURE FOR ENTERPRISES:

Recommended VLAN structure:
VLAN 10: Staff — full access, authenticated (802.1X or WPA2/3-Enterprise).
VLAN 20: Corporate devices — managed endpoints.
VLAN 30: Guest — internet only, isolated, captive portal.
VLAN 40: IoT/Devices — printers, displays, sensors — isolated.
VLAN 50: Security cameras — isolated, QoS prioritized.
VLAN 60: VoIP — isolated, QoS prioritized, low latency.
VLAN 70: POS/Payment — completely isolated, PCI DSS compliant.

Never mix staff and guest on same VLAN. Never put printers on staff VLAN — printer exploit risk. Never put POS on any shared VLAN.

QoS (Quality of Service):
Voice traffic: WMM Voice (AC_VO) — highest priority. DSCP EF (46).
Video traffic: WMM Video (AC_VI). DSCP AF41 (34).
Best effort: WMM Best Effort (AC_BE). DSCP 0.
Background: WMM Background (AC_BK) — lowest priority.
VoIP requires: < 150ms one-way latency, < 30ms jitter, < 1% packet loss.
Corvus finding: VoIP network without QoS configured = finding regardless of signal strength.

// ═══════════════════════════════════════════════════════
// CORVUS V2 KNOWLEDGE BASE — CHUNK 5 OF 6
// EMERGING TECHNOLOGIES + EDTECH COMPLETE
// ═══════════════════════════════════════════════════════

EMERGING TECHNOLOGIES — COMPLETE

WI-FI 7 (802.11be) — 2024:

Multi-Link Operation (MLO):
Device connects to multiple bands simultaneously and aggregates them.
Phone can be on 2.4GHz + 5GHz + 6GHz all at once.
First time Wi-Fi works like carrier aggregation in cellular.
Latency improvement: if one link is congested, traffic shifts to less congested link automatically.
Reliability improvement: redundant paths.
Real world: Wi-Fi 7 router + Wi-Fi 7 device = dramatically more consistent performance in congested environments.

320MHz Channel Width:
Double Wi-Fi 6's 160MHz maximum.
Only practical in 6GHz band where channel space exists.
USA: full benefit possible. EU: limited benefit (smaller 6GHz allocation).

4096-QAM (4K-QAM):
12 bits per symbol vs Wi-Fi 6's 10 bits (1024-QAM).
20% more data per transmission at same signal conditions.
Requires excellent signal quality — close to AP, clear signal.

Multi-RU Puncturing:
Can skip occupied sub-channels within wide channel.
Transmit on 320MHz channel even if 20MHz sub-channel is occupied.
Dramatically improves spectral efficiency in congested spectrum.

Expected real-world improvement: 2-5x throughput vs Wi-Fi 6 in dense environments. Latency halved typical.

WI-FI 8 (802.11bn) — Expected 2028:
Coordinated Multi-AP: Multiple APs cooperate rather than compete.
Synchronized transmissions to eliminate inter-AP interference.
Current Wi-Fi: every AP treats every other AP as interference.
Wi-Fi 8: APs coordinate — scheduling, power, timing.
Expected to transform dense deployment performance.
Specification in early development as of 2024.

5G ADVANCED (3GPP Release 18) — 2024:
AI/ML in the air interface: Network uses machine learning to optimize scheduling, beam management, interference coordination.
RedCap (Reduced Capability) for IoT: 5G for lower-power devices. Between eMTC and full 5G.
Enhanced MIMO for indoor positioning: Sub-meter accuracy for indoor location services.
Uplink improvements: Release 18 addresses uplink performance significantly.
Sidelink enhancements: Device-to-device communication without network involvement. Relevant for public safety, vehicular.

5G ADVANCED (3GPP Release 19) — Expected 2025-2026:
Further AI/ML integration. 6GHz spectrum for 5G in some regions. Enhanced positioning. NTN (Non-Terrestrial Networks) — satellite and high-altitude.

6G — EXPECTED COMMERCIAL 2030:
3GPP Release 21 expected to be baseline 6G specification.
ITU-R IMT-2030 framework approved 2023.

Technical targets:
Peak data rate: 1 Tbps (vs 5G's 20 Gbps theoretical).
User experienced data rate: 1 Gbps everywhere.
Latency: 0.1ms air interface (vs 1ms for 5G).
Reliability: 10^-7 error rate.
Energy efficiency: 100x improvement over 5G.
Positioning: centimeter-level accuracy.
Sensing: integrated communication and sensing.

Key technical approaches:
Sub-terahertz (100-300GHz): Enormous bandwidth. Range measured in meters. Indoor use cases. Research ongoing.
AI-native air interface: Unlike 5G where AI was added on top, 6G designed with AI as fundamental component.
ISAC (Integrated Sensing and Communications): Network simultaneously provides connectivity AND acts as radar/sensor. Traffic detection, environmental monitoring, gesture recognition.
Semantic communications: Instead of transmitting bits, transmit meaning. Compression based on understanding not just data.
Zero-energy devices: Harvest energy from RF signals.

6G Global Race:
China: Largest 6G research investment. IMT-2030 targets aligned.
USA: Next G Alliance, FCC exploring spectrum above 95GHz.
Europe: Hexa-X project. €250M+ in research.
Japan: B5G/6G promotion consortium. 2030 commercial target.
South Korea: Samsung, LG, government funding. 2030 target.

Corvus on 6G questions: "The specification isn't final. What I know is the direction, not the destination. Check IEEE and 3GPP for current status."

DIRECT-TO-CELL SATELLITE:

T-Mobile + SpaceX Starlink:
SMS service beta launched 2024. Uses Band 71 (600MHz) spectrum T-Mobile owns.
Satellites serve as very distant cell towers. Theoretical coverage: anywhere with sky view.
Bandwidth: shared among many users. Not a substitute for terrestrial cellular.
Full voice and data planned — timeline uncertain.

AST SpaceMobile:
Partnered with AT&T, Verizon, Rakuten. Much larger satellites.
Targets broadband speeds directly to standard phones. Launches ongoing 2024-2025.

OneWeb/Eutelsat: Low Earth Orbit broadband. Primarily enterprise and government.

Implications for Corvus diagnostics:
Dead zones in remote areas may eventually be served by satellite.
Current: treat satellite cellular as supplement, not replacement.
Latency (20-100ms) higher than terrestrial cellular but dramatically better than geostationary (600ms+).

WI-FI SENSING (802.11bf):
Standard finalized 2024. Uses existing Wi-Fi signals for sensing without separate radar hardware.
Applications: presence detection, motion sensing, breathing rate, fall detection, gesture control.
Range: 10-30m typical sensing range. Works through walls.
Privacy implications: passive sensing of building occupancy possible.
GDPR/privacy law implications being debated globally.
Corvus on 802.11bf: "Your router can now see you move. Whether that's exciting or terrifying depends on who owns the router."

ULTRA-WIDEBAND (UWB):
IEEE 802.15.4a/4z standard. Centimeter-level precision positioning.
Very short range (10-50m), very low power.
Pulsed signal across wide frequency range (3.1-10.6GHz typically).
Products: Apple U1/U2 chips (iPhone 11+, AirTag), Samsung Galaxy UWB, car key systems.
Applications: Precision indoor location, secure proximity detection, contactless payments with direction.
Not Wi-Fi. Not cellular. Separate radio technology.

MATTER AND THREAD (Smart Home):

Matter (formerly CHIP — Connected Home over IP):
Unified smart home standard. Apple/Google/Amazon/Samsung backed.
Runs over Wi-Fi and Thread. IPv6 based. Local control — no cloud required for basic operation.
Addresses the fragmentation problem in IoT.

Thread:
802.15.4 based mesh networking protocol. Low power. Self-healing mesh.
Used by: Apple HomePod/Apple TV as border routers, Google Nest devices, many IoT sensors.
Operates at 2.4GHz. Low power consumption — coin cell batteries last years.
Corvus should know Thread devices add to 2.4GHz environment.

LI-FI (IEEE 802.11bb — 2023):
Data transmission using visible light (LEDs). Gigabit speeds theoretically achievable.
Range: line of sight only, within room.
Limitations: doesn't work in sunlight, blocked by any obstruction, no mobility without coverage gaps.
Commercial products exist (pureLiFi, Signify/Philips).
Corvus on Li-Fi: "Works until you walk under the light. Which is fine if you're a lamp."

OPEN RAN:
Traditional RAN: single vendor for baseband and radio.
O-RAN Alliance: open interfaces between RAN components. Allows mixing vendors.
Software-defined, cloud-native, AI-managed.
US government backing — domestic supply chain concerns re: Huawei.
Rakuten Mobile (Japan) built first commercial network on Open RAN.
DISH/EchoStar built US 5G network on Open RAN.
Benefits: cost reduction, innovation, vendor diversity.
Challenges: integration complexity, performance vs proprietary systems.

PRIVATE 5G / CBRS (EXPANDED):
Use cases: Industrial IoT, healthcare, warehouses, campus, ports, mining.
Vendors: Ericsson, Nokia, CommScope, Celona, Baicells, Federated Wireless.
Corvus Private 5G finding: Diagnose as enterprise cellular. RSRP/RSRQ metrics apply. SAS registration status affects availability.

EDTECH KNOWLEDGE — COMPLETE

CLASSROOM WI-FI DESIGN:

Device density requirements:
1:1 device program: minimum 1 AP per classroom, preferably 1 per 25-30 active devices.
BYOD: varies. Assume 1.5 devices per student.
High school: smartphones + laptops = 2 devices per student.
Video streaming at scale: 5-8 Mbps per student for HD.
25-student classroom streaming HD: 125-200 Mbps required bandwidth.

AP placement:
Mount on ceiling, center of room when possible. Height: 9-12 feet ideal.
Too high = coverage umbrella problem — signal goes out not down.
Avoid mounting near: HVAC ducts, metal light fixtures, cable trays, structural steel.
Avoid mounting behind whiteboards, screens, or displays.

Band steering:
Force capable devices to 5GHz. Leave 2.4GHz for older devices and IoT.
6GHz for newest Chromebooks and devices if Wi-Fi 6E/7.

Channel plan for schools:
Plan by building not by room. Adjacent classrooms must be on non-overlapping channels.
Map the building, assign channels to minimize co-channel interference.
5GHz: 36, 40, 44, 48 (UNII-1, no DFS, reliable) for primary channels.
Add 52-64 if more capacity needed with radar awareness.
Never put adjacent classrooms on overlapping 2.4GHz channels.

CHROMEBOOK SPECIFIC BEHAVIOR:
802.11k/r/v: Supported on all Chromebooks since 2018.
Aggressive roaming: Will roam earlier than iOS or Windows.
SSID limit: Some older Chromebooks struggle with more than 8 SSIDs broadcast. Reduce SSIDs if possible.
5GHz preference: Modern Chromebooks 5GHz-first.
IPv6: Chromebooks handle IPv6 well. Enable dual-stack.
Proxy: Google Admin Console can push proxy settings. Mis-configured proxy = no network despite connected status.

IPAD IN EDUCATION:
iOS Wi-Fi behavior: prefers known networks, aggressive roaming.
MDM (Mobile Device Management): Jamf, Mosyle, Microsoft Intune common in education.
MDM can push Wi-Fi profiles silently. Supervised devices can join hidden SSIDs via MDM.

WINDOWS DEVICES IN EDUCATION:
Group Policy can manage Wi-Fi settings. 802.1X configuration via GPO.
Windows tends to be less aggressive at roaming than iOS or Chrome.
Can be configured to force band preference.

NETWORK ARCHITECTURE FOR SCHOOLS:

Recommended VLAN structure:
VLAN 10: Staff — full access, authenticated (802.1X or WPA2/3-Enterprise).
VLAN 20: Student — internet + filtered school resources (WPA2/3-Personal or 802.1X).
VLAN 30: Guest — internet only, isolated, captive portal.
VLAN 40: IoT/Devices — printers, displays, sensors — isolated.
VLAN 50: Security cameras — isolated, QoS prioritized.
VLAN 60: VoIP — isolated, QoS prioritized, low latency.

Never mix student and staff on same VLAN.
Never put printers on student VLAN — printer exploit risk.

CONTENT FILTERING:
CIPA requires it for E-Rate recipients.
Common solutions: Cisco Umbrella, Fortinet, Meraki, Zscaler, GoGuardian (Chromebook-specific), Securly.
DNS-based filtering: Easy to implement, easy to bypass.
SSL inspection: More effective, complex, privacy concerns.
Agent-based (GoGuardian): Most effective for managed devices.

E-RATE PROGRAM DETAILS:
Form 471: Filed by school/library, requests funding.
Form 486: Confirms service delivery, activates funding.
SPIN (Service Provider Identification Number): Every E-Rate service provider must have one.
Discount matrix: Based on free/reduced lunch percentage and urban/rural classification.
Urban: 20-80% discount. Rural: 25-90% discount.
Category 2 budget: $167/student over 5 years (updated periodically by FCC).
Wi-Fi survey work: Required to justify Category 2 applications.
OCWS opportunity: Provide pre-application Wi-Fi surveys that document current state and justify E-Rate funding request. Schools are a defined, recurring revenue customer segment.

FERPA IN PRACTICE:
Student Wi-Fi usage logs: May contain personal information.
Network access logs showing student browsing: FERPA protected if combined with student identifier.
Recommendation: Anonymize network logs after 30 days.
Share logs with law enforcement only under FERPA exceptions.
Corvus finding: School network logging student personally identifiable browsing data without data governance policy = risk.

HIGHER EDUCATION SPECIFIC:
University networks: More complex than K-12. Research networks, student housing, athletic facilities, clinical facilities.
eduroam: Global Wi-Fi roaming consortium for education. 802.1X based. Student can use their home institution credentials at any eduroam member institution worldwide. If Corvus detects eduroam SSID — it's a properly configured 802.1X network by definition.
ResNet (residential network): Student housing Wi-Fi. High density. Gaming, streaming, video calls dominate. Different design requirements than academic buildings.
Clinical/medical school facilities: HIPAA applies if patient data present. Same requirements as healthcare.
Research networks: May have specialized requirements — isolated VLANs for sensitive research, high bandwidth for data transfer.
Corvus finding in higher education: eduroam SSID with poor signal = finding worth escalating. Students roaming from their dorm to class deserve seamless handoff.

CAMPUS ENTERPRISE TIER SPECIFIC (CORVUS PRODUCT):
Student seats: 3 verdicts/month, unlimited Talk to Corvus, no Reckoning, no rollover.
Faculty seats: 15 verdicts/month, full Reckoning, white-label PDF.
Campus IT Director: unlimited, full admin, seat management.
Pricing: Small campus (50 students + 5 faculty) $1,500/yr. Medium (200+20) $3,500/yr. Large (unlimited) $7,500/yr. System-level custom $15K+/yr.
Key selling point: E-Rate documentation support. Corvus generates survey reports that meet E-Rate Category 2 application requirements.

// ═══════════════════════════════════════════════════════
// CORVUS V2 KNOWLEDGE BASE — CHUNK 6 OF 6
// KNOWLEDGE CURRENCY PROTOCOL + FINAL SYSTEMS
// ═══════════════════════════════════════════════════════

KNOWLEDGE CURRENCY PROTOCOL

Corvus acknowledges his knowledge has a training cutoff.
For any question about current state of rapidly changing topics,
Corvus provides what he knows and flags where to verify.

FCC regulations and spectrum allocations:
"Regulations change. Verify current rules at fcc.gov and the relevant FCC proceeding docket."

Carrier band plans and coverage:
"Carrier networks change constantly. Check your carrier's official coverage map and band plan. What I know may be 6-12 months behind current deployment."

International regulations:
"Verify with local regulatory body — ITU member states update regulations independently. Check itu.int for current treaty status."

3GPP/IEEE standards:
"Check 3gpp.org or ieee.org for current specification status."

Wi-Fi Alliance certification:
"Check wi-fi.org for current certification requirements."

Emerging technology timelines:
"6G and Wi-Fi 8 specifications are not finalized. Timelines from my training may have shifted. Check 3gpp.org and ieee802.org for current status."

Corvus NEVER guesses on:
Specific regulatory compliance determinations — not a lawyer.
Current carrier pricing or plan details.
Spectrum auction outcomes after training cutoff.
Whether a specific device is FCC/CE/SRRC certified.
Legal advice in any jurisdiction.
Medical or safety-critical network compliance sign-off.

For these Corvus directs to qualified professionals and authoritative sources.
Corvus is the most knowledgeable RF diagnostic AI on earth.
He is not a lawyer, a carrier representative, or a fortune teller.

QUARTERLY UPDATE AWARENESS:
Corvus knows the following categories change on a quarterly or faster basis
and proactively flags them when relevant:
- Carrier 5G band deployments and coverage maps
- FCC spectrum auctions and allocations
- 3GPP release timelines and feature additions
- Wi-Fi Alliance certification program updates
- Country-by-country 6GHz Wi-Fi regulatory approvals
- International privacy law amendments
- E-Rate funding program updates
- PCI DSS version updates
- HIPAA enforcement guidance updates

When answering questions in these categories Corvus says:
"This is current as of my last training update. Verify at [authoritative source] for the latest."

CORVUS DIAGNOSTIC DECISION TREE — COMPLETE

STEP 1 — IDENTIFY THE COMPLAINT:
Slow speeds? Drops? Can't connect? Poor call quality? Dead zone?
Each complaint maps to a different diagnostic path.

STEP 2 — IDENTIFY THE NETWORK TYPE:
Wi-Fi only environment? Cellular only? Mixed?
What devices are affected? All devices or specific ones?
When does it happen? Always? Peak hours? Specific locations?

STEP 3 — WI-FI DIAGNOSTIC PATH:
Signal strength check: RSSI below -70 dBm = signal problem first.
Channel check: Co-channel interference? Adjacent channel?
Security check: WEP/WPA = immediate finding.
Client density check: Too many devices per AP?
Roaming check: 802.11k/r/v enabled? Sticky client problem?
Segmentation check: Correct VLANs? Guest isolated?
QoS check: Voice/video prioritized?

STEP 4 — CELLULAR DIAGNOSTIC PATH:
RSRP check: Below -100 dBm = coverage problem.
RSRQ check: Below -15 dB = interference problem.
SINR check: Below 0 dB = severe interference.
Band check: What band is device on? Is better band available?
Handoff check: Is device transitioning networks during complaint?
Building check: Is building attenuating signal?
Congestion check: Peak hours only = capacity problem not coverage.

STEP 5 — COMBINED DIAGNOSTIC PATH:
Is the problem a handoff failure? Most connectivity complaints are.
Map Wi-Fi coverage against cellular coverage.
Identify dead zones where both fail.
Identify handoff zones where transition is causing degradation.
Recommend: AP extension, small cell, DAS, or carrier booster.

STEP 6 — FINDINGS AND RECOMMENDATIONS:
Severity classification:
Critical: Security breach, complete outage, regulatory violation.
Warning: Degraded performance, sub-optimal configuration, roaming issues.
Info: Best practice improvements, upgrade recommendations.
Good: Confirming what's working correctly — Corvus acknowledges good work.

Every finding must have:
A specific observed condition (not a generic complaint).
A specific recommended action (not a generic suggestion).
A priority level.
An estimated impact of fix.

Corvus never delivers a finding without a fix.
Corvus never delivers a fix without understanding the finding.
That is the Verdict. That is always the Verdict.

RF PHYSICS FUNDAMENTALS — CORVUS KNOWS THESE COLD

THE INVERSE SQUARE LAW:
Signal power decreases with the square of distance.
Double the distance = signal drops to 1/4 strength (6 dB loss).
This is why moving 10 feet from an AP matters enormously at weak signal levels.
Corvus uses this to estimate AP placement requirements from scan data.

FREE SPACE PATH LOSS:
FSPL (dB) = 20log10(d) + 20log10(f) + 20log10(4π/c)
Where d = distance in meters, f = frequency in Hz.
Higher frequency = more path loss at same distance.
This is why 5GHz has shorter range than 2.4GHz.
This is why mmWave 5G has range measured in meters.
Corvus applies this when interpreting signal readings.

MULTIPATH PROPAGATION:
Signal arrives at receiver via multiple paths — direct plus reflections.
Paths arrive at different times — causes interference (ISI).
OFDM (used in LTE and Wi-Fi) was designed specifically to handle multipath.
Guard intervals between symbols prevent inter-symbol interference.
Beamforming exploits multipath constructively — focuses energy toward device.
Corvus knows multipath is why metal buildings can sometimes have better indoor cellular than expected — reflections add up constructively.

FRESNEL ZONE:
Elliptical zone around line-of-sight path between transmitter and receiver.
First Fresnel zone should be 60% clear for optimal link performance.
Obstruction in Fresnel zone causes diffraction losses beyond simple path loss.
Relevant for: outdoor point-to-point Wi-Fi links, microwave backhaul.
Corvus applies this for outdoor coverage assessments.

ANTENNA GAIN AND PATTERNS:
Omnidirectional antenna: radiates equally in all directions horizontally. Typical for AP antennas.
Directional antenna: concentrates energy in specific direction. Used for point-to-point links, sector coverage.
Gain measured in dBi (relative to isotropic radiator).
Higher gain = more focused beam = longer range in that direction but narrower coverage.
EIRP (Effective Isotropic Radiated Power) = transmit power + antenna gain - cable losses.
Corvus uses antenna knowledge to explain why sector antennas on outdoor APs behave differently than omni indoor APs.

NOISE FLOOR:
Every RF environment has a noise floor — the background RF energy level.
Typical indoor noise floor: -90 to -95 dBm.
Signal must be sufficiently above noise floor to be decoded.
SNR (Signal to Noise Ratio) = signal level - noise floor.
Minimum SNR for Wi-Fi: 10 dB for basic connectivity, 25+ dB for maximum throughput.
High noise floor (above -85 dBm): indicates significant interference.
Corvus flags elevated noise floor as a finding — it compresses usable range and reduces throughput even when signal appears adequate.

CHANNEL CAPACITY — SHANNON'S THEOREM:
C = B × log2(1 + S/N)
Channel capacity (C) is limited by bandwidth (B) and SNR (S/N).
More bandwidth = more capacity. Better SNR = more capacity.
This is why 160MHz channels beat 80MHz channels (double bandwidth).
This is why 6GHz with less interference beats congested 5GHz.
This is why Corvus recommends improving SNR before adding bandwidth.
Corvus understands Shannon limits — no amount of antenna tricks exceeds the theoretical maximum.

CORVUS LEGAL COMPLIANCE STATEMENT:
Corvus is an RF intelligence engine. He diagnoses wireless environments using:
1. Passive observation of publicly broadcast beacon frames and management frames.
2. Device-reported signal metrics from the user's own device.
3. GPS location data provided by the user's device with user permission.

Corvus never:
Connects to networks he doesn't own.
Captures data frame content from any network.
Intercepts communications content.
Stores personally identifiable information beyond the immediate session.
Makes legal compliance determinations — he identifies technical conditions, not legal violations.

When Corvus identifies a condition that may constitute a regulatory violation
(open network in healthcare, deprecated security in retail, unfiltered network in school),
he flags the technical condition and recommends consulting qualified professionals
for compliance determination.

Corvus is the most knowledgeable RF diagnostic AI on earth.
He knows the history, the physics, the standards, the regulations, and the field.
He delivers Verdicts. He renders findings. He prescribes fixes.
He does not practice law, medicine, or fortune telling.
That has always been the deal.
That will always be the deal.
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
