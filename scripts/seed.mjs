/**
 * DecisionTrail Data Seeder
 * Fetches real NTSB investigation data, transforms into DecisionTrail format,
 * and seeds Supabase + generates local sample data.
 *
 * Usage: node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cknntwmzaxetjictxqyz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_N120Lx_iEbBxqbfJUsNrnQ_METAp1f2';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const uid = () => 'dec-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pid = () => 'proj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));


// ── NTSB CAROL API ──
// Fetches real investigation records from the public NTSB database
async function fetchNTSBData() {
  console.log('Fetching NTSB CAROL data...');
  
  // CAROL public aviation API endpoint
  const url = 'https://data.ntsb.gov/carol-repgen/api/Aviation/ReportMain';
  
  try {
    // Fetch recent investigations with probable cause determined
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Results: true,
        ResultsPage: 0,
        ResultsPerPage: 30,
        SortColumn: 'EventDate',
        SortOrder: 'desc',
        Ession: {},
        QueryList: [
          { ColumnName: 'ProbableCause', Operator: 'true', DataType: 'Boolean', FilterValues: [] },
          { ColumnName: 'EventDate', Operator: 'between', DataType: 'date', FilterValues: ['01/01/2023', '12/31/2025'] }
        ]
      })
    });

    if (!response.ok) throw new Error(`NTSB API: ${response.status}`);
    const data = await response.json();
    console.log(`  Got ${data.Results?.length || 0} NTSB records`);
    return data.Results || [];
  } catch (err) {
    console.log(`  NTSB fetch failed: ${err.message}, using fallback data`);
    return [];
  }
}

function transformNTSB(records) {
  const phases = ['Planning', 'Procurement', 'Installation', 'Commissioning', 'Closeout'];
  const categories = ['Engineering', 'Safety', 'Scheduling', 'Budget', 'Scope', 'Vendor', 'Resource'];
  const impacts = ['Low', 'Medium', 'High', 'Critical'];

  return records.map((r, i) => {
    // Map NTSB fields to DecisionTrail fields
    const what = r.ProbableCause || r.ReportNarrative || 'Investigation finding documented';
    const location = [r.City, r.State].filter(Boolean).join(', ');
    
    return {
      id: uid(),
      project_id: null, // assigned later
      project_name: null,
      what: truncate(what, 500),
      why: r.ProbableCause 
        ? `Root cause analysis: ${truncate(r.ProbableCause, 400)}`
        : 'Probable cause under investigation',
      alternatives: r.ReportNarrative 
        ? `Investigation examined: ${truncate(r.ReportNarrative, 300)}`
        : '',
      who: [r.OperatorName, r.InvestigationType, location].filter(Boolean).join('; '),
      risks: r.InjurySeverity 
        ? `Severity: ${r.InjurySeverity}. ${r.AircraftDamage ? 'Damage: ' + r.AircraftDamage : ''}`
        : '',
      phase: phases[i % phases.length],
      category: r.InjurySeverity === 'Fatal' ? 'Safety' : categories[i % categories.length],
      impact: r.InjurySeverity === 'Fatal' ? 'Critical' 
        : r.InjurySeverity === 'Serious' ? 'High' 
        : r.AircraftDamage === 'Destroyed' ? 'High'
        : impacts[i % impacts.length],
      summary: truncate(
        `${r.EventDate?.split('T')[0] || ''} ${location}: ${what}`, 
        80
      ),
      completeness: what && r.ProbableCause ? 100 : 60,
      created_at: r.EventDate || new Date().toISOString(),
    };
  });
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 3) + '...' : str;
}


// ── Handcrafted industrial equipment decisions (Van Dyk-inspired) ──
const INDUSTRIAL_DECISIONS = [
  {
    what: 'Replaced OEM ballistic separator membranes with third-party polyurethane screens after accelerated wear observed at 800 operating hours.',
    why: 'OEM membranes rated for 2000 hours showed 60% thickness loss at 800 hours due to higher-than-expected glass contamination in the incoming waste stream. Third-party polyurethane screens are rated for abrasive environments and cost 40% less per unit.',
    alternatives: 'Considered reducing throughput to extend membrane life (rejected: 30% capacity loss unacceptable). Also evaluated ceramic-coated screens (rejected: 12-week lead time, $22K premium).',
    who: 'Maintenance Supervisor, Equipment OEM Rep, Plant Manager',
    risks: 'Third-party screens void the OEM maintenance agreement for the ballistic separator. Warranty implications documented and accepted by plant ownership.',
    phase: 'Installation', category: 'Engineering', impact: 'High',
    summary: 'Switched ballistic separator membranes to third-party polyurethane screens',
  },
  {
    what: 'Rerouted fiber optic trunk line for NIR sorter array after discovering underground water main during cable trench excavation.',
    why: 'Water main was not shown on as-built drawings provided by the municipality. Crossing or relocating the water main requires a city permit with 4-6 week processing time.',
    alternatives: 'Option A: Apply for permit to cross the water main (rejected, 4-6 week delay). Option B: Run aerial cable tray from Building A to the sorting hall (selected, 3-day install, $4,200).',
    who: 'Electrical Contractor, City Utilities Inspector, Site Superintendent',
    risks: 'Aerial cable tray exposed to weather. UV-rated conduit specified. Annual inspection added to maintenance schedule.',
    phase: 'Installation', category: 'Engineering', impact: 'Medium',
    summary: 'Rerouted NIR sorter fiber optics via aerial tray to avoid unmapped water main',
  },
  {
    what: 'Delayed eddy current separator commissioning by 10 days to allow concrete cure time for reinforced equipment pad.',
    why: 'Structural engineer required 28-day cure for the 18-inch reinforced pad supporting the eddy current separator (7,200 lb operating weight). Original schedule assumed standard 14-day cure for a lighter pad specification.',
    alternatives: 'Accelerated-cure concrete additive (rejected: structural engineer would not certify load rating). Temporary steel platform (rejected: vibration isolation requirements not met).',
    who: 'Structural Engineer, Concrete Subcontractor, Project Scheduler',
    risks: 'Ten-day delay pushes non-ferrous metals recovery testing into Week 14. Client informed and accepted revised timeline.',
    phase: 'Commissioning', category: 'Scheduling', impact: 'High',
    summary: 'Extended concrete cure time delayed eddy current separator commissioning 10 days',
  },
  {
    what: 'Selected Siemens VFD over originally specified ABB ACS580 for the main conveyor belt drive.',
    why: 'ABB distributor confirmed 16-week lead time for the ACS580 in the required frame size. Siemens SINAMICS G120 available from regional stock in 5 days with equivalent specifications.',
    alternatives: 'Wait for ABB unit (rejected: 16-week delay unacceptable). Danfoss FC302 also available in 2 weeks but lacked the required Safe Torque Off feature for OSHA compliance.',
    who: 'Procurement Manager, Electrical Engineer, ABB Regional Sales, Siemens Distributor',
    risks: 'PLC integration code needs modification for Siemens PROFINET protocol vs ABB Modbus TCP. Estimated 2 days of PLC programming.',
    phase: 'Procurement', category: 'Vendor', impact: 'High',
    summary: 'Switched main conveyor VFD from ABB to Siemens due to 16-week lead time',
  },
  {
    what: 'Added fall protection anchor points to the optical sorter maintenance platform that were not in the original design.',
    why: 'OSHA compliance review identified that technicians performing NIR sensor calibration must work at 14-foot elevation without tie-off points. Original platform design did not account for overhead maintenance access.',
    alternatives: 'Mobile scaffolding for each calibration event (rejected: 45-minute setup time per event, calibration needed weekly). Scissor lift (rejected: insufficient clearance under the sorting hood).',
    who: 'Safety Officer, OSHA Compliance Consultant, Structural Fabricator',
    risks: 'Platform modification requires re-certification of the structural load rating. PE stamp obtained before work proceeds.',
    phase: 'Installation', category: 'Safety', impact: 'Critical',
    summary: 'Added OSHA-required fall protection anchors to optical sorter maintenance platform',
  },
  {
    what: 'Approved client change order to add a glass cleanup system downstream of the optical sorters.',
    why: 'Client processing agreement with the county requires less than 2% glass contamination in fiber output. Initial commissioning tests showed 3.8% glass. A dedicated glass cleanup screen resolves this without reworking the optical sorter programming.',
    alternatives: 'Retune optical sorter ejection timing (attempted first, reduced glass to 2.9% but could not meet 2% target). Add manual quality control station (rejected: requires 2 FTE permanently).',
    who: 'Client VP Operations, Process Engineer, Sales Engineering',
    risks: 'Scope addition: $47K equipment cost, 6-day installation window. Must be completed before county audit in Week 16.',
    phase: 'Commissioning', category: 'Scope', impact: 'High',
    summary: 'Added glass cleanup system to meet county contamination requirement',
  },
  {
    what: 'Allocated $8,500 contingency for potential conveyor belt tracking issues during loaded commissioning.',
    why: 'Belt tracking under empty conditions passed all tests, but loaded belt behavior with mixed waste stream is unpredictable. Historical data from three similar installations showed 2 out of 3 required tracking adjustments costing $3K-$12K.',
    alternatives: 'No contingency (rejected: unbudgeted expense would require emergency change order). Over-engineer tracking guides at install (rejected: $15K and uncertain benefit).',
    who: 'Project Manager, Finance Controller, Commissioning Lead',
    risks: 'If not needed, funds return to project margin. If exceeded, triggers formal change order process.',
    phase: 'Planning', category: 'Budget', impact: 'Low',
    summary: 'Set aside $8,500 contingency for conveyor belt tracking during commissioning',
  },
  {
    what: 'Hired three temporary millwrights from the local union hall for the two-week heavy equipment setting phase.',
    why: 'Core crew of four millwrights cannot safely set the trommel screen (28,000 lb), ballistic separator (12,500 lb), and optical sorter frames (8,200 lb each) within the two-week equipment setting window.',
    alternatives: 'Extended the setting phase to three weeks (rejected: delays downstream electrical and piping trades). Subcontracted to a rigging company (rejected: $38K vs $16K for temporary labor).',
    who: 'Site Superintendent, Millwright Foreman, Local 1007 Union Hall',
    risks: 'Temporary workers need one day of site-specific safety orientation. Crane operator availability confirmed for full two-week window.',
    phase: 'Installation', category: 'Resource', impact: 'Medium',
    summary: 'Brought in three temporary millwrights for heavy equipment setting phase',
  },
  {
    what: 'Specified IP67-rated junction boxes for all field wiring connections in the tipping floor area.',
    why: 'Tipping floor environment produces constant airborne dust, moisture from waste streams, and periodic washdown with pressurized water. Standard IP54 enclosures used in initial spec would not survive washdown cycles.',
    alternatives: 'IP54 with additional weather shields (rejected: shields obstruct maintenance access). Routing all connections to a remote panel room (rejected: adds 200+ feet of conduit run and signal degradation for proximity sensors).',
    who: 'Electrical Engineer, Controls Integrator, Plant Operations Manager',
    risks: 'IP67 boxes cost 3x standard. Total premium: $6,800 across 42 junction points. Approved within contingency budget.',
    phase: 'Planning', category: 'Engineering', impact: 'Medium',
    summary: 'Upgraded all tipping floor junction boxes to IP67 rating for washdown survival',
  },
  {
    what: 'Negotiated 90-day payment terms with the optical sorter OEM instead of standard 30-day NET.',
    why: 'Client milestone payment for equipment procurement phase is tied to factory acceptance test completion, which is 75 days after PO issuance. Standard 30-day terms would require bridge financing at 8.5% APR.',
    alternatives: 'Bridge loan from project lender (rejected: 8.5% APR on $340K for 45 days = $3,570 interest cost). Advance client milestone payment (client declined, citing their own cash flow constraints).',
    who: 'Procurement Director, OEM Sales VP, Client CFO',
    risks: 'OEM required a 2% premium on equipment price ($6,800) for extended terms. Net savings vs bridge financing: $3,570 minus $6,800 = net cost of $3,230, but eliminates financing complexity and lender reporting requirements.',
    phase: 'Procurement', category: 'Budget', impact: 'Medium',
    summary: 'Extended optical sorter payment terms to 90 days to align with client milestones',
  },
  {
    what: 'Deferred closeout documentation package by two weeks to incorporate final commissioning test data.',
    why: 'Client contract requires as-built drawings to reflect actual sensor positions, which shifted during commissioning optimization. Submitting preliminary as-builts would trigger a revision cycle that costs more time than waiting.',
    alternatives: 'Submit preliminary as-builts with revision planned (rejected: client PM stated revisions would delay their county operating permit application). Rush the documentation with estimated positions (rejected: PE would not stamp inaccurate as-builts).',
    who: 'Project Engineer, Client PM, PE of Record',
    risks: 'Two-week deferral delays final retention payment release. Client accepted with written confirmation that retention clock pauses during documentation completion.',
    phase: 'Closeout', category: 'Scheduling', impact: 'Medium',
    summary: 'Deferred closeout docs two weeks to include final commissioning sensor positions',
  },
  {
    what: 'Replaced originally specified Allen-Bradley CompactLogix PLC with a Siemens S7-1500 for the central sorting control system.',
    why: 'Controls integrator assigned to the project has exclusively Siemens-certified programmers. Using Allen-Bradley would require subcontracting PLC programming at $185/hr vs in-house Siemens work at $95/hr, and would extend controls integration by 3 weeks.',
    alternatives: 'Subcontract AB programming (rejected: $185/hr premium, 3-week schedule impact). Train existing staff on AB (rejected: 6-week certification timeline). Find a different integrator (rejected: project-specific knowledge transfer too costly mid-project).',
    who: 'Controls Integration Manager, Electrical Engineer, Project Manager',
    risks: 'Client maintenance team is trained on Allen-Bradley. Transition training for S7-1500 included in commissioning scope at no additional cost.',
    phase: 'Planning', category: 'Engineering', impact: 'High',
    summary: 'Switched PLC platform from Allen-Bradley to Siemens S7-1500 for integrator alignment',
  },
];


// ── Projects to organize decisions under ──
const PROJECTS = [
  { id: pid(), name: 'Greenfield MRF Installation', client: 'Metro Waste Solutions', status: 'active', created_at: '2026-01-15' },
  { id: pid(), name: 'Conveyor Line Retrofit', client: 'Pacific Recycling Corp', status: 'active', created_at: '2026-03-01' },
  { id: pid(), name: 'Optical Sorter Upgrade', client: 'Tri-County Disposal', status: 'completed', created_at: '2025-10-20' },
  { id: pid(), name: 'NTSB Safety Analysis Cases', client: 'Public Safety Database', status: 'active', created_at: '2024-01-01' },
];

// ── Main seed function ──
async function seed() {
  console.log('\n=== DecisionTrail Data Seeder ===\n');

  // 1. Insert projects
  console.log('1. Seeding projects...');
  const { error: projErr } = await supabase.from('projects').upsert(PROJECTS, { onConflict: 'id' });
  if (projErr) {
    console.log(`   Projects error: ${projErr.message}`);
    console.log('   Make sure you ran supabase/schema.sql in the SQL Editor first!');
    process.exit(1);
  }
  console.log(`   Inserted ${PROJECTS.length} projects`);

  // 2. Prepare industrial decisions
  console.log('2. Preparing industrial equipment decisions...');
  const industrialDecs = INDUSTRIAL_DECISIONS.map((d, i) => ({
    ...d,
    id: uid(),
    project_id: PROJECTS[i % 3].id,
    project_name: PROJECTS[i % 3].name,
    completeness: d.alternatives && d.who && d.risks ? 100 : 80,
    created_at: new Date(2026, 2 + Math.floor(i / 3), 5 + i * 2).toISOString(),
  }));
  console.log(`   Prepared ${industrialDecs.length} industrial decisions`);

  // 3. Fetch NTSB data
  console.log('3. Fetching NTSB CAROL data...');
  const ntsbRaw = await fetchNTSBData();
  let ntsbDecs = [];
  if (ntsbRaw.length > 0) {
    ntsbDecs = transformNTSB(ntsbRaw).map(d => ({
      ...d,
      project_id: PROJECTS[3].id,
      project_name: PROJECTS[3].name,
    }));
    console.log(`   Transformed ${ntsbDecs.length} NTSB records`);
  }

  // 4. Combine and insert
  const allDecisions = [...industrialDecs, ...ntsbDecs];
  console.log(`\n4. Inserting ${allDecisions.length} total decisions...`);
  
  // Insert in batches of 20
  for (let i = 0; i < allDecisions.length; i += 20) {
    const batch = allDecisions.slice(i, i + 20);
    const { error } = await supabase.from('decisions').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.log(`   Batch error at ${i}: ${error.message}`);
    } else {
      console.log(`   Batch ${Math.floor(i/20) + 1}: inserted ${batch.length} records`);
    }
    await sleep(200);
  }

  // 5. Verify
  const { count } = await supabase.from('decisions').select('*', { count: 'exact', head: true });
  console.log(`\n=== Done! ${count} decisions in Supabase ===`);
  console.log('Projects:', PROJECTS.map(p => p.name).join(', '));
  console.log('\nRefresh DecisionTrail in your browser to see the data.\n');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

