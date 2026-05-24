// AI Classification and Gemini API integration for DecisionTrail

export const PHASES = ['Planning', 'Procurement', 'Installation', 'Commissioning', 'Closeout'];
export const CATEGORIES = ['Engineering', 'Scheduling', 'Budget', 'Safety', 'Scope', 'Vendor', 'Resource'];
export const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

// Patterns weighted toward distinctive vocabulary. Score = number of matches.
const PHASE_PATTERNS = {
  Planning: /\b(plan|design|blueprint|spec(ification)?|requirement|draft|scope|initial|proposal|assess|kickoff|kick.?off|charter)\b/gi,
  Procurement: /\b(procur|order|vendor|supplier|material|purchas|contract|bid|quote|RFQ|PO\b|invoice|deliver)\b/gi,
  Installation: /\b(install|site|field|mount|wir(e|ing)|connect|assembl|configur|position|bolt|weld|erect|on.?site)\b/gi,
  Commissioning: /\b(commission|test|calibrat|startup|start.?up|handover|verify|validate|tune|QA|acceptance|FAT|SAT)\b/gi,
  Closeout: /\b(close.?out|punch.?list|final|handoff|hand.?off|lesson|retrospect|archive|warranty|final.?walk)\b/gi,
};

const CATEGORY_PATTERNS = {
  Scheduling: /\b(schedul|delay|timeline|deadline|due.?date|duration|milestone|lead.?time|gantt|critical.?path)\b/gi,
  Budget: /\b(budget|cost|expense|price|fund|financ|invoice|overrun|saving|\$\d|dollar|ROI)\b/gi,
  Safety: /\b(safe|hazard|OSHA|PPE|lockout|tagout|guard|complian|injury|incident|near.?miss)\b/gi,
  Scope: /\b(scope|change.?order|requirement|feature|add(ed|ing)?|remov|modify|amend|deviation)\b/gi,
  Vendor: /\b(vendor|supplier|subcontract|OEM|manufacturer|distributor|third.?party)\b/gi,
  Resource: /\b(resource|staff|crew|team|hire|headcount|overtime|capacity|labor|second.?shift|backfill)\b/gi,
  Engineering: /\b(engineer|technical|motor|sensor|conveyor|mesh|torque|voltage|amperage|gauge|bearing|drive|PLC|HMI|drawing)\b/gi,
};

const IMPACT_PATTERNS = {
  Critical: /\b(critical|emergency|urgent|blocker|stop.?work|safety.?hazard|showstopper|catastroph|fail)\b/gi,
  High: /\b(major|significant|substantial|expensive|delay.?project|client.?escalat|large)\b/gi,
  Low: /\b(minor|small|trivial|cosmetic|nice.?to.?have|negligible)\b/gi,
};

function scoreMatches(text, patterns, fallback) {
  let best = fallback;
  let bestScore = 0;
  for (const [label, rx] of Object.entries(patterns)) {
    const matches = text.match(rx);
    const score = matches ? matches.length : 0;
    if (score > bestScore) {
      bestScore = score;
      best = label;
    }
  }
  return best;
}

export function classifyDecision(text) {
  const combined = typeof text === 'string' ? text : Object.values(text).join(' ');
  const lower = combined.toLowerCase();

  const phase = scoreMatches(lower, PHASE_PATTERNS, 'Installation');
  const category = scoreMatches(lower, CATEGORY_PATTERNS, 'Engineering');
  const impact = scoreMatches(lower, IMPACT_PATTERNS, 'Medium');

  return { phase, category, impact };
}

// Generate summary from answers
export function generateSummary(answers) {
  const what = answers.what || '';
  const why = answers.why || '';
  const firstSentence = what.length > 120 ? what.slice(0, 117) + '...' : what;
  return `${firstSentence} This decision was driven by: ${why.length > 80 ? why.slice(0, 77) + '...' : why}`;
}

const SYSTEM_PROMPT = `You are an AI assistant inside DecisionTrail, a decision documentation tool for field project coordinators at an industrial equipment installation company. Your job is to help structure decision records.

Given a user's conversational description of a project decision, extract and return ONLY a JSON object (no markdown, no backticks) with these fields:
- "what": concise statement of what was decided (1-2 sentences)
- "why": the reasoning behind the decision (1-2 sentences)
- "alternatives": alternatives considered and why they were rejected (1-2 sentences, or "None mentioned")
- "who": people involved (comma-separated names/roles, or "Not specified")
- "risks": risks or trade-offs (1 sentence, or "None identified")
- "phase": one of [Planning, Procurement, Installation, Commissioning, Closeout]
- "category": one of [Engineering, Scheduling, Budget, Safety, Scope, Vendor, Resource]
- "impact": one of [Low, Medium, High, Critical]
- "summary": a one-line summary suitable for a card title (under 80 chars)

Use plain workplace language. No PM jargon.`;

// Gemini API Integration
const GEMINI_KEY = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_GEMINI_API_KEY || ''
  : '';

export const isAIConfigured = () => !!GEMINI_KEY;
// Keep old name for backward compat
export const isClaudeConfigured = isAIConfigured;

export async function classifyWithClaude(userInput) {
  if (!GEMINI_KEY) throw new Error('Gemini API key not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userInput }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
