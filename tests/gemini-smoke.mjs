import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildGeminiRequest, geminiAnswer, configuredGeminiModel, DEFAULT_GEMINI_MODEL } from '../supabase/functions/_shared/gemini-request.mjs';
const prompt = buildGeminiRequest('Speak Sinhala', [
  {role:'assistant',content:'Starting bot message should be removed'},
  {role:'user',content:'Tell me about Sri Lanka'},
  {role:'assistant',content:'It is an island'},
], 'Tell me about Sigiriya');
assert.equal(DEFAULT_GEMINI_MODEL, 'gemini-3.5-flash-lite');
assert.equal(prompt.contents[0].role, 'user');
assert.equal(prompt.contents[1].role, 'model');
assert.equal(prompt.contents[2].role, 'user');
assert.equal(prompt.contents[2].parts[0].text, 'Tell me about Sigiriya');
assert.deepEqual(prompt.systemInstruction, {parts:[{text:'Speak Sinhala'}]});
assert.equal(geminiAnswer({candidates:[{content:{parts:[{text:'Hello'},{text:'world'}]}}]}), 'Hello\nworld');
assert.equal(geminiAnswer({promptFeedback:{blockReason:'SAFETY'}}), '');
assert.equal(configuredGeminiModel('evil/unsafe'), 'gemini-3.5-flash-lite');
assert.equal(configuredGeminiModel('gemini-3.8-flash'), 'gemini-3.8-flash');
const edge = fs.readFileSync(new URL('../supabase/functions/travel-ai/index.ts',import.meta.url),'utf8');
assert(edge.includes("Deno.env.get('GEMINI_API_KEY')"));
assert(edge.includes("'x-goog-api-key': apiKey"));
assert(edge.includes('await quota('));
assert(!edge.includes('OPENAI_API_KEY') && !edge.includes('api.openai.com'));
console.log('PASS Gemini REST body, roles, output parsing, model selection, secret-only key, rate-limiter integration');
