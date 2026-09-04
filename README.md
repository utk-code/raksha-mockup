# RAKSHA — Risk-Aware Knowledge & Safe Habitation Allocation

## What RAKSHA Is

RAKSHA is a **decision-support prototype** for disaster management, built for **Smart India Hackathon 2026 — Problem Statement 26191**.

It demonstrates how hazard signals, population vulnerability, safe-site capacity, and routing can be connected into an explainable decision workflow for emergency operations centres.

## Core Decision Chain

**Hazard → Vulnerability → Risk Score → Capacity → Destination → Route → Phase → Action**

The system answers:

1. **Who** needs attention first?
2. **Why** are they high priority?
3. **Where** can they go?
4. **Can** the destination absorb them?
5. **What** should happen next?

## Prototype Disclosure

This is a **controlled scenario demonstration**. All data is hardcoded. No live data feeds, no backend, no API keys.

The UI displays **CONTROLLED SCENARIO DATA** to make this clear to judges and stakeholders.

## Current Scenario

| Field | Value |
|---|---|
| Scenario | Heavy Rainfall Response |
| Region | Uttarakhand · Chamoli |
| Timestamp | 20 May 2025 · 10:30 IST |
| Weather | 24°C · Light rain |
| User | SDMA User · State Authority |

## Scenario Data

### Dashboard Figures

- **152** habitations at risk
- **48** P1 (Immediate)
- **62** P2 (Short-term)
- **42** P3 (Medium-term)
- **1,24,860** population at risk
- **32,450** P1 population
- **46,780** P2 population
- **45,630** P3 population
- **36** safe sites identified
- **29** currently usable
- **2,18,650** total safe capacity
- **54%** scenario capacity utilization
- **3** active scenario alerts

### Habitations

| Name | Score | Priority | Population | Flood | Vulnerability | Medical | Road | Destination |
|---|---|---|---|---|---|---|---|---|
| Sail Gaon | 92 | P1 | 2,350 | HIGH | HIGH | POOR | ONE-WAY | Govt. Inter College Ground |
| Birahi | 89 | P1 | 1,840 | HIGH | HIGH | LIMITED | CONSTRAINED | Horticulture Farm |
| Gopeshwar Fringe | 78 | P2 | 4,210 | HIGH | MEDIUM | MODERATE | CONSTRAINED | Naini Bagar Field |
| Nandprayag East | 71 | P2 | 1,190 | RIVER | MEDIUM | MODERATE | MODERATE | Govt. Inter College Ground |
| Joshimath South | 58 | P3 | 3,020 | MODERATE | MEDIUM | GOOD | MODERATE | Sports Stadium |

### Safe Sites

| Site | Usable Capacity | Utilized | Available | Utilization |
|---|---|---|---|---|
| Govt. Inter College Ground | 12,500 | 5,350 | 7,150 | 43% |
| Horticulture Farm | 8,200 | 4,674 | 3,526 | 57% |
| Naini Bagar Field | 6,800 | 2,584 | 4,216 | 38% |
| Sports Stadium | 14,000 | 8,820 | 5,180 | 63% |

### Risk Scoring Weighting

| Factor | Weight |
|---|---|
| Hazard / exposure | 45% |
| Population vulnerability | 30% |
| Access / service constraints | 15% |
| Historical signal | 10% |

*Prototype weighting — configurable in production.*

## Application Pages

1. **Command Dashboard** — Primary decision workspace with KPIs, map, intelligence panel
2. **Risk Map** — Full-width spatial view with layers
3. **Habitations** — Searchable/filterable data table
4. **Safe Sites** — Capacity management grid
5. **Relocation Plan** — Phased timeline (P1 0–72h, P2 3 days–2wk, P3 2wk–3mo)
6. **Alerts** — Incident feed
7. **Analytics** — Scoring methodology and decision flow
8. **Reports** — Printable institutional report (Ctrl+P / Print)
9. **Data Layers** — Scenario vs. planned integrations
10. **Settings** — Display controls and prototype disclosure

## Judge Demonstration Flow

1. Open **Command Dashboard** — see KPIs, map with markers, intelligence panel for Sail Gaon
2. Click **Sail Gaon** on the map — intelligence panel updates with P1, score 92
3. Click **Evidence Trail** — drawer opens showing explainable output
4. Click **View prototype route** — route highlighted
5. Switch to **Relocation Plan** — see phased P1/P2/P3 assignments
6. Navigate to **Habitations** — search, filter by priority
7. Switch **scenario** in the header — KPIs update
8. Navigate to **Reports** — click Print / Save PDF

## Local Setup

No build step required. Open `index.html` in a browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Use Live Server extension
```

Then open `http://localhost:8000` (or the port shown).

## Static Deployment

The application works as a static site. Deploy to:

- **GitHub Pages** — push and enable Pages
- **Netlify** — drag the folder
- **Vercel** — `vercel --prod`
- **Replit** — upload files, serve static

No environment variables, no build command, no backend required.

## Architecture

```
RAKSHA_SIH_Prototype_v2/
├── index.html      # Full HTML structure (all 10 pages)
├── styles.css      # Design system (CSS custom properties)
├── data.js         # All scenario data (preserved exactly)
├── app.js          # Application logic
└── README.md       # This file
```

## Open-Source Dependencies

All loaded via CDN (no npm install needed):

| Library | Purpose | License |
|---|---|---|
| [Leaflet](https://leafletjs.com/) | Interactive map | BSD-2-Clause |
| [OpenStreetMap](https://www.openstreetmap.org/) | Map tiles | ODbL |
| [Lucide](https://lucide.dev/) | Icon set | ISC |
| [Inter](https://rsms.me/inter/) | Typography | SIL OFL 1.1 |

## What Is Hardcoded

- All habitation data (names, populations, risk scores, priorities)
- All safe-site data (capacities, utilization)
- All alerts
- Scenario switching values
- Risk scoring weights
- Geographic coordinates (approximate)
- Map layer geometry (approximate)
- Travel time estimates (prototype)

## What Is Not Implemented

- Real-time data feeds (IMD, USGS, etc.)
- Actual routing algorithms (travel times are estimates)
- Authentication / user management
- Backend database
- Live capacity monitoring
- ML-based risk scoring (weights are demonstrative)
- Real GIS data layers

## Production Direction

In a production deployment:

- Replace hardcoded data with validated hazard, population, and infrastructure databases
- Integrate IMD rainfall and river gauge APIs
- Add OpenStreetMap or proprietary road network routing
- Implement server-side risk scoring with configurable weights
- Add authentication and role-based access (SDMA, DDMA, field teams)
- Integrate real-time safe-site capacity monitoring
- Add notification systems (SMS, WhatsApp, radio)
- Full GIS integration with GeoServer/PostGIS

## Technologies

- **Vanilla HTML/CSS/JS** — no framework, no build step
- **CSS Custom Properties** — design token system
- **Leaflet.js** — interactive mapping
- **Lucide Icons** — professional iconography
- **Inter font** — enterprise typography
