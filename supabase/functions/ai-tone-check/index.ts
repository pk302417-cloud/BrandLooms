const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ToneFinding {
  category: "Tone";
  severity: "low" | "medium";
  status: "suggested-fix";
  confidence: "Medium";
  matched: string;
  reason: string;
  fix: string;
}

const HEURISTICS: { test: RegExp; matched: RegExp; reason: string; fix: (m: string) => string; severity: "low" | "medium" }[] = [
  {
    test: /\bvery\s+\w+/gi,
    matched: /\b(very\s+\w+)/gi,
    reason: "The word 'very' weakens copy. A stronger adjective is more confident and plain.",
    fix: (m) => m.replace(/very\s+/i, ""),
    severity: "low",
  },
  {
    test: /\breally\s+\w+/gi,
    matched: /\b(really\s+\w+)/gi,
    reason: "The word 'really' is a filler intensifier. Our voice is confident without it.",
    fix: (m) => m.replace(/really\s+/i, ""),
    severity: "low",
  },
  {
    test: /\bjust\s+\w+/gi,
    matched: /\b(just\s+\w+)/gi,
    reason: "The word 'just' hedging weakens the statement. Consider removing it for a more confident tone.",
    fix: (m) => m.replace(/just\s+/i, ""),
    severity: "low",
  },
  {
    test: /\bamazing\b|\bincredible\b|\bawesome\b|\bstunning\b/gi,
    matched: /\b(amazing|incredible|awesome|stunning)\b/gi,
    reason: "Hyperbolic adjectives like this are off-brand. Our voice is confident and plain, not sensational.",
    fix: (m) => m.toLowerCase() === m ? "excellent" : "Excellent",
    severity: "medium",
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const text: string = body.text;
    const audience: string = body.audience ?? "General public";

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ findings: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const findings: ToneFinding[] = [];

    for (const heuristic of HEURISTICS) {
      for (const match of text.matchAll(heuristic.matched)) {
        const matched = match[0];
        findings.push({
          category: "Tone",
          severity: heuristic.severity,
          status: "suggested-fix",
          confidence: "Medium",
          matched,
          reason: `${heuristic.reason} (Audience: ${audience})`,
          fix: heuristic.fix(matched),
        });
      }
    }

    return new Response(JSON.stringify({ findings }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
