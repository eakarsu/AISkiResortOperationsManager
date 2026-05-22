const fetch = require('node-fetch');

async function callAI(systemPrompt, userPrompt, retries = 1) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey) {
    const err = new Error('AI service unavailable: OPENROUTER_API_KEY not set');
    err.statusCode = 503;
    throw err;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:4000',
        'X-Title': 'AI Ski Resort Operations Manager',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const data = await response.json();

    if (response.status === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, 2000));
      return callAI(systemPrompt, userPrompt, retries - 1);
    }

    if (data.error) {
      throw new Error(data.error.message || 'AI service error');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid AI response structure');
    }

    return data.choices[0].message.content;
  } catch (err) {
    if (err.message.includes('429') && retries > 0) {
      await new Promise(r => setTimeout(r, 2000));
      return callAI(systemPrompt, userPrompt, retries - 1);
    }
    throw err;
  }
}

/**
 * 3-strategy JSON parser
 */
function parseAIJson(raw) {
  // Strategy 1: direct parse
  try { return JSON.parse(raw); } catch (_) {}

  // Strategy 2: markdown code block
  const mdMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1].trim()); } catch (_) {}
  }

  // Strategy 3: find first balanced { or [
  const start = raw.search(/[{\[]/);
  if (start !== -1) {
    const opener = raw[start];
    const closer = opener === '{' ? '}' : ']';
    let depth = 0;
    for (let i = start; i < raw.length; i++) {
      if (raw[i] === opener) depth++;
      if (raw[i] === closer) depth--;
      if (depth === 0) {
        try { return JSON.parse(raw.slice(start, i + 1)); } catch (_) { break; }
      }
    }
  }
  return null;
}

module.exports = { callAI, parseAIJson };
