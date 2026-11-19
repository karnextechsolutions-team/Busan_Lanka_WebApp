import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
for(const id of ['whatsapp','telegram','instagram','messenger']){
 const path=`assets/social-${id}.svg`;
 assert(existsSync(new URL(path,root)));
 const svg=read(path);
 assert(svg.startsWith('<svg') && svg.includes('viewBox="0 0 16 16"') && svg.includes('<path d="') && !svg.includes('<script'));
 assert(read('app.js').includes(`./assets/social-${'${c.id}'}.svg`));
}
assert(read('assets/SOCIAL_ICONS_LICENSE.txt').includes('The MIT License')===false || read('assets/SOCIAL_ICONS_LICENSE.txt').includes('Permission is hereby granted'));
assert(read('index.html').includes('engagement-v4-7.css?v=410'));
assert(read('sw.js').includes('busan-lanka-v4-10-'));
assert(read('app.js').includes('Your enquiry has NOT been saved or sent'));
assert(read('dist/assets/social-whatsapp.svg').startsWith('<svg'));
const originalDeno=globalThis.Deno, originalFetch=globalThis.fetch;
let handler,storedRows=[];
globalThis.Deno={env:{get:key=>({
 BUSAN_RATE_LIMIT_SALT:'test-salt-only',SUPABASE_URL:'https://example.supabase.co',
 SUPABASE_SECRET_KEYS:'{"default":"sb_secret_test_not_real"}'
})[key]||null},serve(f){handler=f}};
globalThis.fetch=async(url,options={})=>{
 if(String(url).includes('/rpc/consume_api_quota'))return new Response('true',{status:200});
 if(String(url).includes('/rest/v1/tour_enquiries')){
  storedRows.push(JSON.parse(options.body));return new Response(null,{status:201});
 }
 throw Error('Unexpected backend fetch '+url);
};
try{
 await import('../supabase/functions/submit-enquiry/index.ts');
 const origin='https://tranquil-marshmallow-7cd3a4.netlify.app';
 const endpoint='https://example.supabase.co/functions/v1/submit-enquiry';
 const opts=await handler(new Request(endpoint,{method:'OPTIONS',headers:{origin,'Access-Control-Request-Headers':'apikey,content-type','Access-Control-Request-Method':'POST'}}));
 assert.equal(opts.status,204);
 assert.equal(opts.headers.get('Access-Control-Allow-Origin'),origin);
 const requestBody={name:'Test Guest',email:'guest@example.org',phone:'+94771234567',days:7,month:'2026-12',message:'We would love a tour.',language:'en',channel:'whatsapp',website:''};
 const saved=await handler(new Request(endpoint,{method:'POST',headers:{origin,apikey:'sb_publishable_mock','Content-Type':'application/json'},body:JSON.stringify(requestBody)}));
 assert.equal(saved.status,201);
 assert.deepEqual(await saved.json(),{saved:true});
 assert.equal(storedRows.length,1);
 assert.equal(storedRows[0].preferred_channel,'whatsapp');
 const denied=await handler(new Request(endpoint,{method:'OPTIONS',headers:{origin:'https://evil.example'}}));
 assert.equal(denied.status,403);
 const invalid=await handler(new Request(endpoint,{method:'POST',headers:{origin,apikey:'sb_publishable_mock','Content-Type':'application/json'},body:JSON.stringify({...requestBody,channel:'unknown'})}));
 assert.equal(invalid.status,400);
 assert.equal(storedRows.length,1);
 console.log('PASS V4.10: bundled four SVG brand icons, versioning, OPTIONS 204, POST saves channel, bad origin and bad channel rejected');
}finally{globalThis.Deno=originalDeno;globalThis.fetch=originalFetch}
