<div align="center">

# DecisionTrail

**AI-Guided Decision Documentation & Rationale Capture Tool**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Claude AI](https://img.shields.io/badge/Claude-AI%20Powered-D4A574?logo=anthropic&logoColor=white)](https://anthropic.com)

*Built for EMGT 5220: Engineering Project Management | Northeastern University | Team 3*

[Getting Started](#getting-started) | [Features](#features) | [Architecture](#architecture) | [Team](#team)

</div>

---

## The Problem

In industrial equipment installation environments, dozens of engineering and configuration decisions are made weekly across multiple active project sites. These decisions range from equipment specifications and layout changes to material substitutions and scheduling adjustments.

**The painful reality:** these decisions exist only in scattered emails, chat messages, and verbal exchanges between field technicians, project coordinators, and clients. When a decision is questioned weeks or months later, there is no single, searchable record of what was decided, who authorized it, what alternatives were evaluated, or why the chosen path was selected.

### The Failure Scenario

Three months into a multi-phase installation, the client's engineering team asks why a particular sorting screen mesh size was selected over the originally specified option. The Field Project Coordinator cannot locate the rationale. The original decision was made during a site walkthrough between a senior technician and the client's operations manager, but it was never documented. The project team now faces rework, a scope dispute, and eroded client trust.

**This is the exact gap DecisionTrail fills.**

---

## Why Existing Tools Fall Short

We researched the current landscape extensively. Nothing solves this specific problem:

### 1. Enterprise PM Suites (monday.com, Confluence, Procore, ClickUp)

These platforms offer decision logging as a secondary feature buried inside massive systems. monday.com treats decision logs as structured records within its broader work management platform, requiring users to navigate boards, custom fields, and automation workflows. Procore's AI assistant ("Procore Assist") is conversational, but it focuses on retrieving information from specs, RFIs, and submittals, not on capturing the rationale behind field decisions. **A Field Project Coordinator without PM training will not navigate these systems to log a quick decision.**

### 2. Decision Management Software (UiPath, InRule, Decisions, Sapiens)

These are enterprise automation platforms focused on encoding business rules and executing decision logic at scale, primarily for regulated industries like insurance and financial services. **They automate decisions; they do not document human decisions made in the field.**

### 3. Field Operations AI Tools (OpenSpace, Fieldwire, BuildOps, SiteCapture)

These focus on visual documentation, scheduling, and technician dispatching. They let field crews capture notes, photos, and checklists, but the AI assists with summarizing visit reports and auto-populating asset records. **None of them structure the reasoning behind engineering or configuration decisions.**

### What DecisionTrail Does Differently

A lightweight, standalone tool where a non-PM-trained field coordinator can describe a decision conversationally, and the AI structures it into a complete record (what was decided, why, who was involved, what was rejected, which project phase it belongs to) with zero knowledge of decision frameworks. Under two minutes. Retrievable in under 30 seconds.

---

## Features

### Core Capabilities

| Feature | Description | Success Criterion Met |
|---|---|---|
| **AI-Guided Capture** | 5-step conversational wizard walks coordinators through what, why, who, alternatives, and risks | Structured rationale capture |
| **Quick Capture Mode** | Two required fields (what + why), live timer benchmarked against 2-minute target | Log a decision in under 2 minutes |
| **Smart Search & Filters** | Filter by phase, category, impact, person, date; full-text keyword search | Retrieve rationale in under 30 seconds |
| **Phase Coverage Map** | Dashboard visualization showing which project phases have documented decisions and which have gaps | 80% decision capture visibility |
| **Completeness Tracking** | Per-decision ring indicator + aggregate dashboard metric | Identify incomplete records |
| **Multi-Project Support** | Create and switch between projects; decisions organized per project | Real-world multi-site use |
| **Export** | Copy to clipboard or download as plain text / CSV | Present rationale when questioned |
| **Edit After Capture** | Quick captures can be enriched later with alternatives, people, risks | Progressive documentation |

### AI Engine (Dual Mode)

DecisionTrail supports two AI modes, toggled from the sidebar:

- **Simulated Mode** (default): Regex-based classifier that auto-detects project phase, decision category, and impact level. Zero API cost, works offline, ideal for demos and testing.
- **Claude AI Mode**: Calls the Anthropic Claude API to parse conversational input and generate structured decision records with richer context extraction. Requires an API key.

### Decision Classification

Every decision is automatically tagged with:

- **Phase**: Planning, Procurement, Installation, Commissioning, Closeout
- **Category**: Engineering, Scheduling, Budget, Safety, Scope, Vendor, Resource
- **Impact**: Low, Medium, High, Critical

### Sample Data and Real Data Sources

DecisionTrail ships with **24+ real and domain-specific decisions** seeded from multiple sources:

| Source | Records | What It Provides |
|---|---|---|
| **Industrial Equipment Decisions** (handcrafted, Van Dyk-grounded) | 12 | Full decision records with rationale from real MRF installation scenarios: equipment substitutions, conveyor reroutes, vendor switches, safety compliance, scope changes, resource allocation |
| **NASA TechPort API** (`techport.nasa.gov/api`) | 12+ | Real NASA R&D project decisions with descriptions, benefits analysis, organizational data, and technology readiness assessments |

The seed script (`scripts/seed.mjs`) fetches live data from NASA's public REST API and combines it with domain-specific industrial equipment decisions. Run `node scripts/seed.mjs` to populate your Supabase instance.

**Data architecture:** Supabase (PostgreSQL) with full-text search indexes, row-level security, and a localStorage fallback for offline/demo use.

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

The app opens at `http://localhost:3000`. Works immediately with localStorage and sample data, no backend setup required.

### Environment Variables (Optional)

```bash
cp .env.example .env
```

| Variable | Purpose | Required? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Optional |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for Claude AI mode | Optional |

### Supabase Setup (Optional)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run `supabase/schema.sql`
3. Copy your project URL and anon key into `.env`

Without Supabase, the app uses localStorage with full functionality.

### Deployment (Vercel)

```bash
npm run build
# Deploy the `dist/` folder to Vercel, Netlify, or any static host
```

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6 |
| Styling | Tailwind CSS 3.4, custom design system |
| Animation | Framer Motion 11 |
| Persistence | Supabase (primary), localStorage (fallback) |
| AI | Anthropic Claude API + simulated classifier |
| Icons | Lucide React |
| Export | Native Blob/Clipboard API |

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
    ai.js                # Simulated classifier + Claude API integration
    supabase.js          # Supabase client + localStorage fallback layer
    data.js              # Sample decisions, project defaults, prompt definitions
  hooks/
    useStore.js          # Central state management with persistence
  App.jsx                # Layout shell, routing, toast notifications
  index.css              # Tailwind layers + custom component classes
supabase/
  schema.sql             # Complete database schema with indexes and RLS policies
```

### Design Decisions

- **Dark industrial theme** with teal/emerald accents reflecting the equipment installation context
- **IBM Plex Sans** typography for clarity at all sizes
- **Glass morphism panels** with subtle backdrop blur for visual depth
- **Chat-style capture UI** to feel like a conversation, not a form
- **All prompts use plain workplace language** (no PM jargon, per project constraints)

---

## Mapping to Success Criteria

From the M1 Project Charter (Section 1.6):

| Criterion | How DecisionTrail Addresses It |
|---|---|
| Log a decision in under 2 minutes | Quick Capture mode with live timer; only "what" and "why" required |
| Retrieve rationale in under 30 seconds | Full-text search + phase/category/impact/person filters |
| 80% of decisions captured with complete rationale | Completeness tracking ring on every decision + dashboard aggregate |
| Reduce scope disputes by 50% | Phase coverage map highlights documentation gaps before they become disputes |
| Colleague feels more confident when questioned | One-click copy of structured rationale; searchable history |
| No PM training or onboarding required | Plain language prompts; conversational AI; no decision matrix jargon |

---

## Team

| Member | Role | Contributions |
|---|---|---|
| **Ajith Srikanth** | SME, AI Integration Lead | Architecture, full-stack development, AI classifier design, domain expertise |
| **Kaylee Tanoto** | POC, Feedback Coordinator, Lead Editor | Prompt flow design, user guide, deliverable editing, usability testing |
| **Nathaniel Cramer** | Meeting Scheduler, Tasking Coordinator, Presentation Lead | Decision taxonomy, sample data, test scenarios, demo presentation |

---

## Course Context

**EMGT 5220: Engineering Project Management**
Northeastern University, Graduate School of Engineering
Summer 1 2026 | Dr. Tristan Johnson

This tool was designed for a Field Project Coordinator at a mid-size industrial equipment solutions provider who manages installation timelines, vendor schedules, and site logistics for large-scale recycling and material processing systems.

---

## License

Academic project for Northeastern University EMGT 5220. Not for commercial distribution.
