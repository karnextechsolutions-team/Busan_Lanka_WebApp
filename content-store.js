import { TRANS, DESTINATIONS, PACKAGES, STORIES, ZONES } from './data.js';
import { SUPABASE } from './supabase-config.js';

// The published document is public. Writes and uploads require Supabase Auth + RLS.
const copy = v => JSON.parse(JSON.stringify(v));
const images = {
 'Negombo':['assets/beach-overhead.webp','assets/mirissa.jpg'],
 'Sigiriya':['assets/sigiriya-aerial.webp','assets/sigiriya-heritage.webp','assets/sigiriya.jpg'],
 'Kandy':['assets/kandy-temple.webp','assets/kandy.jpg'],
 'Nuwara Eliya':['assets/hero-hills.jpg','assets/ella.jpg'],
 'Ella':['assets/ella.jpg','assets/hero-hills.jpg'],
 'Galle':['assets/beach-overhead.webp','assets/mirissa.jpg'],
 'Colombo':['assets/beach-overhead.webp','assets/kandy-temple.webp'],
 'Yala region':['assets/elephants-lake.webp','assets/yala.jpg'],
 'Mirissa':['assets/beach-overhead.webp','assets/mirissa.jpg'],
 'Tangalle':['assets/beach-overhead.webp','assets/mirissa.jpg'],
 'Polonnaruwa':['assets/sigiriya-heritage.webp'],
 'Unawatuna':['assets/beach-overhead.webp'],
 'Dambulla':['assets/sigiriya-heritage.webp'],
 'Haputale':['assets/hero-hills.jpg'],
 'Anuradhapura':['assets/sigiriya-heritage.webp']
};
const genericHighlights=(name,detail)=>[
 `Discover ${name} with your local guide`, detail,
 'Enjoy time for photographs and local experiences'
];
const dayDesc=(name,detail)=>`Discover ${name} on this part of your Sri Lankan journey. ${detail}. Your Busan Lanka team can tailor activities, stops and timing to your preferences. This is a sample day description awaiting the client's approved itinerary.`;
const initialPackages=PACKAGES.map(p=>({
 ...copy(p),
 image:p.id==='island-discovery'?'assets/sigiriya-aerial.webp':p.image,
 route:p.route.map(([name,detail],i)=>({
    id:`${p.id}-day-${i+1}`, place:name, title:`Day ${i+1} — ${name}`,
    summary:detail, description:dayDesc(name,detail),
    highlights:genericHighlights(name,detail),
    images:(images[name]||[p.image]).map(src=>({src,alt:`Illustrative view of ${name}`})),
    translations:{}
 })),translations:{}
}));
export const DEFAULT_CONTENT = {
 version:3,
 settings:{facebook:'',instagram:'',youtube:'',tiktok:'',tripadvisor:'',googleReviews:'',brand:'BUSAN LANKA',subbrand:'TRAVEL & TOURS',logo:'assets/logo-mark.jpg',whatsapp:'',enquiryEmail:'',companyInfo:'A locally guided journey through Sri Lanka.',tourWelcomeImage:'assets/sigiriya-aerial.webp',journeyImage:'assets/sigiriya-heritage.webp',siteNotice:'Preview content: replace with verified Busan Lanka itineraries, licensed photos and approved reviews before launch.'},
 slides:[
  {id:'hero-sigiriya',image:'assets/sigiriya-aerial.webp',kicker:'WELCOME TO THE ISLAND OF WONDERS',title:'Discover the <em>wonders</em><br>of Sri Lanka.',lead:'Ancient heritage, wild landscapes and unforgettable journeys, carefully designed for you.',translations:{}},
  {id:'hero-beach',image:'assets/beach-overhead.webp',kicker:'COASTLINES & GOLDEN HORIZONS',title:'Chase the <em>sunshine</em><br>on our shores.',lead:'Discover the beautiful coast, tropical culture and peaceful ocean escapes.',translations:{}},
  {id:'hero-hills',image:'assets/hero-hills.jpg',kicker:'THE HILLS ARE CALLING',title:'Find <em>magic</em><br>in the mountains.',lead:'From tea country to scenic trails, explore Sri Lanka at your own pace.',translations:{}},
  {id:'hero-kandy',image:'assets/kandy-temple.webp',kicker:'CULTURE, STORIES & PEOPLE',title:'Explore our <em>living</em><br>heritage.',lead:'Listen to centuries of stories, meet local people and make unforgettable memories.',translations:{}}
 ],
 destinations:[
  {id:'sigiriya',name:'Sigiriya',tag:'Ancient wonder',image:'assets/sigiriya-aerial.webp',description:'A remarkable rock fortress and historic gardens.',translations:{}},
  {id:'ella',name:'Ella',tag:'Mountain paradise',image:'assets/ella.jpg',description:'Hills, train journeys and lush scenery.',translations:{}},
  {id:'mirissa',name:'Mirissa',tag:'Coastal escape',image:'assets/beach-overhead.webp',description:'Golden beaches and the blue ocean.',translations:{}},
  {id:'kandy',name:'Kandy',tag:'Culture & heritage',image:'assets/kandy-temple.webp',description:'A vibrant cultural city in the hills.',translations:{}},
  {id:'polonnaruwa',name:'Polonnaruwa',tag:'Ancient kingdom',image:'assets/sigiriya-heritage.webp',description:'Explore ancient Sri Lankan architecture.',translations:{}},
  {id:'wildlife',name:'Wildlife',tag:'Nature encounters',image:'assets/elephants-lake.webp',description:'Explore Sri Lanka’s amazing wildlife with licensed guides.',translations:{}}
 ],
 packages:initialPackages,
 galleries:[
   {id:'gallery-01',image:'assets/sigiriya-aerial.webp',title:'Stories of ancient Lanka',description:'Preview image',translations:{}},
   {id:'gallery-02',image:'assets/elephants-lake.webp',title:'Wild island moments',description:'Preview image',translations:{}},
   {id:'gallery-03',image:'assets/beach-overhead.webp',title:'The coastline awaits',description:'Preview image',translations:{}},
   {id:'gallery-04',image:'assets/kandy-temple.webp',title:'Heritage at sunset',description:'Preview image',translations:{}}
 ],
 reviews:[], // Do not fabricate testimonials.
 stories:copy(STORIES), zones:copy(ZONES),
 translations:copy(TRANS)
};
// Additional v2 UI labels, all editable in Admin → Texts & Translations.
const V2_LABELS={
 en:{packageDetailsHeading:'Explore your day-by-day journey',packageDetailsSub:'Select a day to discover the places, highlights and photo gallery.',dayHighlights:'Today’s highlights',galleryHeading:'Places & photo gallery',galleryHint:'Tap a photo for a larger view',previousDay:'Previous day',nextDay:'Next day',customQuote:'Contact us to personalize your journey',realReviews:'What our travelers say',reviewPending:'Approved guest reviews will be published here.'},
 de:{packageDetailsHeading:'Entdecken Sie Ihre Reiseroute Tag für Tag',packageDetailsSub:'Wählen Sie einen Tag für Details, Highlights und Fotos.',dayHighlights:'Höhepunkte des Tages',galleryHeading:'Orte & Fotogalerie',galleryHint:'Für größere Ansicht antippen',previousDay:'Vorheriger Tag',nextDay:'Nächster Tag',customQuote:'Kontaktieren Sie uns für Ihre persönliche Reise',realReviews:'Das sagen unsere Reisenden',reviewPending:'Bestätigte Gästebewertungen erscheinen hier.'},
 fr:{packageDetailsHeading:'Découvrez votre itinéraire jour par jour',packageDetailsSub:'Choisissez un jour pour voir les détails et les photos.',dayHighlights:'Temps forts du jour',galleryHeading:'Lieux et photos',galleryHint:'Touchez pour agrandir',previousDay:'Jour précédent',nextDay:'Jour suivant',customQuote:'Contactez-nous pour personnaliser votre voyage',realReviews:'Avis de nos voyageurs',reviewPending:'Les avis vérifiés seront publiés ici.'},
 ru:{packageDetailsHeading:'Маршрут путешествия по дням',packageDetailsSub:'Выберите день, чтобы увидеть детали и фотографии.',dayHighlights:'Главные впечатления дня',galleryHeading:'Места и фотогалерея',galleryHint:'Нажмите для увеличения',previousDay:'Предыдущий день',nextDay:'Следующий день',customQuote:'Свяжитесь с нами для индивидуального тура',realReviews:'Отзывы путешественников',reviewPending:'Здесь появятся подтвержденные отзывы гостей.'},
 ko:{packageDetailsHeading:'일자별 상세 일정',packageDetailsSub:'일정을 선택해 상세 정보와 사진을 확인하세요.',dayHighlights:'오늘의 하이라이트',galleryHeading:'명소 및 사진',galleryHint:'사진을 눌러 확대하세요',previousDay:'이전 날',nextDay:'다음 날',customQuote:'문의하여 맞춤 여행을 계획해보세요',realReviews:'여행자 후기',reviewPending:'승인된 실제 고객 후기가 게시됩니다.'},
 si:{packageDetailsHeading:'දිනෙන් දින සංචාර විස්තර',packageDetailsSub:'සෑම දිනකම ස්ථාන, විශේෂාංග සහ ඡායාරූප බලන්න.',dayHighlights:'අද දවසේ විශේෂ තැන්',galleryHeading:'ස්ථාන හා ඡායාරූප',galleryHint:'විශාලව බලන්න ඡායාරූපය තෝරන්න',previousDay:'පෙර දිනය',nextDay:'ඊළඟ දිනය',customQuote:'ඔබට ගැළපෙන සංචාරයකට අප අමතන්න',realReviews:'අපගේ සංචාරකයන්ගේ අදහස්',reviewPending:'අනුමත කළ සැබෑ reviews මෙහි පළවේ.'}
};
for(const [lang,labels] of Object.entries(V2_LABELS))Object.assign(DEFAULT_CONTENT.translations[lang],labels);
const V3_LABELS={
 en:{whatsappCta:'Continue in WhatsApp ↗',emailCta:'Prepare email enquiry ↗',copyCta:'Copy enquiry details ↗'},
 de:{whatsappCta:'Weiter zu WhatsApp ↗',emailCta:'E-Mail-Anfrage vorbereiten ↗',copyCta:'Anfrage kopieren ↗'},
 fr:{whatsappCta:'Continuer sur WhatsApp ↗',emailCta:'Préparer un e-mail ↗',copyCta:'Copier la demande ↗'},
 ru:{whatsappCta:'Продолжить в WhatsApp ↗',emailCta:'Подготовить письмо ↗',copyCta:'Скопировать запрос ↗'},
 ko:{whatsappCta:'WhatsApp에서 계속 ↗',emailCta:'이메일 문의 준비 ↗',copyCta:'문의 내용 복사 ↗'},
 si:{whatsappCta:'WhatsApp වෙත යන්න ↗',emailCta:'ඊමේල් විමසීම සකසන්න ↗',copyCta:'විමසීම Copy කරන්න ↗'}
};
for(const [lang,labels] of Object.entries(V3_LABELS))Object.assign(DEFAULT_CONTENT.translations[lang],labels);
DEFAULT_CONTENT.translations.en.toursIntro='Browse suggested journeys and explore the places you could visit. Our team will tailor your itinerary when you contact us.';
export const supabaseEnabled=Boolean(SUPABASE.url&&SUPABASE.anonKey);
const STORE_KEY='busan-lanka-cms-v2-demo'; // Keep key to preserve existing v2 local edits
const normalize = content => {
  if(!content || typeof content!=='object') return copy(DEFAULT_CONTENT);
  const result={...copy(DEFAULT_CONTENT),...content};
  for(const k of ['settings','slides','destinations','packages','galleries','reviews','stories','zones','translations']) if(!result[k]) result[k]=copy(DEFAULT_CONTENT[k]);
  result.settings={...copy(DEFAULT_CONTENT.settings),...result.settings};
  // Package route may be an older pair-array record; migrate safely.
  result.packages=result.packages.map(p=>({...p,route:(p.route||[]).map((day,i)=>Array.isArray(day)?{
   id:`${p.id}-day-${i+1}`,place:day[0],title:`Day ${i+1} — ${day[0]}`,summary:day[1],description:dayDesc(day[0],day[1]),highlights:genericHighlights(day[0],day[1]),images:(images[day[0]]||[p.image]).map(src=>({src,alt:day[0]})),translations:{}
  }:{...day,images:(day.images||[]).map(im=>typeof im==='string'?{src:im,alt:day.place||''}:im),highlights:day.highlights||[],translations:day.translations||{}})}));
  return result;
};
export function demoContent(){try{return normalize(JSON.parse(localStorage.getItem(STORE_KEY)));}catch{return copy(DEFAULT_CONTENT);}}
export function saveDemo(content){localStorage.setItem(STORE_KEY,JSON.stringify(content));}
export function resetDemo(){localStorage.removeItem(STORE_KEY);}
const base=()=>SUPABASE.url.replace(/\/$/,'');
export async function publicContent(){
 if(!supabaseEnabled)return demoContent();
 const res=await fetch(`${base()}/rest/v1/site_content?id=eq.main&select=content`,{headers:{'apikey':SUPABASE.anonKey}});
 if(!res.ok)throw new Error(`Supabase read failed (${res.status})`);
 const rows=await res.json();return normalize(rows[0]?.content);
}
export async function signIn(email,password){
 const res=await fetch(`${base()}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE.anonKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 const data=await res.json();if(!res.ok)throw new Error(data.msg||data.error_description||data.message||'Sign-in failed');
 const session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+((data.expires_in||3600)-60)*1000};
 sessionStorage.setItem('busan-session',JSON.stringify(session));
 const a=await authSession();
 const adminRes=await fetch(`${base()}/rest/v1/cms_admins?user_id=eq.${encodeURIComponent(data.user.id)}&select=user_id`,{headers:{apikey:SUPABASE.anonKey,Authorization:`Bearer ${a.access_token}`}});
 const admins=adminRes.ok?await adminRes.json():[];
 if(!admins.length){signOut();throw new Error('This user has no CMS admin permission. Add the user ID to cms_admins after creating the account.');}
 return a;
}
export function signOut(){sessionStorage.removeItem('busan-session');}
export async function authSession(){
 if(!supabaseEnabled)return null;
 const s=JSON.parse(sessionStorage.getItem('busan-session')||'null');if(!s)return null;
 if(s.expires_at>Date.now()+30000)return s;
 const res=await fetch(`${base()}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE.anonKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
 if(!res.ok){signOut();return null;}
 const data=await res.json();const next={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+((data.expires_in||3600)-60)*1000};sessionStorage.setItem('busan-session',JSON.stringify(next));return next;
}
export async function publishContent(content){
 if(!supabaseEnabled){saveDemo(content);return 'local';}
 const s=await authSession();if(!s)throw new Error('Sign in to publish content to Supabase.');
 const res=await fetch(`${base()}/rest/v1/site_content?id=eq.main`,{method:'PATCH',headers:{apikey:SUPABASE.anonKey,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({content,updated_at:new Date().toISOString()})});
 if(!res.ok)throw new Error(`Publishing failed (${res.status}): ${await res.text()}`);
 return 'cloud';
}
export async function uploadMedia(file){
 if(!file?.type?.startsWith('image/'))throw new Error('Please choose an image.');
 if(file.size>9*1024*1024)throw new Error('Image must be smaller than 9 MB.');
 const img=await createImageBitmap(file);
 const scale=Math.min(1,1600/img.width,1600/img.height);
 const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
 canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);img.close();
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob)throw new Error('Cannot convert image');
 if(!supabaseEnabled){
  const dataUrl=canvas.toDataURL('image/webp',.65);
  if(dataUrl.length>1_250_000)throw new Error('Local demo image too large. Use a smaller image or connect Supabase Storage.');
  return dataUrl;
 }
 const s=await authSession();if(!s)throw new Error('Sign in before uploading files.');
 const filename=`${crypto.randomUUID()}.webp`;
 const res=await fetch(`${base()}/storage/v1/object/site-media/${filename}`,{method:'POST',headers:{apikey:SUPABASE.anonKey,Authorization:`Bearer ${s.access_token}`,'Content-Type':'image/webp','x-upsert':'false'},body:blob});
 if(!res.ok)throw new Error(`Upload failed: ${await res.text()}`);
 return `${base()}/storage/v1/object/public/site-media/${filename}`;
}

// These requests use the signed-in CMS session. Database RLS authorizes only cms_admins.
export async function listEnquiries(){
 if(!supabaseEnabled) return [];
 const s=await authSession();if(!s)throw new Error('Please sign in again.');
 const res=await fetch(`${base()}/rest/v1/tour_enquiries?select=id,name,email,phone,travel_days,travel_month,tour_id,message,locale,status,created_at&order=created_at.desc&limit=100`,{headers:{apikey:SUPABASE.anonKey,Authorization:`Bearer ${s.access_token}`}});
 if(!res.ok)throw new Error(`Cannot read enquiries (${res.status}): ${await res.text()}`);
 return res.json();
}
export async function updateEnquiryStatus(id,status){
 if(!supabaseEnabled)throw new Error('Connect Supabase first.');
 if(!['new','contacted','closed'].includes(status))throw new Error('Invalid status');
 const s=await authSession();if(!s)throw new Error('Please sign in again.');
 const res=await fetch(`${base()}/rest/v1/tour_enquiries?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{apikey:SUPABASE.anonKey,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({status})});
 if(!res.ok)throw new Error(`Cannot update enquiry (${res.status}): ${await res.text()}`);
 const rows=await res.json();if(!rows.length)throw new Error('Enquiry not found or access denied');
 return rows[0];
}
