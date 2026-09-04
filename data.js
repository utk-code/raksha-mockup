// RAKSHA — All scenario data (preserved exactly from original)
// DO NOT modify any values in this file.

const APP = {
  name: "RAKSHA",
  fullName: "Risk-Aware Knowledge & Safe Habitation Allocation",
  problem: "SIH 2026 · Problem Statement 26191",
  mode: "CONTROLLED SCENARIO DATA"
};

const SCENARIOS = {
  rain: {
    label: "Heavy Rainfall Response",
    flood: "HIGH",
    alert: "3",
    risk: "152",
    pop: "1,24,860",
    p1Count: "48",
    p2Count: "62",
    p3Count: "42",
    p1Pop: "32,450",
    p2Pop: "46,780",
    p3Pop: "45,630",
    sites: "36",
    usable: "29",
    totalCap: "2,18,650",
    util: "54%"
  },
  landslide: {
    label: "Landslide Escalation",
    flood: "MODERATE",
    alert: "4",
    risk: "160",
    pop: "1,29,420",
    p1Count: "52",
    p2Count: "58",
    p3Count: "50",
    p1Pop: "35,120",
    p2Pop: "44,200",
    p3Pop: "50,100",
    sites: "36",
    usable: "27",
    totalCap: "2,02,400",
    util: "64%"
  },
  river: {
    label: "River Level Rise",
    flood: "VERY HIGH",
    alert: "4",
    risk: "157",
    pop: "1,27,180",
    p1Count: "50",
    p2Count: "60",
    p3Count: "47",
    p1Pop: "33,800",
    p2Pop: "45,500",
    p3Pop: "47,880",
    sites: "36",
    usable: "28",
    totalCap: "2,10,500",
    util: "60%"
  }
};

const HABITATIONS = [
  {
    name: "Sail Gaon",
    district: "Chamoli",
    score: 92,
    p: "P1",
    pop: "2,350",
    popNum: 2350,
    flood: "HIGH",
    vuln: "HIGH",
    medical: "POOR",
    road: "ONE-WAY",
    dest: "Govt. Inter College Ground",
    distance: "12.6 km",
    time: "35 min",
    available: "7,150",
    destCap: "12,500",
    destUsed: "5,350",
    utilPct: 43,
    lat: 30.45,
    lng: 79.35
  },
  {
    name: "Birahi",
    district: "Chamoli",
    score: 89,
    p: "P1",
    pop: "1,840",
    popNum: 1840,
    flood: "HIGH",
    vuln: "HIGH",
    medical: "LIMITED",
    road: "CONSTRAINED",
    dest: "Horticulture Farm",
    distance: "18.4 km",
    time: "48 min",
    available: "3,526",
    destCap: "8,200",
    destUsed: "4,674",
    utilPct: 57,
    lat: 30.48,
    lng: 79.28
  },
  {
    name: "Gopeshwar Fringe",
    district: "Chamoli",
    score: 78,
    p: "P2",
    pop: "4,210",
    popNum: 4210,
    flood: "HIGH",
    vuln: "MEDIUM",
    medical: "MODERATE",
    road: "CONSTRAINED",
    dest: "Naini Bagar Field",
    distance: "21.1 km",
    time: "52 min",
    available: "4,216",
    destCap: "6,800",
    destUsed: "2,584",
    utilPct: 38,
    lat: 30.38,
    lng: 79.33
  },
  {
    name: "Nandprayag East",
    district: "Chamoli",
    score: 71,
    p: "P2",
    pop: "1,190",
    popNum: 1190,
    flood: "RIVER",
    vuln: "MEDIUM",
    medical: "MODERATE",
    road: "MODERATE",
    dest: "Govt. Inter College Ground",
    distance: "14.2 km",
    time: "38 min",
    available: "7,150",
    destCap: "12,500",
    destUsed: "5,350",
    utilPct: 43,
    lat: 30.33,
    lng: 79.31
  },
  {
    name: "Joshimath South",
    district: "Chamoli",
    score: 58,
    p: "P3",
    pop: "3,020",
    popNum: 3020,
    flood: "MODERATE",
    vuln: "MEDIUM",
    medical: "GOOD",
    road: "MODERATE",
    dest: "Sports Stadium",
    distance: "39.8 km",
    time: "78 min",
    available: "5,180",
    destCap: "14,000",
    destUsed: "8,820",
    utilPct: 63,
    lat: 30.56,
    lng: 79.37
  }
];

const SAFE_SITES = [
  {
    name: "Govt. Inter College Ground",
    location: "Chamoli",
    usable: "12,500",
    used: "5,350",
    available: "7,150",
    utilPct: 43,
    status: "operational",
    lat: 30.40,
    lng: 79.32
  },
  {
    name: "Horticulture Farm",
    location: "Chamoli",
    usable: "8,200",
    used: "4,674",
    available: "3,526",
    utilPct: 57,
    status: "operational",
    lat: 30.42,
    lng: 79.25
  },
  {
    name: "Naini Bagar Field",
    location: "Chamoli",
    usable: "6,800",
    used: "2,584",
    available: "4,216",
    utilPct: 38,
    status: "operational",
    lat: 30.35,
    lng: 79.28
  },
  {
    name: "Sports Stadium",
    location: "Chamoli",
    usable: "14,000",
    used: "8,820",
    available: "5,180",
    utilPct: 63,
    status: "operational",
    lat: 30.55,
    lng: 79.35
  }
];

const ALERTS = [
  {
    severity: "P1",
    time: "20 May 2025 · 10:30 IST",
    title: "Heavy rainfall warning — Chamoli",
    desc: "IMD reports sustained heavy rainfall across Chamoli district. Multiple habitation corridors show elevated flood exposure. River gauge trending upward.",
    effect: "Elevates P1 habitations to immediate priority"
  },
  {
    severity: "P2",
    time: "20 May 2025 · 09:45 IST",
    title: "Road access constraint — Joshimath corridor",
    desc: "Field report indicates single-lane restriction on the Joshimath approach road. Moderate impact on evacuation routing for downstream habitations.",
    effect: "May delay P3 medium-term relocation by 12–24 hours"
  },
  {
    severity: "P3",
    time: "20 May 2025 · 08:15 IST",
    title: "Safe-site capacity shift — Naini Bagar",
    desc: "Naini Bagar Field utilization updated following Gopeshwar Fringe allocation. Remaining capacity: 4,216.",
    effect: "Monitors capacity absorption for P2 cohort"
  }
];

const RELOCATION_PLAN = [
  {
    phase: "P1",
    window: "0–72 hours",
    assignments: [
      { from: "Sail Gaon", to: "Govt. Inter College Ground", pop: "2,350", dist: "12.6 km", time: "35 min", util: 43 },
      { from: "Birahi", to: "Horticulture Farm", pop: "1,840", dist: "18.4 km", time: "48 min", util: 57 }
    ]
  },
  {
    phase: "P2",
    window: "3 days – 2 weeks",
    assignments: [
      { from: "Gopeshwar Fringe", to: "Naini Bagar Field", pop: "4,210", dist: "21.1 km", time: "52 min", util: 38 },
      { from: "Nandprayag East", to: "Govt. Inter College Ground", pop: "1,190", dist: "14.2 km", time: "38 min", util: 43 }
    ]
  },
  {
    phase: "P3",
    window: "2 weeks – 3 months",
    assignments: [
      { from: "Joshimath South", to: "Sports Stadium", pop: "3,020", dist: "39.8 km", time: "78 min", util: 63 }
    ]
  }
];

const WEIGHTING = {
  hazard: { label: "Hazard / exposure", pct: 45 },
  vuln: { label: "Population vulnerability", pct: 30 },
  access: { label: "Access / service constraints", pct: 15 },
  historical: { label: "Historical signal", pct: 10 }
};
