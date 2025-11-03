export const dynamic = 'force-dynamic';

function getClientIP(req) {
  try {
    const xf = req.headers.get('x-forwarded-for');
    if (xf) return xf.split(',')[0].trim();
  } catch {}
  return 'anon';
}

// Very basic in-memory rate limiter (per IP)
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 20; // 20 requests/minute per IP
const buckets = new Map(); // ip -> { ts: number[] }

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip) || { ts: [] };
  // Drop old timestamps
  bucket.ts = bucket.ts.filter((t) => now - t < RATE_WINDOW_MS);
  if (bucket.ts.length >= RATE_MAX) {
    buckets.set(ip, bucket);
    return true;
  }
  bucket.ts.push(now);
  buckets.set(ip, bucket);
  return false;
}

function truncateServices(services, max = 20) {
  if (!Array.isArray(services)) return [];
  const trimmed = services.slice(0, max).map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category || s.category_name || '',
    description: (s.description || '').slice(0, 400),
    pricing_note: (s.pricing_note || s.price_range || '').slice(0, 120),
  }));
  return trimmed;
}

// Simple local matcher to ensure we always reply even without an API key
function localSuggest(message, services = [], categories = []) {
  const text = (message || '').toLowerCase();
  const scoreService = (s) => {
    let score = 0;
    const hay = [s.name, s.category, s.description].join(' ').toLowerCase();
    const keywords = [
      'clean', 'cleaning', 'deep', 'move', 'moving', 'pack', 'packing', 'event', 'wedding', 'office', 'house', 'home', 'apartment', 'kitchen', 'bathroom', 'construction', 'post-construction', 'sanitize'
    ];
    for (const k of keywords) {
      if (text.includes(k) && hay.includes(k)) score += 2;
    }
    // Fuzzy containment of important nouns
    if (text.includes('move') && /move|pack|truck/i.test(hay)) score += 3;
    if (text.includes('clean') && /clean|sanitize|deep/i.test(hay)) score += 3;
    if (text.includes('event') && /event|wedding|party|corporate/i.test(hay)) score += 3;
    // People count hint
    const peopleMatch = text.match(/(\d+)\s*(person|people|cleaner|mover)s?/i);
    if (peopleMatch) score += 1;
    return score;
  };

  const ranked = [...services]
    .map((s) => ({ s, score: scoreService(s) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked.filter((r) => r.score > 0).slice(0, 3).map((r) => r.s);

  const picked = top[0] || services[0];
  const categoryHint = picked?.category ? ` in ${picked.category}` : '';

  const steps = [
    'Open the booking page: /booking',
    `Choose the service${picked ? `: ${picked.name}` : ''}`,
    'Enter your address and contact info',
    'Pick your preferred date and time',
    'Add special notes (e.g., number of rooms, people needed)',
    'Confirm to submit the booking',
  ];

  const peopleMatch = text.match(/(\d+)\s*(person|people|cleaner|mover)s?/i);
  const peopleNote = peopleMatch ? ` You asked for ${peopleMatch[1]} people—add this in the notes or quantity field.` : '';

  const pricing = picked?.pricing_note ? ` Pricing: ${picked.pricing_note}.` : '';

  const alt = top.slice(1).map((s) => `- ${s.name}${s.category ? ` (${s.category})` : ''}`).join('\n');

  const reply = [
    picked
      ? `Suggested service${categoryHint}: ${picked.name}.`
      : 'Here are some services that may fit your request.',
    picked?.description ? `Why: ${picked.description}` : undefined,
    pricing || undefined,
    peopleNote || undefined,
    '',
    'How to book:',
    steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    '',
    alt ? `Other options:\n${alt}` : undefined,
    '',
    'Book now: /booking',
  ]
    .filter(Boolean)
    .join('\n');

  return reply;
}

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;

  const ip = getClientIP(req);
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Try again soon.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const message = (body?.message || '').toString().slice(0, 2000);
  const services = truncateServices(body?.services, 30);
  const categories = Array.isArray(body?.categories) ? body.categories.slice(0, 50) : [];

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  const systemPrompt = [
    'You are EliteHands Assistant for a home services website.',
    "Your job: read the user's requirement and pick the most suitable service from the provided services list.",
    'Respond briefly and helpfully: 1) Suggested service name (and why), 2) What info the user should enter during booking (e.g., address, date/time, size/details), 3) Steps to book on the site.',
    'If none fits, suggest the closest and say why. Keep tone friendly, concise, and action-oriented.'
  ].join(' ');

  // Compose contents in Gemini format
  const contents = [
    {
      role: 'user',
      parts: [
        { text: `${systemPrompt}\n\nUser message: ${message}` },
        { text: `\n\nAvailable services (JSON):\n${JSON.stringify(services)}` },
        { text: `\n\nCategories (JSON):\n${JSON.stringify(categories)}` },
      ],
    },
  ];

  try {
    // If no API key, directly fallback to local suggestion
    if (!apiKey) {
      const reply = localSuggest(message, services, categories);
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(apiKey),
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );
    clearTimeout(timeout);

    if (!resp.ok) {
      // Upstream failed — fallback locally
      const reply = localSuggest(message, services, categories);
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') ||
      localSuggest(message, services, categories);

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // Network error or timeout — fallback locally
    const reply = localSuggest(message, services, categories);
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timeout);
  }
}

