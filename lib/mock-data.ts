import { User, Page, Contact } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '1a984f12-e876-4c91-a1b2-111111111111',
    fullName: 'Alexander Vance',
    email: 'admin@business-dev.com',
    password: 'AdminSecretPassword2026!',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-10T08:30:00Z',
    updatedAt: '2026-08-01T14:20:00Z',
  },
  {
    id: '2b873e23-d765-4b80-b2c3-222222222222',
    fullName: 'Elena Rostova',
    email: 'editor@business-dev.com',
    password: 'EditorPassword2026!',
    role: 'editor',
    isActive: true,
    createdAt: '2026-02-15T10:15:00Z',
    updatedAt: '2026-07-28T11:45:00Z',
  },
  {
    id: '3c762d34-c654-4a79-c3d4-333333333333',
    fullName: 'Marcus Sterling',
    email: 'user@business-dev.com',
    password: 'UserPassword2026!',
    role: 'user',
    isActive: true,
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-06-12T16:10:00Z',
  },
  {
    id: '4d651c45-b543-4968-d4e5-444444444444',
    fullName: 'Sophia Thorne',
    email: 's.thorne@enterprise-apex.org',
    password: 'SophiaSecurePass99',
    role: 'editor',
    isActive: true,
    createdAt: '2026-04-05T12:00:00Z',
    updatedAt: '2026-07-15T09:30:00Z',
  },
  {
    id: '5e540b56-a432-4857-e5f6-555555555555',
    fullName: 'David K. Chen',
    email: 'dchen@innovatex.io',
    password: 'DavidChenAccess2026',
    role: 'user',
    isActive: false,
    createdAt: '2026-05-18T15:45:00Z',
    updatedAt: '2026-07-02T10:20:00Z',
  },
];

export const INITIAL_PAGES: Page[] = [
  {
    id: 1,
    slug: 'home-page',
    content: {
      site: {
        name: "Business Developer",
        nameHighlight: "DEVELOPER",
        tagline: "ENTERPRISE PLATFORM",
        description: "Enterprise growth platform delivering data-backed strategies, executive expansion frameworks, and modern market intelligence for high-scale organizations.",
        copyright: "Business Developer Inc.",
        builtWith: "Built with Next.js App Router & Tailwind CSS"
      },
      metadata: {
        home: {
          title: "Business Developer | Enterprise Growth Platform",
          description: "Enterprise growth platform delivering data-backed strategies, executive expansion frameworks, and modern market intelligence for high-scale organizations."
        },
        contact: {
          title: "Contact | Business Developer",
          description: "Schedule an executive discovery call with our principal strategists to evaluate scale opportunities and refine your unit economics."
        }
      },
      navigation: [
        { label: "Overview", href: "/", mobileIconColor: "iconRose" },
        { label: "Contact", href: "/contact", mobileIconColor: "iconSky" }
      ],
      header: {
        cta: "Book Consultation",
        logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
      },
      contactInfo: {
        email: "advisory@business-dev.com",
        phone: "+1 (800) 555-DEV-EXEC",
        address: "Global HQ: 500 Enterprise Way, Suite 800, New York, NY 10001"
      },
      footer: {
        scheduleAdvisoryCta: "Schedule Advisory Call",
        newsletter: {
          title: "Enterprise Newsletter",
          description: "Join 15,000+ C-Suite leaders receiving our bi-weekly market playbooks and growth benchmarks.",
          placeholder: "Enter corporate email",
          submitLabel: "Subscribe to Playbooks",
          successMessage: "Thank you for subscribing!"
        }
      },
      hero: {
        badge: "ENTERPRISE BUSINESS DEVELOPMENT PLATFORM",
        headline: "Architecting",
        headlineHighlight: "High-Growth",
        headlineSuffix: "Business Strategies",
        description: "We partner with ambitious executives and high-growth companies to unlock new market share, optimize operational margins, and automate revenue execution.",
        primaryCta: "Schedule Strategic Audit",
        secondaryCta: "Explore Core Offerings",
        bannerImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
        trustBadges: [
          { icon: "ShieldCheck", text: "SOC2 Certified Strategy" },
          { icon: "CheckCircle2", text: "98.4% Client Retention SLA" },
          { icon: "Award", text: "ISO 9001 Compliant" }
        ]
      },
      heroDashboard: {
        aiBadge: "AI Revenue Predictor Active",
        title: "Enterprise Growth Analytics — Business Developer",
        kpis: {
          revenue: { label: "Annual Revenue Velocity" },
          ebitda: { label: "EBITDA Margin Boost", value: "34.2%", trend: "+6.8% YoY" },
          pipeline: { label: "Pipeline Efficiency", value: "94.1%", trend: "Optimal" }
        },
        chartTitle: "12-Month Projected vs Actual Growth Line",
        chartAxisLabels: ["Q1 Baseline", "Q2 Ramp", "Q3 Multiplier", "Q4 Peak", "Q5 Horizon"],
        integrationStatus: "Real-time C-Suite Integration Active",
        targetRoi: "2.45x"
      },
      chart: {
        quarters: ["Q1", "Q2", "Q3", "Q4", "Q5"],
        data: {
          Q1: { val: "$3.2M", trend: "+8.2%", pointX: 40, pointY: 110, label: "Q1 Launch Baseline" },
          Q2: { val: "$5.8M", trend: "+14.1%", pointX: 130, pointY: 90, label: "Q2 Channel Expansion" },
          Q3: { val: "$8.5M", trend: "+21.0%", pointX: 220, pointY: 65, label: "Q3 Operational Scaling" },
          Q4: { val: "$11.9M", trend: "+24.5%", pointX: 310, pointY: 40, label: "Q4 Milestone Expansion" },
          Q5: { val: "$14.8M", trend: "+280% Target", "pointX": 400, "pointY": 15, "label": "Q5 Projected Horizon" }
        }
      },
      stats: [
        { number: "$45M+", label: "Generated Value Created", sub: "Across global enterprise portfolio" },
        { number: "250+", label: "Enterprise Projects", sub: "Delivered on time and on budget" },
        { number: "98.4%", label: "Client SLA Retention", sub: "Audited annually by independent partners" },
        { number: "15+", label: "Years Industry Mastery", sub: "Trusted by Fortune 500 leadership" },
        { number: "3.8x", label: "Average Revenue Multiple", sub: "Sustained over 3-year performance window" },
        { number: "40+", label: "Global Markets Covered", sub: "Across Americas, EMEA, and APAC" }
      ]
    },
    updatedByEmail: 'admin@business-dev.com',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-08-02T16:40:00Z',
  },
  {
    id: 2,
    slug: 'about-us',
    content: {
      site: {
        name: "Business Developer",
        tagline: "ABOUT OUR ADVISORY FIRM"
      },
      hero: {
        headline: "Global Enterprise Advisory Leader",
        description: "Empowering Fortune 500 executives with transformative market positioning and data-driven execution.",
        heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
      },
      companyDetails: {
        headquarters: "500 Enterprise Way, Suite 800, New York, NY 10001",
        globalOffices: ["New York", "London", "Singapore", "Tokyo", "Zurich"],
        totalConsultants: "450+ Senior Growth Strategists"
      }
    },
    updatedByEmail: 'editor@business-dev.com',
    createdAt: '2026-01-15T11:20:00Z',
    updatedAt: '2026-07-30T14:15:00Z',
  },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1111111-1111-4111-a111-111111111111',
    fullName: 'Jonathan Vance',
    phone: '+1 (212) 555-0198',
    jobTitle: 'Chief Technology Officer',
    email: 'j.vance@apexlogistics.com',
    submittedByUserId: '3c762d34-c654-4a79-c3d4-333333333333',
    createdAt: '2026-08-04T09:15:00Z',
    status: 'new',
  },
  {
    id: 'c2222222-2222-4222-a222-222222222222',
    fullName: 'Victoria Sterling',
    phone: '+44 20 7946 0912',
    jobTitle: 'VP of Global Growth',
    email: 'v.sterling@meridiancapital.co.uk',
    submittedByUserId: '2b873e23-d765-4b80-b2c3-222222222222',
    createdAt: '2026-08-03T16:30:00Z',
    status: 'inprogress',
  },
  {
    id: 'c3333333-3333-4333-a333-333333333333',
    fullName: 'Dr. Robert Nakamura',
    phone: '+81 3 5555 0143',
    jobTitle: 'Head of Digital Transformation',
    email: 'r.nakamura@kyototech.jp',
    submittedByUserId: null,
    createdAt: '2026-08-02T11:00:00Z',
    status: 'resolved',
  },
  {
    id: 'c4444444-4444-4444-a444-444444444444',
    fullName: 'Camilla Rodriguez',
    phone: '+1 (305) 555-8834',
    jobTitle: 'Managing Partner',
    email: 'crodriguez@solarisventures.com',
    submittedByUserId: '5e540b56-a432-4857-e5f6-555555555555',
    createdAt: '2026-07-29T14:45:00Z',
    status: 'inprogress',
  },
];