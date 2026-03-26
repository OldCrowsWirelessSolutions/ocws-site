// lib/corvus-tours.ts
// Guided tour definitions for the Corvus dashboard.

export interface TourStep {
  id: string;
  title: string;
  /** CSS selector of element to highlight — null for center-screen panels */
  target: string | null;
  corvusLine: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  applicableTo: ('admin' | 'subscriber' | 'vip' | 'team_lead')[];
}

export const TOURS: Record<string, Tour> = {

  dashboard_intro: {
    id: 'dashboard_intro',
    name: 'Dashboard Introduction',
    description: 'A complete walkthrough of your dashboard — every tab, every feature.',
    applicableTo: ['admin', 'subscriber', 'vip', 'team_lead'],
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Your Dashboard',
        target: null,
        corvusLine: "Welcome to your Crow's Eye dashboard. I'm going to show you everything available to you. Pay attention — I won't repeat myself. Much.",
        position: 'center',
      },
      {
        id: 'briefing_panel',
        title: 'Corvus Briefing Panel',
        target: '.corvus-dash-panel',
        corvusLine: "This is my briefing panel. Every time you log in I'll give you a status update on what happened since your last visit. Platform stats. Team activity. Anything you need to know. I deliver it here first.",
        position: 'bottom',
      },
      {
        id: 'tab_crows_eye',
        title: "Crow's Eye Tab",
        target: '[data-tab="crow"]',
        corvusLine: "This is where you run scans. Verdicts and Reckonings. Your credits are displayed. Your toggle between products is here. Upload your screenshots and I'll analyze everything. This is the main event.",
        position: 'bottom',
      },
      {
        id: 'tab_reports',
        title: 'My Reports Tab',
        target: '[data-tab="reports"]',
        corvusLine: "Every scan you run is stored here. Flock subscribers get six months of history. Murder subscribers get twelve. You can download any report as a PDF or ask me about it in the chat tab.",
        position: 'bottom',
      },
      {
        id: 'tab_analytics',
        title: 'Analytics Tab',
        target: '[data-tab="analytics"]',
        corvusLine: "Your usage analytics. How many scans you've run. What you found. Patterns over time. I'll give you an intelligence briefing on your own data. This is where you see whether you're actually fixing things.",
        position: 'bottom',
      },
      {
        id: 'tab_chat',
        title: 'Ask Corvus',
        target: '[data-tab="chat"]',
        corvusLine: "This is where you talk to me directly. Ask me anything about Wi-Fi, RF, or your specific scan results. I have full context on every report you've run. Voice input is available — click the microphone. I'll listen.",
        position: 'bottom',
      },
      {
        id: 'tab_credits',
        title: 'Buy Credits',
        target: '[data-tab="credits"]',
        corvusLine: "When you run out of credits — you come here. Single Verdicts, credit packs, Reckoning credits. Subscriber pricing applies. Your tier determines your rates.",
        position: 'bottom',
      },
      {
        id: 'tab_settings',
        title: 'Settings',
        target: '[data-tab="settings"]',
        corvusLine: "Your settings. Inactivity timeout. Password change. Voice controls — you can toggle where and when I speak. I recommend leaving everything on. But it's your dashboard.",
        position: 'bottom',
      },
      {
        id: 'tab_help',
        title: 'Help & Training',
        target: '[data-tab="help"]',
        corvusLine: "This tab. Right here. Every tour I just gave you is available on demand. Select any section and I'll walk you through it again. New features get their own tours when updates deploy. You can always come back here.",
        position: 'bottom',
      },
      {
        id: 'complete',
        title: 'Tour Complete',
        target: null,
        corvusLine: "That's the dashboard. You now know where everything is. If you forget — Help and Training tab. That's what it's there for. Now — do you want to run your first scan or do you have questions?",
        position: 'center',
      },
    ],
  },

  crows_eye_scan: {
    id: 'crows_eye_scan',
    name: 'How to Run a Scan',
    description: 'Step-by-step walkthrough of running a Verdict from screenshot to report.',
    applicableTo: ['admin', 'subscriber', 'vip', 'team_lead'],
    steps: [
      {
        id: 'product_toggle',
        title: 'Choose Your Product',
        target: '.product-toggle',
        corvusLine: "Choose Verdict for a single location scan. Choose Reckoning for multi-location surveys. Size options appear when you select Reckoning. Start with Verdict if you're new.",
        position: 'bottom',
      },
      {
        id: 'intake_form',
        title: 'Location Information',
        target: '.scan-intake-form',
        corvusLine: "Fill in the location details. Name, address, SSID — your network name. The more detail you provide the more specific my analysis will be. Client complaints field is important — tell me what symptoms the user is experiencing.",
        position: 'top',
      },
      {
        id: 'comfort_level',
        title: 'Technical Comfort Level',
        target: '.comfort-selector',
        corvusLine: "Select the technical comfort level of whoever will read this report. Level 1 is plain English — no technical terms. Level 5 is engineer-to-engineer. I adapt my entire response including fix instructions to this level.",
        position: 'top',
      },
      {
        id: 'upload_slots',
        title: 'Upload Screenshots',
        target: '.upload-slots',
        corvusLine: "Upload your three screenshots here. Signal List is required. 2.4 GHz and 5 GHz improve my analysis significantly. WiFi Analyzer app — free — green icon. The more data you give me the more accurate my Verdict will be.",
        position: 'top',
      },
      {
        id: 'run_button',
        title: 'Run the Scan',
        target: '.run-scan-btn',
        corvusLine: "When everything is filled in — hit this button. I'll analyze your RF environment. Processing takes 15-30 seconds. I'll narrate what I'm doing while you wait. Credit is consumed here.",
        position: 'top',
      },
      {
        id: 'complete',
        title: 'You\'re Ready',
        target: null,
        corvusLine: "That's everything. Fill the form, upload screenshots, hit Run Scan. Your Verdict will render in under 30 seconds. Report saves automatically. Any questions — Ask Corvus tab. Go.",
        position: 'center',
      },
    ],
  },

  team_lead_features: {
    id: 'team_lead_features',
    name: 'Team Lead Features',
    description: 'Walkthrough of team management capabilities for Flock/Murder subscribers.',
    applicableTo: ['team_lead'],
    steps: [
      {
        id: 'team_tab',
        title: 'Team Tab',
        target: '[data-tab="team"]',
        corvusLine: "This tab is yours as a Team Lead. Everything your team runs comes here. Real time. Every scan, every finding, every report. You have full visibility across your entire operation.",
        position: 'bottom',
      },
      {
        id: 'interval_selector',
        title: 'Time Interval Selector',
        target: '.report-interval-selector',
        corvusLine: "Select any time period — 24 hours through 12 months. Individual months available for the last year. Generate a full team report for any period with one click.",
        position: 'top',
      },
      {
        id: 'member_table',
        title: 'Per-Member Breakdown',
        target: '.member-breakdown-table',
        corvusLine: "Every team member's activity broken down. Scans, Verdicts, Reckonings, critical findings, last active. Click View Detail on any member for their full scan history.",
        position: 'top',
      },
      {
        id: 'export_options',
        title: 'Export Options',
        target: '.report-export-row',
        corvusLine: "Export your team report as a branded PDF or CSV. PDF includes my management briefing. CSV works for IT management meetings and compliance documentation.",
        position: 'top',
      },
      {
        id: 'complete',
        title: 'Team Lead Ready',
        target: null,
        corvusLine: "You have full situational awareness over your team's activity. Generate reports on any interval. Export in any format. If you need to add or remove team members — Billing tab. Any questions — Ask Corvus.",
        position: 'center',
      },
    ],
  },

  vip_features: {
    id: 'vip_features',
    name: 'VIP Dashboard Features',
    description: 'Your VIP access, subordinate code system, and team activity features.',
    applicableTo: ['vip'],
    steps: [
      {
        id: 'vip_banner',
        title: 'VIP Status',
        target: null,
        corvusLine: "Your VIP status is displayed in the gold banner at the top. Unlimited access — no credits — no billing — ever. This is your permanent designation as a founding member.",
        position: 'center',
      },
      {
        id: 'subordinate_codes',
        title: 'Subordinate Code Manager',
        target: '[data-tab="codes"]',
        corvusLine: "You can generate up to 5 subordinate access codes at any time. Set the expiry — 1 use through 30 days. Every scan your subordinates run flows into your Team Activity tab.",
        position: 'bottom',
      },
      {
        id: 'team_activity_vip',
        title: 'Team Activity',
        target: '[data-tab="team"]',
        corvusLine: "Everything your subordinate codes do — visible here. Real time. Full reports accessible. Corvus team briefing on any interval available on demand.",
        position: 'bottom',
      },
      {
        id: 'complete',
        title: 'VIP Tour Complete',
        target: null,
        corvusLine: "That's your VIP dashboard. You have unlimited access, subordinate code management, and full team visibility. If you have questions about anything — Ask Corvus tab. I'm here.",
        position: 'center',
      },
    ],
  },

}

export function getTourById(id: string): Tour | null {
  return TOURS[id] ?? null
}

export function getToursForRole(role: 'admin' | 'subscriber' | 'vip' | 'team_lead'): Tour[] {
  return Object.values(TOURS).filter(t => t.applicableTo.includes(role))
}
