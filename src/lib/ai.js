// AI Classification and Claude API integration for DecisionTrail

export const PHASES = ['Planning', 'Procurement', 'Installation', 'Commissioning', 'Closeout'];
export const CATEGORIES = ['Engineering', 'Scheduling', 'Budget', 'Safety', 'Scope', 'Vendor', 'Resource'];
export const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

// ---- Simulated AI Classifier ----
const PHASE_PATTERNS = {
  Planning: /\b(plan|design|blueprint|spec|requirement|draft|scope|initial|proposal|assess)\b/i,
  Procurement: /\b(procur|order|vendor|supplier|material|purchas|contract|bid|quote|RFQ)\b/i,
  Installation: /\b(install|site|field|mount|wir|connect|assembl|configur|position|place|bolt)\b/i,
  Commissioning: /\b(commission|test|calibrat|startup|handover|verify|validate|tune|QA|acceptance)\b/i,
  Closeout: /\b(close|punch|final|handoff|lesson|retrospect|document|archive|warranty)\b/i,
};

const CATEGORY_PATTERNS = {
  Scheduling: /\b(schedul|delay|timeline|deadline|date|duration|milestone|lead.?time)\b/i,
  Budget: /\b(budget|cost|expense|price|fund|financ|invoice|overrun|savings)\b/i,
  Safety: /\b(safe|hazard|osha|ppe|risk|incident|lockout|guard|complian)\b/i,
  Scope: /\b(scope|change.?order|requirement|feature|add|remov|modify|amend)\b/i,
  Vendor: /\b(vendor|supplier|contract|subcontract|OEM|manufacturer|distributor)\b/i,
  Resource: /\b(resource|staff|crew|team|hire|headcount|overtime|capacity|labor)\b/i,
  Engineering: /\b(engineer|technical|design|motor|sensor|conveyor|mesh|spec|torque|voltage)\b/i,
};

const IMPACT_PATTERNS = {
  Critical: /\b(critical|emergency|urgent|blocker|stop.?work|safety.?hazard|showstopper)\b/i,
  High: /\b(major|significant|large|substantial|expensive|delay.?project)\b/i,
  Low: /\b(minor|small|low|trivial|cosmetic|nice.?to.?have)\b/i,
};

export function classifyDecision(text) {
  const combined = typeof text === 'string' ? text : Object.values(text).join(' ');
  const lower = combined.toLowerCase();

  let phase = 'Installation';
  for (const [p, rx] of Object.entries(PHASE_PATTERNS)) {
    if (rx.test(lower)) { phase = p; break; }
  }

  let category = 'Engineering';
  for (const [c, rx] of Object.entries(CATEGORY_PATTERNS)) {
    if (rx.test(lower)) { category = c; break; }
  }

  let impact = 'Medium';
  for (const [i, rx] of Object.entries(IMPACT_PATTERNS)) {
    if (rx.test(lower)) { impact = i; break; }
  }

  return { phase, category, impact };
}

// ---- Generate AI summary from answers ----
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

// ---- Gemini API Integration ----
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
