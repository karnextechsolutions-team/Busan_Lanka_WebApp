/* Dedicated reviews backend. Admin JWT is sessionStorage only; no privileged key in the browser. */
import {SUPABASE} from './supabase-config.js';
import {authSession} from './content-store.js';
import {COUNTRIES,flagFor,countryLabel} from './country-data.js';
export {COUNTRIES,flagFor,countryLabel};
const CLOUD=Boolean(SUPABASE.url&&SUPABASE.anonKey);
const STORAGE_KEY='busan-v44-guest-reviews-local';
const base=()=>SUPABASE.url.replace(/\/$/,'');
const allLocal=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return []}};
const localSave=rows=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(rows))}catch{throw new Error('Local storage is full. Try smaller images or enable Supabase.')}};
const parse=async(r,description)=>{let j={};try{j=await r.json()}catch{}if(!r.ok)throw new Error(j.error||j.message||`${description} failed (${r.status})`);return j};
const credentials=async()=>{const s=await authSession();if(!s)throw Error('Please sign in to the Supabase admin panel again.');return {apikey:SUPABASE.anonKey,Authorization:`Bearer ${s.access_token}`};};
const bucket='guest-review-photos';
const photoUrl=(path)=>`/storage/v1/object/sign/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`;
async function adminSign(path){
 if(!path)return '';
 if(path.startsWith('data:image/'))return path;
 if(/^https:\/\//.test(path))return path;
 const res=await fetch(`${base()}${photoUrl(path)}`,{method:'POST',headers:{...await credentials(),'Content-Type':'application/json'},body:JSON.stringify({expiresIn:3600})});
 const payload=await parse(res,'Photo preview');
 const url=payload.signedURL||payload.signedUrl||'';
 if(!url)return '';
 if(url.startsWith('http'))return url;
 if(url.startsWith('/storage/v1/'))return `${base()}${url}`;
 if(url.startsWith('/object/'))return `${base()}/storage/v1${url}`;
 return `${base()}/storage/v1/${url.replace(/^\//,'')}`;
}
export async function loadApprovedReviews(){
 if(!CLOUD)return allLocal().filter(r=>r.status==='approved').sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||''));
 const res=await fetch(`${base()}/functions/v1/review-feed`,{method:'POST',headers:{apikey:SUPABASE.anonKey,'Content-Type':'application/json'},body:'{}'});
 const data=await parse(res,'Review feed');const reviews=data.reviews||[];reviews.totalCount=Number.isFinite(Number(data.total))?Number(data.total):reviews.length;return reviews;
}
export async function listModerationReviews(){
 if(!CLOUD)return allLocal().sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||''));
 const res=await fetch(`${base()}/rest/v1/guest_reviews?select=*&order=created_at.desc&limit=150`,{headers:await credentials()});
 const arr=await parse(res,'Review list');
 return Promise.all(arr.map(async row=>({...row,photo_urls:await Promise.all((row.photo_paths||[]).map(p=>adminSign(p).catch(()=>'')))})));
}
export async function photoToWebp(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Only JPEG, PNG or WebP photos are accepted.');
 if(file.size>6*1024*1024)throw Error('Each photo must be 6 MB or smaller.');
 const bitmap=await createImageBitmap(file);const scale=Math.min(1,1500/bitmap.width,1500/bitmap.height);const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.78));if(!blob||blob.size>2*1024*1024)throw Error('Photo compression failed. Please choose a smaller image.');
 return new File([blob],`review-${crypto.randomUUID()}.webp`,{type:'image/webp'}); // Strips original photo metadata.
}
export async function submitGuestReview({name,country_code,rating,title,review_text,visited_month,trip_type,photos,website,consent}){
 if(photos.length>2)throw Error('Up to two photos are allowed.');
 if(!consent)throw Error('Please confirm that you agree to publish your review if approved.');
 const body={name,country_code,rating,title,review_text,visited_month,trip_type};
 if(!CLOUD){const urls=[];for(const photo of photos){const url=await new Promise((resolve,reject)=>{const rd=new FileReader();rd.onload=()=>resolve(rd.result);rd.onerror=reject;rd.readAsDataURL(photo)});urls.push(url)}
 const row={...body,id:crypto.randomUUID(),photo_paths:urls,photo_urls:urls,status:'pending',created_at:new Date().toISOString()};localSave([row,...allLocal()]);return {saved:true,mode:'local'};}
 const form=new FormData();for(const [key,value] of Object.entries(body))form.append(key,String(value||''));form.append('website',website||'');form.append('consent',consent?'yes':'no');for(const photo of photos)form.append('photos',photo,photo.name);
 const res=await fetch(`${base()}/functions/v1/submit-review`,{method:'POST',headers:{apikey:SUPABASE.anonKey},body:form});
 return {...await parse(res,'Review submission'),mode:'cloud'};
}
export async function uploadAdminReviewPhoto(file){
 const prepared=await photoToWebp(file);
 if(!CLOUD)return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(prepared)});
 const path=`admin/${crypto.randomUUID()}.webp`;
 const r=await fetch(`${base()}/storage/v1/object/${bucket}/${path}`,{method:'POST',headers:{...await credentials(),'Content-Type':'image/webp','x-upsert':'false'},body:prepared});
 if(!r.ok)throw Error(`Photo upload failed (${r.status}). Ensure the private bucket exists and SQL policies were applied.`);
 return path;
}
export async function saveAdminReview(row){
 const safe={name:row.name.trim(),country_code:row.country_code,rating:Number(row.rating),title:row.title.trim(),review_text:row.review_text.trim(),visited_month:row.visited_month,trip_type:row.trip_type,status:row.status,photo_paths:row.photo_paths||[]};
 if(!CLOUD){const data=allLocal();const found=data.findIndex(r=>r.id===row.id);const newRow={...safe,id:row.id||crypto.randomUUID(),created_at:row.created_at||new Date().toISOString(),photo_urls:safe.photo_paths};if(found>=0)data[found]=newRow;else data.unshift(newRow);localSave(data);return newRow;}
 const head={...await credentials(),'Content-Type':'application/json',Prefer:'return=representation'};
 const method=row.id?'PATCH':'POST';const endpoint=row.id?`${base()}/rest/v1/guest_reviews?id=eq.${encodeURIComponent(row.id)}`:`${base()}/rest/v1/guest_reviews`;
 const res=await fetch(endpoint,{method,headers:head,body:JSON.stringify(safe)});
 const data=await parse(res,'Saving review');if(!Array.isArray(data)||data.length!==1)throw Error('Review was not saved; check admin permissions.');return data[0];
}
export async function changeReviewStatus(id,status){
 if(!['approved','rejected','pending'].includes(status))throw Error('Invalid moderation action.');
 if(!CLOUD){const rows=allLocal();const r=rows.find(x=>x.id===id);if(!r)throw Error('Review not found.');r.status=status;localSave(rows);return;}
 const res=await fetch(`${base()}/rest/v1/guest_reviews?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{...await credentials(),'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({status})});
 const data=await parse(res,'Moderation');if(data.length!==1)throw Error('Moderation failed: admin permission denied.');
}
export async function deleteAdminReview(id){
 if(!CLOUD){localSave(allLocal().filter(r=>r.id!==id));return;}
 const res=await fetch(`${base()}/rest/v1/guest_reviews?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:await credentials()});if(!res.ok)throw Error('Could not delete review.');
}
export const isReviewsCloud=()=>CLOUD;
