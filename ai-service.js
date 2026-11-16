import {SUPABASE} from './supabase-config.js';
const configured=()=>Boolean(SUPABASE.url&&SUPABASE.anonKey);
const base=()=>SUPABASE.url.replace(/\/$/,'');
async function invoke(name,body,{timeout=22000,keepalive=false}={}){
 if(!configured())throw new Error('Supabase is not configured. Add URL and publishable key in supabase-config.js.');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
 try{
  const res=await fetch(`${base()}/functions/v1/${name}`,{method:'POST',headers:{apikey:SUPABASE.anonKey,'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal,keepalive});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||`${name} unavailable (${res.status})`);
  return data;
 }catch(err){if(err?.name==='AbortError')throw new Error('Request timed out. Please try again.');throw err;}finally{clearTimeout(timer);}
}
export async function askLiveGuide(message,language,history=[]){
 const data=await invoke('travel-ai',{message,language,history:history.slice(-8)},{timeout:32000});
 if(!data.answer)throw new Error('AI returned no answer.');
 return String(data.answer);
}
export function storeTourEnquiry(fields){return invoke('submit-enquiry',fields,{timeout:12000,keepalive:true});}
