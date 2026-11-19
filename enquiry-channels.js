/** Busan Lanka V4.7 — contact-channel configuration and local demo enquiry ledger.
 * External chat links initiate a hand-off; they do NOT prove message delivery.
 */
export const CHANNEL_INFO = [
 {id:'whatsapp',name:'WhatsApp',icon:'◉',setting:'whatsapp',enabled:'contactWhatsappEnabled'},
 {id:'telegram',name:'Telegram',icon:'➤',setting:'telegram',enabled:'contactTelegramEnabled'},
 {id:'instagram',name:'Instagram',icon:'◎',setting:'instagram',enabled:'contactInstagramEnabled'},
 {id:'messenger',name:'Messenger',icon:'◌',setting:'messenger',enabled:'contactMessengerEnabled'},
];
export const CHANNEL_NAMES=Object.fromEntries(CHANNEL_INFO.map(c=>[c.id,c.name]));
const LOCAL_KEY='busan-v47-enquiry-local-demo';
const clean=s=>String(s||'').trim();
const handle=s=>clean(s).replace(/^@/,'');
export function targetFor(channel,settings={}){
 const raw=clean(settings[channel]||settings[channel==='messenger'?'facebook':'']||'');
 if(!raw)return '';
 if(channel==='whatsapp'){
  const digits=raw.replace(/\D/g,'');return digits.length>=9&&digits.length<=15?`https://wa.me/${digits}`:'';
 }
 if(channel==='telegram'){
  const user=raw.includes('t.me/')?raw.split(/t\.me\//)[1]?.split(/[?#/]/)[0]:handle(raw);
  return /^[a-zA-Z0-9_]{5,32}$/.test(user||'')?`https://t.me/${user}`:'';
 }
 if(channel==='instagram'){
  const user=raw.includes('instagram.com/')?raw.split('instagram.com/')[1]?.split(/[?#/]/)[0]:raw.includes('ig.me/m/')?raw.split('ig.me/m/')[1]?.split(/[?#/]/)[0]:handle(raw);
  return /^[\w.]{1,30}$/.test(user||'')?`https://ig.me/m/${user}`:'';
 }
 if(channel==='messenger'){
  const user=raw.includes('m.me/')?raw.split('m.me/')[1]?.split(/[?#/]/)[0]:raw.includes('facebook.com/')?raw.split('facebook.com/')[1]?.split(/[?#/]/)[0]:handle(raw);
  return /^[A-Za-z0-9._-]{3,80}$/.test(user||'')?`https://m.me/${user}`:'';
 }
 return '';
}
export function enabledChannels(settings={}){
 return CHANNEL_INFO.filter(c=>settings[c.enabled]!==false && Boolean(targetFor(c.id,settings)) && (settings[c.enabled]===true || c.id==='whatsapp'));
}
export function contactUrl(channel,settings,message){
 const target=targetFor(channel,settings);if(!target)return '';
 return channel==='whatsapp'?`${target}?text=${encodeURIComponent(message)}`:target;
}
export function localEnquiries(){try{const r=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');return Array.isArray(r)?r:[]}catch{return []}}
export function saveLocalEnquiry(form){const row={id:crypto.randomUUID(),name:form.name,email:form.email,phone:form.phone,travel_days:form.days||null,travel_month:form.month?form.month+'-01':null,tour_id:form.tour||null,message:form.message,locale:form.language,preferred_channel:form.channel,status:'new',source:'local-demo',created_at:new Date().toISOString()};try{localStorage.setItem(LOCAL_KEY,JSON.stringify([row,...localEnquiries()].slice(0,150)))}catch{throw new Error('Browser storage is full. Please free space or connect Supabase.')}return {saved:true,mode:'local',id:row.id}}
export function updateLocalEnquiry(id,status){const rows=localEnquiries(),row=rows.find(r=>r.id===id);if(!row)throw Error('Enquiry not found');row.status=status;localStorage.setItem(LOCAL_KEY,JSON.stringify(rows));return row}
