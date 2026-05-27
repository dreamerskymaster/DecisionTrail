<div align="center">

# DecisionTrail

**AI-Guided Decision Documentation & Rationale Capture Tool**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

*Built for EMGT 5220: Engineering Project Management | Northeastern University | Team 3*

[Live Demo](https://decision-trail.vercel.app) · [Getting Started](#getting-started) · [For Nathaniel and Kaylee](#for-nathaniel-and-kaylee) · [Features](#features) · [Architecture](#architecture) · [Team](#team)

</div>

> **Current sprint:** M3 (Work Breakdown Structure). M2 submitted May 2026. Build is functional and deployed for testing. Next up: M4 (Implementation Plan, green-light gate).

---

## The Problem

In industrial equipment installation environments, dozens of engineering and configuration decisions are made weekly across multiple active project sites. These decisions range from equipment specifications and layout changes to material substitutions and scheduling adjustments.

**The painful reality:** these decisions exist only in scattered emails, chat messages, and verbal exchanges between field technicians, project coordinators, and clients. When a decision is questioned weeks or months later, there is no single, searchable record of what was decided, who authorized it, what alternatives were evaluated, or why the chosen path was selected. Retrieval today takes one to three hours of email and document searching.

### The Failure Scenario

Three months into a multi-phase installation, the client's engineering team asks why a particular sorting screen mesh size was selected over the originally specified option. The Field Project Coordinator cannot locate the rationale. The original decision was made during a site walkthrough between a senior technician and the client's operations manager, but it was never documented. The project team now faces rework, a scope dispute, and eroded client trust.

**This is the exact gap DecisionTrail fills.**

---

## Why Existing Tools Fall Short

We researched the current landscape extensively. Nothing solves this specific problem:

### 1. Enterprise PM Suites (monday.com, Confluence, Procore, ClickUp)

These platforms offer decision logging as a secondary feature buried inside massive systems. A Field Project Coordinator without PM training will not navigate boards, custom fields, and automation workflows to log a quick decision during a site walkthrough.

### 2. Decision Management Software (UiPath, InRule, Decisions, Sapiens)

Enterprise automation platforms focused on encoding business rules and executing decision logic at scale. They automate decisions; they do not document human decisions made in the field.

### 3. Field Operations AI Tools (OpenSpace, Fieldwire, BuildOps, SiteCapture)

These focus on visual documentation, scheduling, and technician dispatching. None of them structure the reasoning behind engineering or configuration decisions.

### What DecisionTrail Does Differently

A lightweight, standalone tool where a non-PM-trained field coordinator can describe a decision conversationally, and the AI structures it into a complete record (what was decided, why, who was involved, what was rejected, which project phase it belongs to) with zero knowledge of decision frameworks. Under two minutes to log. Under sixty seconds to retrieve.

---

## Features

### Core Capabilities

| Feature | Description | M2 Requirement |
|---|---|---|
| **AI-Guided Capture** | 5-step conversational wizard walks coordinators through what, why, who, alternatives, and risks | FR-01, FR-03 |
| **Quick Capture Mode** | Two required fields (what + why), live timer benchmarked against 2-minute target | FR-01, FR-02 |
| **Smart Search & Filters** | Filter by phase, category, impact, person, date; full-text keyword search | FR-05 |
| **Phase Coverage Map** | Dashboard visualization showing which project phases have documented decisions and which have gaps | FR-06 |
| **Completeness Tracking** | Per-decision ring indicator + aggregate dashboard metric | FR-10 |
| **Multi-Project Support** | Create and switch between projects; decisions organized per project | FR-07 |
| **Export** | Copy to clipboard or download as plain text / CSV | FR-08 |
| **Edit After Capture** | Quick captures can be enriched later with alternatives, people, risks | FR-09 |
| **Auto-Categorization** | AI assigns project phase, decision category, and impact level from conversational input | FR-04 |

### AI Engine (Dual Mode)

DecisionTrail supports two AI modes, toggled from the sidebar:

- **Simulated Mode** (default): Regex-based classifier that auto-detects project phase, decision category, and impact level. Zero API cost, works offline, ideal for demos and testing.
- **Gemini AI Mode**: Calls the Google Gemini 2.0 Flash API to parse conversational input and generate structured decision records with richer context extraction. Requires an API key.

### Decision Classification

Every decision is automatically tagged with:

- **Phase**: Planning, Procurement, Installation, Commissioning, Closeout
- **Category**: Engineering, Scheduling, Budget, Safety, Scope, Vendor, Resource
- **Impact**: Low, Medium, High, Critical

### Sample Data

DecisionTrail ships with **74 real and domain-specific decisions** seeded across 5 projects:

| Source | Records | What It Provides |
|---|---|---|
| **Industrial Equipment Decisions** (handcrafted) | 12 | Full decision records with rationale from real installation scenarios: equipment substitutions, conveyor reroutes, vendor switches, safety compliance, scope changes |
| **NASA TechPort API** (`techport.nasa.gov/api`) | 12 | Real NASA R&D project decisions with descriptions, benefits analysis, and technology readiness assessments |
| **NTSB CAROL Records** | 50 | Real probable cause investigation data from the National Transportation Safety Board |

Run `node scripts/seed.mjs` to populate your Supabase instance.

**Data architecture:** Supabase (PostgreSQL) with full-text search indexes, row-level security, and a localStorage fallback for offline or demo use.

---

## Success Criteria (from M2 Section 1.4)

| ID | Criterion | Target |
|---|---|---|
| SC-01 | A field coordinator unfamiliar with the tool can log a complete decision in under 2 minutes after reading the user guide | < 2 minutes |
| SC-02 | Retrieval of a past decision's full rationale via search takes under 60 seconds | < 60 seconds (baseline: 1 to 3 hours via email) |
| SC-03 | At least 80% of decisions logged through the AI-guided wizard are auto-categorized with correct phase and category | >= 80% accuracy |
| SC-04 | The phase coverage map correctly identifies phases with zero documented decisions | 100% detection |
| SC-05 | Post-use satisfaction survey: coordinator reports increased confidence when questioned about past decisions | Positive trend |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/dreamerskymaster/DecisionTrail.git
cd DecisionTrail

# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens at `http://localhost:3000`. Works immediately with localStorage and sample data; no backend or API key required.

### Environment Variables (Optional)

```bash
cp .env.example .env
```

| Variable | Purpose | Required? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Optional (falls back to localStorage) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for live AI mode | Optional (falls back to simulated classifier) |

### Supabase Setup (Optional)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run `supabase/schema.sql`
3. Run `node scripts/seed.mjs` to populate with sample data
4. Copy your project URL and anon key into `.env`

Without Supabase, the app uses localStorage with full functionality.

### Live Demo

Latest build is deployed at [decision-trail.vercel.app](https://decision-trail.vercel.app). You can use the live demo to explore the tool without running anything locally.

---

## For Nathaniel and Kaylee

Welcome to the build. Here is how to get oriented quickly.

### Start here

1. **Open the live demo** at [decision-trail.vercel.app](https://decision-trail.vercel.app) and click around for ten minutes. Try Quick Capture and the Wizard Mode. Log at least three decisions using examples from your own experience.
2. **Read the M2 deliverable Section 1.1** (Tool Description) to see the design intent on paper, then come back to the live app to see what is actually built.
3. **Skim Section 1.3 (Functional Requirements)** in the M2 deliverable. The "M2 Requirement" column in the Features table above tells you which feature satisfies which requirement.

### What you can do right now

- **File issues.** Use [GitHub Issues](https://github.com/dreamerskymaster/DecisionTrail/issues) for anything you spot: bugs, confusing labels, missing features, UX rough edges. Title format: `[bug]`, `[ux]`, or `[idea]` followed by a short description.
- **Use the build to ground M3 and M4 planning.** As Nathaniel writes the M3 WBS and the team writes the M4 Implementation Plan, this repo is the ground truth for what exists. Reference the file structure under [Architecture](#architecture) when sizing work packages.
- **Kaylee: start drafting the M6 user guide.** The Wizard flow and Quick Capture screens are stable enough that the one-to-two-page user guide can begin now. Keep the language coordinator-friendly (no PM terminology).
- **Nathaniel: review the decision taxonomy.** The phase and category lists in `src/lib/data.js` are pulled from M2 Section 1.1.4. Flag anything that does not match the field reality you have heard described.
- **All: test against the success criteria.** When the build is feature-complete (M6), all three of us run SC-01 through SC-05 from M2 Section 1.4. Familiarize yourself now so M6 testing is not a cold start.

### If something breaks

Message Ajith on Teams with the error message. Do not try to fix it in the code unless you are comfortable doing so. We will work through issues together.

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6 |
| Styling | Tailwind CSS 3.4, custom design system |
| Animation | Framer Motion 11 |
| Persistence | Supabase (primary), localStorage (fallback) |
| AI | Google Gemini 2.0 Flash (live) + simulated classifier (offline) |
| Icons | Lucide React |
| Export | Native Blob and Clipboard APIs |

### Project Structure

```
src/
  components/
    Sidebar.jsx          # Navigation, project switcher, AI mode toggle
    Dashboard.jsx        # Stats, phase coverage map, category breakdown, recent decisions
    CaptureWizard.jsx    # Full 5-step AI-guided conversational capture
    QuickCapture.jsx     # 2-field fast capture with live timer
    DecisionLog.jsx      # Searchable, filterable, sortable decision list
    DecisionDetail.jsx   # Full decision view with inline editing
    ExportModal.jsx      # Export to text/CSV (clipboard or file download)
  lib/
    ai.js                # Simulated classifier + Gemini API integration
    supabase.js          # Supabase client + localStorage fallback layer
    data.js              # Sample decisions, project defaults, prompt definitions
  hooks/
    useStore.js          # Central state management with persistence
  App.jsx                # Root layout, routing, sidebar integration
supabase/
  schema.sql             # Database schema with RLS policies and full-text search indexes
scripts/
  seed.mjs               # Populates Supabase with sample decisions (NTSB, NASA, industrial)
```

### Design Decisions

- **Dark industrial theme** with teal/emerald accents reflecting the equipment installation context
- **IBM Plex Sans** typography for clarity at all sizes
- **Glass morphism panels** with subtle backdrop blur for visual depth
- **Chat-style capture UI** to feel like a conversation, not a form
- **All prompts use plain workplace language** (no PM jargon, per project constraints)

---

## Sprint Timeline

| Module | Sprint Goal | Status |
|---|---|---|
| M1 | Team formation and topic selection | Complete (submitted May 15) |
| M2 | Tool definition and requirements | Complete (submitted May 28) |
| M3 | Work Breakdown Structure | **Current** |
| M4 | Implementation Plan (green-light gate) | Upcoming |
| M5 | Build Sprint 1 (Beta) | Upcoming |
| M6 | Build Sprint 2 (Final Tool) | Upcoming |
| M7 | Evaluation and Live Demo | Upcoming |

### Deliverables (OneDrive)

- M1 Team Charter and Topic Selection: *[add OneDrive link]*
- M2 Tool Definition and Requirements: *[add OneDrive link]*
- Meeting notes and feedback logs: *[add OneDrive link]*

---

## Team

| Member | Role | Areas of Ownership |
|---|---|---|
| **Ajith Srikanth** | SME, AI Integration Lead | Domain expertise, tool architecture, AI integration, core development |
| **Nathaniel Cramer** | Meeting Scheduler, Tasking Coordinator, Presentation Lead | Sprint planning, task tracking, schedule/network diagrams, M7 presentation |
| **Kaylee Tanoto** | POC, Feedback Coordinator, Lead Editor | Instructor liaison, deliverable editing, user guide, acceptance testing documentation |

---

## Course Context

**EMGT 5220: Engineering Project Management**
Northeastern University, Graduate School of Engineering
Summer 1 2026 | Dr. Tristan Johnson

This tool was designed for a Field Project Coordinator at a mid-size industrial equipment solutions provider who manages installation timelines, vendor schedules, and site logistics for complex multi-phase installation projects.

---

## License

Academic project for Northeastern University EMGT 5220. Not for commercial distribution.

---

*This README is maintained by Ajith. If something is out of date or unclear, message on Teams.*
