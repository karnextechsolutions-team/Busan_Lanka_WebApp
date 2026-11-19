import {checkOrigin,preflight,response,serviceCredentials,serviceHeaders} from '../_shared/common.ts';
const bucket='guest-review-photos';
const encodePath=(path:string)=>path.split('/').map(encodeURIComponent).join('/');
Deno.serve(async request=>{
 // GET is the preferred path for public, approved-only reviews: no custom
 // browser headers -> no OPTIONS preflight. POST stays for older V4.7 clients.
 const origin=checkOrigin(request);
 if (!origin) return new Response(JSON.stringify({error:'Origin not allowed. Add the site URL to BUSAN_ALLOWED_ORIGINS.'}),{status:403,headers:{'Content-Type':'application/json'}});
 if(request.method!=='GET'){
  const early=preflight(request);if(early)return early;
 }
 const cred=serviceCredentials();if(!cred)return response(origin,503,{error:'Review feed not configured'});
 const res=await fetch(`${cred.url}/rest/v1/guest_reviews?status=eq.approved&select=id,name,country_code,rating,title,review_text,visited_month,trip_type,photo_paths,created_at&order=created_at.desc&limit=24`,{headers:{...serviceHeaders(cred),Prefer:'count=exact'}});
 if(!res.ok)return response(origin,502,{error:'Reviews temporarily unavailable'});
 const rows=await res.json();
 const countHeader=res.headers.get('content-range')||'';
 const reportedTotal=Number(countHeader.split('/')[1]);
 const total=Number.isFinite(reportedTotal)&&countHeader.includes('/')?reportedTotal:rows.length;
 const out=await Promise.all(rows.map(async (r:Record<string,unknown>)=>{
  const photo_urls:string[]=[];
  for(const p of (Array.isArray(r.photo_paths)?r.photo_paths:[]).slice(0,2)){
   const signed=await fetch(`${cred.url}/storage/v1/object/sign/${bucket}/${encodePath(String(p))}`,{method:'POST',headers:serviceHeaders(cred),body:JSON.stringify({expiresIn:3600})});
   if(signed.ok){const data=await signed.json();const u=String(data.signedURL||data.signedUrl||'');if(u)photo_urls.push(u.startsWith('http')?u:u.startsWith('/storage/v1/')?`${cred.url}${u}`:u.startsWith('/object/')?`${cred.url}/storage/v1${u}`:`${cred.url}/storage/v1/${u.replace(/^\//,'')}`)}
  }
  return {id:r.id,name:r.name,country_code:r.country_code,rating:r.rating,title:r.title,review_text:r.review_text,visited_month:r.visited_month,trip_type:r.trip_type,photo_urls,created_at:r.created_at};
 }));
 return response(origin,200,{reviews:out,total});
});
