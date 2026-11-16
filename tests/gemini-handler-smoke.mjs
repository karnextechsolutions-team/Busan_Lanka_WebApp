import assert from 'node:assert/strict';
let endpointHandler;
const environment = {
  GEMINI_API_KEY: 'fake-secret-used-only-for-local-mock',
  BUSAN_RATE_LIMIT_SALT: 'fake-test-salt',
  BUSAN_ALLOWED_ORIGINS: 'http://localhost:8080',
  SUPABASE_URL: 'https://test-project.supabase.co',
  SUPABASE_SECRET_KEYS: JSON.stringify({default: 'sb_secret_fake_test_key'}),
};
globalThis.Deno = {
  env: { get: (key) => environment[key] },
  serve(fn) { endpointHandler = fn; },
};
const calls = [];
globalThis.fetch = async (url, options) => {
  calls.push({url: String(url),options});
  if (String(url).includes('/rpc/consume_api_quota')) return Response.json(true);
  if (String(url).includes('/rest/v1/site_content')) return Response.json([{content:{packages:[{name:'Sri Lanka Discovery', days:7, stops:['Negombo','Sigiriya','Kandy']}]}}]);
  if (String(url).includes('generativelanguage.googleapis.com')) {
    assert.equal(options.headers['x-goog-api-key'], environment.GEMINI_API_KEY);
    const body = JSON.parse(options.body);
    assert.equal(body.contents.at(-1).role,'user');
    assert(body.systemInstruction.parts[0].text.includes('Sri Lanka Discovery'));
    return Response.json({candidates:[{content:{parts:[{text:'Willkommen in Sri Lanka!'}]}}]});
  }
  throw new Error(`Unexpected fetch ${url}`);
};
await import('../supabase/functions/travel-ai/index.ts');
assert.equal(typeof endpointHandler, 'function');
const request = new Request('https://test-project.supabase.co/functions/v1/travel-ai', {
  method: 'POST',
  headers: {origin: 'http://localhost:8080', apikey: 'sb_publishable_example', 'Content-Type': 'application/json'},
  body: JSON.stringify({message:'Tell me about Sigiriya', language:'de',history:[{role:'user',content:'Hi'}]}),
});
const result = await endpointHandler(request);
assert.equal(result.status,200);
assert.deepEqual(await result.json(), {answer:'Willkommen in Sri Lanka!',mode:'live',provider:'gemini'});
assert(calls.some(c=>c.url.includes('generateContent')));
const denied = await endpointHandler(new Request('https://test-project.supabase.co/functions/v1/travel-ai',{
  method:'POST',headers:{origin:'https://malicious.example',apikey:'abc'},body:'{}'
}));
assert.equal(denied.status,403);
console.log('PASS simulated Gemini Edge Function (REST request, database quota, CMS context, multilingual reply, rejected origin)');
