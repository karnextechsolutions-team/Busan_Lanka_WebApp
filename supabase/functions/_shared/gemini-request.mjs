// Small dependency-free adapter for the Gemini REST generateContent API.
// This file has no secrets and can be exercised by local Node tests.
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

export function buildGeminiRequest(instructions, history, question) {
  const contents = [];
  const safeTurns = Array.isArray(history) ? history.slice(-8) : [];
  for (const turn of safeTurns) {
    const role = turn?.role === 'assistant' || turn?.role === 'model' ? 'model' : 'user';
    const text = String(turn?.content ?? '').trim().slice(0, 600);
    if (!text) continue;
    // Keep valid, alternating conversation turns; merge repeated speaker messages.
    if (!contents.length && role === 'model') continue;
    if (contents.length && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += '\n' + text;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }
  const message = String(question).trim().slice(0, 650);
  if (contents.length && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += '\n' + message;
  } else {
    contents.push({ role: 'user', parts: [{ text: message }] });
  }
  return {
    systemInstruction: { parts: [{ text: String(instructions) }] },
    contents,
    generationConfig: { temperature: 0.45, maxOutputTokens: 850 },
  };
}

export function geminiAnswer(result) {
  const candidate = result?.candidates?.[0];
  if (!candidate || !Array.isArray(candidate?.content?.parts)) return '';
  return candidate.content.parts
    .filter(part => typeof part?.text === 'string')
    .map(part => part.text)
    .join('\n').trim();
}

export function configuredGeminiModel(envValue) {
  const selected = String(envValue || DEFAULT_GEMINI_MODEL).trim();
  return /^gemini-[a-z0-9.-]{3,70}$/.test(selected) ? selected : DEFAULT_GEMINI_MODEL;
}
