import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root = new URL('../',import.meta.url);
const read = path => readFileSync(new URL(path,root),'utf8');
const origin='https://tranquil-marshmallow-7cd3a4.netlify.app';
const originalFetch=globalThis.fetch, originalDeno=globalThis.Deno;
let handler, fetchCount=0;
globalThis.Deno={
 env:{get:(k)=>({
 'BUSAN_ALLOWED_ORIGINS':'http://localhost:8080',
 'SUPABASE_URL':'https://example.supabase.co',
 'SUPABASE_SECRET_KEYS':'{"default":"sb_secret_mock_key"}',
 'BUSAN_RATE_LIMIT_SALT':'test_mock_only_salt',
 })[k]||null},
 serve(fn){handler=fn}
};
globalThis.fetch=async (url,options={})=>{
  fetchCount++;
  if(String(url).includes('/rest/v1/guest_reviews')){
   assert(String(url).includes('status=eq.approved'));
   return new Response(JSON.stringify([{id:'abc',name:'Guest',country_code:'LK',rating:5,title:'Great',review_text:'Lovely trip',visited_month:'2026-11-01',trip_type:'Friends',photo_paths:[],created_at:'2026-11-19T10:00:00Z'}]),{status:200,headers:{'content-range':'0-0/1','content-type':'application/json'}});
  }
  throw new Error(`Unexpected backend URL: ${url}`);
};
try {
  await import('../supabase/functions/review-feed/index.ts');
  assert.equal(typeof handler,'function');
  const get = await handler(new Request('https://example.supabase.co/functions/v1/review-feed',{method:'GET',headers:{origin}}));
  assert.equal(get.status,200);
  assert.equal(get.headers.get('Access-Control-Allow-Origin'),origin);
  const payload=await get.json();
  assert.equal(payload.total,1);
  assert.equal(payload.reviews[0].name,'Guest');
  assert(fetchCount>0);
  const opt = await handler(new Request('https://example.supabase.co/functions/v1/review-feed',{method:'OPTIONS',headers:{origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey,content-type'}}));
  assert.equal(opt.status,204);
  assert.equal(opt.headers.get('Access-Control-Allow-Origin'),origin);
  assert(opt.headers.get('Access-Control-Allow-Methods').includes('POST'));
  assert(opt.headers.get('Access-Control-Allow-Methods').includes('GET'));
  const legacy = await handler(new Request('https://example.supabase.co/functions/v1/review-feed',{method:'POST',headers:{origin,apikey:'sb_publishable_test','content-type':'application/json'},body:'{}'}));
  assert.equal(legacy.status,200);
  const reject=await handler(new Request('https://example.supabase.co/functions/v1/review-feed',{method:'GET',headers:{origin:'https://untrusted.example'}}));
  assert.equal(reject.status,403);
  const browserClient=read('reviews-service.js');
  assert(browserClient.includes("method:'GET',cache:'no-store'"));
  assert(!browserClient.includes("review-feed`,{method:'POST'"));
  assert(read('supabase/config.toml').includes('[functions.review-feed]'));
  assert(read('supabase/config.toml').includes('[functions.submit-review]'));
  assert(read('index.html').includes('tablet-header-v4-8.css?v=48'));
  assert(read('tools/build-netlify.mjs').includes("'tablet-header-v4-8.css'"));
  assert(existsSync(join(new URL('.',root).pathname,'dist','tablet-header-v4-8.css')));
  console.log('PASS V4.8: public GET (no preflight), legacy POST, OPTIONS CORS, denied origin, function JWT config, Netlify new CSS');
} finally { globalThis.fetch=originalFetch;globalThis.Deno=originalDeno; }
