import {checkOrigin,preflight,quota,response,serviceCredentials,serviceHeaders} from '../_shared/common.ts';
const clean=(raw:FormDataEntryValue|null,max:number)=>String(raw||'').trim().slice(0,max);
const bucket='guest-review-photos';
const encodePath=(path:string)=>path.split('/').map(encodeURIComponent).join('/');
const validImage=async(file:File):Promise<boolean>=>{
 if(file.type!=='image/webp'||file.size<100||file.size>2097152)return false;
 const h=new Uint8Array(await file.slice(0,12).arrayBuffer());return String.fromCharCode(...h.slice(0,4))==='RIFF'&&String.fromCharCode(...h.slice(8,12))==='WEBP';
};
Deno.serve(async request=>{
 const early=preflight(request);if(early)return early;
 const origin=checkOrigin(request)!;
 if(Number(request.headers.get('content-length')||0)>5_000_000)return response(origin,413,{error:'Total upload is too large (max 4 MB of photos).'});
 let form:FormData;
 try{form=await request.formData()}catch{return response(origin,400,{error:'Invalid review submission.'})}
 if(clean(form.get('website'),100))return response(origin,201,{saved:true}); // spam honeypot
 const name=clean(form.get('name'),91),country_code=clean(form.get('country_code'),2).toUpperCase(),rating=Number(clean(form.get('rating'),2)),title=clean(form.get('title'),121),review_text=clean(form.get('review_text'),2501),visited_month=clean(form.get('visited_month'),7),trip_type=clean(form.get('trip_type'),20),consent=clean(form.get('consent'),8);
 const images=form.getAll('photos').filter((p):p is File=>p instanceof File && p.size>0);
 const monthPattern=/^\d{4}-(0[1-9]|1[0-2])$/;
 const currentMonth=new Date().toISOString().slice(0,7);
 if(name.length<2||name.length>90||!/^[A-Z]{2}$/.test(country_code)||!Number.isInteger(rating)||rating<1||rating>5||title.length<2||title.length>120||review_text.length<15||review_text.length>2500||!monthPattern.test(visited_month)||visited_month>currentMonth||!['Couples','Family','Friends','Solo','Business','Other'].includes(trip_type)||consent!=='yes'||images.length>2)
  return response(origin,400,{error:'Please complete your genuine review, visited month, country, stars and publication consent.'});
 if(!(await Promise.all(images.map(validImage))).every(Boolean))return response(origin,400,{error:'Photos must be WebP images, each up to 2 MB.'});
 const cred=serviceCredentials();if(!cred||!Deno.env.get('BUSAN_RATE_LIMIT_SALT'))return response(origin,503,{error:'Review service is not configured.'});
 if(!await quota(request,'review-ip-day',3,86400)||!await quota(request,'review-global-day',200,86400))return response(origin,429,{error:'Review submission limit reached. Try again later.'});
 const id=crypto.randomUUID();const paths:string[]=[];
 const cleanup=async()=>{await Promise.all(paths.map(path=>fetch(`${cred.url}/storage/v1/object/${bucket}/${encodePath(path)}`,{method:'DELETE',headers:serviceHeaders(cred)}).catch(()=>null)))};
 try{
  for(let i=0;i<images.length;i++){
   const path=`guest/${id}/${i+1}.webp`;
   const up=await fetch(`${cred.url}/storage/v1/object/${bucket}/${encodePath(path)}`,{method:'POST',headers:{...serviceHeaders(cred),'Content-Type':'image/webp','x-upsert':'false'},body:await images[i].arrayBuffer()});
   if(!up.ok){await cleanup();return response(origin,502,{error:'Photo upload failed. Please retry.'})}
   paths.push(path);
  }
  const body={id,name,country_code,rating,title,review_text,visited_month:`${visited_month}-01`,trip_type,photo_paths:paths,status:'pending'};
  const saved=await fetch(`${cred.url}/rest/v1/guest_reviews`,{method:'POST',headers:{...serviceHeaders(cred),Prefer:'return=minimal'},body:JSON.stringify(body)});
  if(!saved.ok){await cleanup();console.error('Guest review DB insert failed',saved.status);return response(origin,502,{error:'Review could not be saved.'})}
  return response(origin,201,{saved:true,status:'pending'});
 }catch(err){console.error('Submit review failed',err);await cleanup();return response(origin,502,{error:'Review submission temporarily unavailable.'})}
});
