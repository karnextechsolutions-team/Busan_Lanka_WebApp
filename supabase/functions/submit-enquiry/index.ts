import {checkOrigin, parseBody, preflight, quota, response, serviceCredentials, serviceHeaders} from '../_shared/common.ts';
const clean=(value:unknown,max:number)=>String(value||'').trim().slice(0,max);
Deno.serve(async(request:Request)=>{
 const early=preflight(request);if(early)return early;
 const origin=checkOrigin(request)!;
 const payload=await parseBody(request);if(!payload)return response(origin,400,{error:'Invalid request body'});
 // Honeypot field: legitimate browsers always leave this blank.
 if(clean(payload.website,100))return response(origin,200,{saved:true});
 const name=clean(payload.name,100),email=clean(payload.email,180),phone=clean(payload.phone,30),message=clean(payload.message,3000);
 const days=payload.days==null||String(payload.days).trim()===''?0:Number(payload.days);const tourId=clean(payload.tour,100),locale=clean(payload.language,8);
 const channel=clean(payload.channel,20).toLowerCase();
 if(!['whatsapp','telegram','instagram','messenger','copy'].includes(channel))return response(origin,400,{error:'Choose a supported contact method.'});
 const month=clean(payload.month,7);const travelMonth=/^\d{4}-(0[1-9]|1[0-2])$/.test(month)?`${month}-01`:null;
 if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||Number.isNaN(days)||days<0||days>60)return response(origin,400,{error:'Please enter a valid name and email; days must be 1 to 60 or omitted.'});
 const cred=serviceCredentials();if(!cred||!Deno.env.get('BUSAN_RATE_LIMIT_SALT'))return response(origin,503,{error:'Enquiry storage is not configured.'});
 if(!await quota(request,'enquiry-hour',5,3600)||!await quota(request,'enquiry-global-day',500,86400))return response(origin,429,{error:'Too many enquiries. Please try again later.'});
 const row={name,email,phone:phone||null,travel_days:days||null,travel_month:travelMonth,tour_id:tourId||null,message:message||null,locale:locale||'en',preferred_channel:channel,status:'new',source:'webapp'};
 const res=await fetch(`${cred.url}/rest/v1/tour_enquiries`,{method:'POST',headers:{...serviceHeaders(cred),Prefer:'return=minimal'},body:JSON.stringify(row)});
 if(!res.ok){console.error('Could not save enquiry',res.status);return response(origin,502,{error:'Enquiry not saved; please use WhatsApp or email.'});}
 return response(origin,201,{saved:true});
});
