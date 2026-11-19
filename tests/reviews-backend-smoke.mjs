import assert from 'node:assert/strict';
let handler;
const fake={
 BUSAN_RATE_LIMIT_SALT:'mock-only-salt',BUSAN_ALLOWED_ORIGINS:'http://localhost:8080',
 SUPABASE_URL:'https://busan-test.supabase.co',SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_mock_key'}),
};
globalThis.Deno={env:{get:k=>fake[k]},serve(fn){handler=fn}};
const rows=[];const stored=[];
globalThis.fetch=async(url,opts={})=>{
 url=String(url);
 if(url.includes('/rpc/consume_api_quota'))return Response.json(true);
 if(url.includes('/storage/v1/object/sign/'))return Response.json({signedURL:'/object/sign/guest-review-photos/guest/img.webp?token=fake'});
 if(url.includes('/storage/v1/object/guest-review-photos/')){stored.push({url,method:opts.method});return Response.json({Key:'guest-review-photos/guest/img.webp'})}
 if(url.includes('/rest/v1/guest_reviews')){
  if(opts.method==='POST') {rows.push(JSON.parse(opts.body));return new Response(null,{status:201});}
  return Response.json(rows.filter(r=>r.status==='approved').map(r=>({id:r.id,name:r.name,country_code:r.country_code,rating:r.rating,title:r.title,review_text:r.review_text,visited_month:r.visited_month,trip_type:r.trip_type,photo_paths:r.photo_paths,created_at:'2026-11-19T00:00:00Z'})));
 }
 throw Error('Unexpected mock request: '+url);
};
await import('../supabase/functions/submit-review/index.ts');
const submit=handler;
const f=new FormData();
for(const [key,v] of Object.entries({name:'Test Guest',country_code:'GB',rating:'5',title:'Wonderful Sri Lanka',review_text:'Great travel experience with wonderful local guides in Sri Lanka.',visited_month:'2026-10',trip_type:'Friends',consent:'yes'}))f.append(key,v);
// Minimal WebP RIFF magic (test only), >100 bytes.
const bytes=new Uint8Array(128);bytes.set(new TextEncoder().encode('RIFF'),0);bytes.set(new TextEncoder().encode('WEBP'),8);
f.append('photos',new File([bytes],'a.webp',{type:'image/webp'}));
const req=()=>new Request('https://busan-test.supabase.co/functions/v1/submit-review',{method:'POST',headers:{origin:'http://localhost:8080',apikey:'sb_publishable_mock_key'},body:f});
const result=await submit(req());
assert.equal(result.status,201,await result.text());
assert.equal(rows.length,1);assert.equal(rows[0].status,'pending');assert.equal(rows[0].photo_paths.length,1);
assert.equal(stored.length,1);
const rejectOrigin=await submit(new Request('https://busan-test.supabase.co/functions/v1/submit-review',{method:'POST',headers:{origin:'https://spam.example',apikey:'mock'},body:f}));
assert.equal(rejectOrigin.status,403);
await import('../supabase/functions/review-feed/index.ts');
const feed=handler;
const feedReq=()=>new Request('https://busan-test.supabase.co/functions/v1/review-feed',{method:'POST',headers:{origin:'http://localhost:8080',apikey:'sb_publishable_mock_key'},body:'{}'});
let out=await feed(feedReq());assert.equal(out.status,200);assert.equal((await out.json()).reviews.length,0,'Pending review leaked into public feed');
rows[0].status='approved';out=await feed(feedReq());
const approved=(await out.json()).reviews;
assert.equal(approved.length,1);assert.equal(approved[0].photo_urls.length,1);assert(approved[0].photo_urls[0].includes('/storage/v1/object/sign/'));
console.log('PASS guest submit -> pending in private storage -> admin approval -> signed approved-only public feed; forbidden origins rejected');
