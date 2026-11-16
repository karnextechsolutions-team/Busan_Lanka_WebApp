import {CONFIG,LANGS,TRANS,ZONES,STORIES,KNOWLEDGE} from './data.js';
import {DEFAULT_CONTENT,publicContent,supabaseEnabled} from './content-store.js';
import {askLiveGuide,storeTourEnquiry} from './ai-service.js';


const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content=structuredClone(DEFAULT_CONTENT);
let currentSlide=0,slideTimer=null,selectedPackage=null,selectedDay=0;
const picture=src=>!src?'':/^(https?:|data:image\/)/i.test(src)?src:'./'+String(src).replace(/^\.\/?/,'');
const loc=(obj,key)=>obj?.translations?.[state.lang]?.[key]||obj?.[key]||'';
const safeRich=s=>esc(s).replaceAll('&lt;em&gt;','<em>').replaceAll('&lt;/em&gt;','</em>').replace(/&lt;br\s*\/?&gt;/gi,'<br>');
const state={lang:'en',filter:'all',tourStep:'welcome',watchId:null,locationGranted:false,notificationsGranted:false,sound:false,active:false,seen:new Set(),coords:null,story:null,chat:[],voice:null,toastTimer:null};
const t=(key)=>content.translations?.[state.lang]?.[key]||content.translations?.en?.[key]||TRANS[state.lang]?.[key]||TRANS.en[key]||key;
const langVoice=()=>LANGS[state.lang]?.voice||'en-GB';
const msg=(s)=>{const toast=$('#toast');toast.textContent=s;toast.classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>toast.classList.remove('show'),3500);};

function detectLang(){
 const fromUrl=new URL(location.href).searchParams.get('lang');
 const preferred=fromUrl||localStorage.getItem('busanLang')||navigator.languages?.find(l=>LANGS[l.split('-')[0]])||navigator.language||'en';
 const code=preferred.split('-')[0].toLowerCase();return LANGS[code]?code:'en';
}
function setLanguage(code){
 if(!LANGS[code])return;
 state.lang=code;localStorage.setItem('busanLang',code);document.documentElement.lang=code;
 $('#langSelect').value=code;
 $$('[data-i18n]').forEach(el=>{let key=el.dataset.i18n;el.textContent=t(key);});
 $$('[data-i18n-html]').forEach(el=>{el.innerHTML=safeRich(t(el.dataset.i18nHtml));});
 renderDestinations();renderFilters();renderTours();renderStories();renderHero();renderGuideQuick();updateEnquiryButton();
 if(!$('#tourOverlay').hidden){stopSpeech();renderTourStage();}
}
function renderDestinations(){
 $('#destinationGrid').innerHTML=content.destinations.map(d=>`<a class="destination-card" href="#tours" aria-label="${esc(loc(d,'name'))}"><img src="${esc(picture(d.image))}" alt="${esc(loc(d,'name'))} landscape" loading="lazy"/><div class="destination-content"><small>↗ ${esc(loc(d,'tag'))}</small><h3>${esc(loc(d,'name'))}</h3></div></a>`).join('');
}
function renderSocialLinks(){
 const target=$('#footerSocialLinks');if(!target)return;
 const links=[['facebook','Facebook','f'],['instagram','Instagram','◎'],['youtube','YouTube','▶'],['tiktok','TikTok','♪'],['tripadvisor','Tripadvisor','★'],['googleReviews','Google Reviews','★']];
 const urls=links.map(([key,name,icon])=>{const raw=String(content.settings?.[key]||'').trim();if(!raw)return '';
 try{const u=new URL(raw);if(u.protocol!=='https:')return '';return `<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}">${esc(icon)} ${esc(name)}</a>`;}catch{return '';}}).filter(Boolean);
 const digits=String(content.settings?.whatsapp||'').replace(/\D/g,'');
 if(digits.length>=9&&digits.length<=15)urls.unshift(`<a href="https://wa.me/${digits}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">☎ WhatsApp</a>`);
 target.innerHTML=urls.join('');target.hidden=!urls.length;
}
function renderStories(){
 renderSocialLinks();
 const gallery=$('#galleryGrid');if(gallery){gallery.innerHTML=(content.galleries||[]).map(g=>`<button type="button" class="gallery-item" data-photo="${esc(g.image)}" data-alt="${esc(loc(g,'title'))}"><img loading="lazy" src="${esc(picture(g.image))}" alt="${esc(loc(g,'title'))}"/><span>${esc(loc(g,'title'))}</span></button>`).join('');}
 const review=$('#reviewsGrid');if(review){
  const approved=(content.reviews||[]).filter(r=>r.approved);
  review.innerHTML=approved.length?approved.map(r=>`<article class="review-tile">${r.rating?`<span class="review-stars">${'★'.repeat(Math.max(1,Math.min(5,Number(r.rating))))}</span>`:''}<p>“${esc(loc(r,'quote'))}”</p><strong>${esc(r.name)}</strong><small>${esc(r.country||'')}</small></article>`).join(''):`<div class="review-empty">${esc(t('reviewPending'))}</div>`;
 }
 const logo=$$('.brand>img');logo.forEach(el=>el.src=picture(content.settings.logo));
 $$('.brand-type b').forEach(el=>el.textContent=content.settings.brand);
 $$('.brand-type small').forEach(el=>el.textContent=content.settings.subbrand);
 document.documentElement.style.setProperty('--welcome-bg',`url(${JSON.stringify(picture(content.settings.tourWelcomeImage))})`);
 document.documentElement.style.setProperty('--journey-bg',`url(${JSON.stringify(picture(content.settings.journeyImage))})`);
}
function renderHero(){
 const slides=content.slides||[];
 if(!slides.length)return;
 currentSlide=Math.min(currentSlide,slides.length-1);
 $('#heroSlides').innerHTML=slides.map((v,i)=>`<div class="hero-slide ${i===currentSlide?'current':''}" style="background-image:linear-gradient(90deg,rgba(12,13,12,.86) 0%,rgba(12,13,12,.58) 40%,rgba(12,13,12,.07) 100%),url('${esc(picture(v.image))}')" role="img" aria-label="${esc(loc(v,'kicker'))}"></div>`).join('');
 $('#heroKicker').textContent=loc(slides[currentSlide],'kicker');
 $('#heroTitle').innerHTML=safeRich(loc(slides[currentSlide],'title'));
 $('#heroLead').textContent=loc(slides[currentSlide],'lead');
 $('#heroDots').innerHTML=slides.map((v,i)=>`<button class="hero-dot ${i===currentSlide?'is-active':''}" data-slide="${i}" aria-label="Show slide ${i+1}" aria-current="${i===currentSlide?'true':'false'}"></button>`).join('');
}
function changeSlide(n){const slides=content.slides||[];if(!slides.length)return;currentSlide=(n+slides.length)%slides.length;renderHero();}
function startSlider(){clearInterval(slideTimer);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&content.slides.length>1)slideTimer=setInterval(()=>{if(!document.hidden&&$('#tourOverlay').hidden)changeSlide(currentSlide+1);},6000);}
function renderFilters(){
 const types=['all','culture','nature','coast'];
 $('#tourFilters').innerHTML=types.map(type=>`<button type="button" class="filter ${state.filter===type?'active':''}" data-filter="${type}">${esc(t(type))}</button>`).join('');
}
function renderTours(){
 let chosen=content.packages.filter(p=>state.filter==='all'||p.category===state.filter);
 $('#tourGrid').innerHTML=chosen.map(p=>`<article class="tour-card"><div class="tour-photo"><img src="${esc(picture(p.image))}" alt="Concept image of ${esc(loc(p,'name'))}" loading="lazy"/><span class="tour-badge">◷ ${p.days} ${esc(t('days'))} / ${p.nights} ${esc(t('nights'))}</span></div><div class="tour-body"><div class="tour-kicker">${esc(t(p.category)).toUpperCase()} • ${esc(t('demoTag'))}</div><h3>${esc(loc(p,'name'))}</h3><p class="tour-short">${esc(loc(p,'subtitle'))}</p><div class="tour-stop-row"><span>◉</span><span>${(p.stops||[]).map(esc).join(' • ')}</span></div><div class="tour-action"><button class="text-action" type="button" data-package="${p.id}">${esc(t('itinerary'))} ↗</button><button class="round-arrow" type="button" data-package="${p.id}" aria-label="View ${esc(loc(p,'name'))}">↗</button></div></div></article>`).join('');
}
function overlayOpen(id){
 $('#genericOverlay').hidden=false;$('#'+id).hidden=false;
 document.body.style.overflow='hidden';
}
function closeModal(id){
 $('#'+id).hidden=true;
 if(['contactModal','packageModal','guidePanel'].every(i=>$('#'+i).hidden)){
  $('#genericOverlay').hidden=true;document.body.style.overflow=$('#tourOverlay').hidden?'':'hidden';
 }
}
function closeAllModals(){['contactModal','packageModal','guidePanel'].forEach(id=>$('#'+id).hidden=true);$('#genericOverlay').hidden=true;document.body.style.overflow=$('#tourOverlay').hidden?'':'hidden';}
function showPackage(id){
 selectedPackage=content.packages.find(p=>p.id===id);if(!selectedPackage)return;
 selectedDay=0;
 drawPackage();closeAllModals();overlayOpen('packageModal');
}
function drawPackage(){
 const p=selectedPackage;if(!p)return;
 $('#packageModalContent').innerHTML=`<div class="package-header"><img src="${esc(picture(p.image))}" alt="${esc(loc(p,'name'))}"/><div class="package-header-copy"><div class="section-kicker">${esc(t(p.category))} • CURATED JOURNEY</div><h2>${esc(loc(p,'name'))}</h2><p>${esc(loc(p,'subtitle'))}</p><div class="package-days">◷ ${p.days} ${esc(t('days'))} / ${p.nights} ${esc(t('nights'))}</div><p class="route-names">${(p.stops||[]).map(esc).join(' → ')}</p></div></div><div class="package-content"><div class="package-heading"><h3>${esc(t('packageDetailsHeading'))}</h3><p>${esc(t('packageDetailsSub'))}</p></div><div class="itinerary-layout"><div class="itinerary-list" role="tablist" aria-label="Itinerary days">${p.route.map((d,i)=>`<button type="button" role="tab" aria-selected="${i===selectedDay}" class="itinerary-day-btn ${i===selectedDay?'active':''}" data-day="${i}"><span class="day-number">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(loc(d,'title'))}</strong><small>${esc(loc(d,'summary'))}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div><div class="itinerary-detail" id="packageDayDetail"></div></div><div class="package-footer"><button class="button button-gradient" data-enquire="${esc(p.id)}">✉ ${esc(t('enquire'))} →</button><span>${esc(t('customQuote'))}</span></div><p class="tiny-note">${esc(content.settings.siteNotice)}</p></div>`;
 drawPackageDay();
}
function drawPackageDay(){
 const p=selectedPackage;if(!p)return;
 const d=p.route[selectedDay];if(!d)return;
 const heading=loc(d,'title')||`Day ${selectedDay+1} — ${loc(d,'place')}`;
 const pictures=d.images||[];
 const el=$('#packageDayDetail');if(!el)return;
 el.innerHTML=`<div class="day-detail-head"><span class="day-label">DAY ${selectedDay+1} / ${p.route.length}</span><h3>${esc(heading)}</h3><p class="day-summary">${esc(loc(d,'summary'))}</p></div><p class="day-description">${esc(loc(d,'description'))}</p>${d.highlights?.length?`<div class="day-highlights"><strong>${esc(t('dayHighlights'))}</strong><ul>${d.highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></div>`:''}<div class="day-gallery-heading"><strong>${esc(t('galleryHeading'))}</strong><small>${esc(t('galleryHint'))}</small></div><div class="day-gallery">${pictures.map((im,i)=>`<button type="button" data-photo="${esc(im.src)}" data-alt="${esc(im.alt||heading)}" aria-label="View photo ${i+1}"><img loading="lazy" src="${esc(picture(im.src))}" alt="${esc(im.alt||heading)}"/></button>`).join('')}</div><div class="day-navigation"><button type="button" data-day="${selectedDay-1}" ${selectedDay===0?'disabled':''}>← ${esc(t('previousDay'))}</button><button type="button" data-day="${selectedDay+1}" ${selectedDay===p.route.length-1?'disabled':''}>${esc(t('nextDay'))} →</button></div>`;
}
function openPhoto(src,alt){const dialog=$('#photoLightbox');$('#fullPhoto').src=picture(src);$('#fullPhoto').alt=alt||'';$('#photoCaption').textContent=alt||'';if(!dialog.open)dialog.showModal();}
function updateEnquiryButton(){
 const button=$('#submitEnquiryButton');if(!button)return;
 const number=String(content.settings?.whatsapp||CONFIG.whatsapp||'').replace(/\D/g,'');
 const hasWhatsapp=number.length>=9&&number.length<=15;
 button.textContent=hasWhatsapp?t('whatsappCta'):(content.settings?.enquiryEmail||CONFIG.enquiryEmail)?t('emailCta'):t('copyCta');
}
function openContact(pkg=''){
 closeAllModals();$('#enquiryForm').reset();$('#enquiryTour').value=pkg;updateEnquiryButton();$('#contactSetupNote').textContent=(!content.settings.whatsapp&&!content.settings.enquiryEmail&&!CONFIG.whatsapp&&!CONFIG.enquiryEmail)?t('contactPending'):'The WhatsApp chat will open with a draft message. You must press Send in WhatsApp.';overlayOpen('contactModal');
}
async function copyText(text){
 if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return true;}catch{}}
 const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';document.body.append(el);el.select();let copied=false;try{copied=document.execCommand('copy');}catch{}el.remove();return copied;
}
async function sendEnquiry(e){
 e.preventDefault();const data=new FormData(e.currentTarget);
 const selected=content.packages.find(p=>p.id===data.get('tour'));
 const form={name:String(data.get('name')||'').trim(),email:String(data.get('email')||'').trim(),phone:String(data.get('phone')||'').trim(),days:Number(data.get('days'))||0,month:String(data.get('month')||''),tour:String(data.get('tour')||''),message:String(data.get('message')||'').trim(),language:state.lang,website:''};
 const fields=[`BUSAN LANKA — TOUR ENQUIRY`,`Name: ${form.name}`,`Email: ${form.email}`,form.phone?`Guest phone: ${form.phone}`:'',`Days: ${form.days||'Flexible'}`,`Travel month: ${form.month||'Flexible'}`,`Tour: ${selected?.name||'Custom tour'}`,`Message: ${form.message||'Please send me further details.'}`].filter(Boolean);
 const body=fields.join('\n');
 // Saving the private lead is independent of WhatsApp. Enquiry storage works only after deploying Supabase Edge Function.
 if(supabaseEnabled){storeTourEnquiry(form).catch(err=>console.warn('Lead not stored; external contact route remains available:',err.message));}
 const number=String(content.settings.whatsapp||CONFIG.whatsapp||'').replace(/\D/g,'');
 if(number.length>=9&&number.length<=15){
  const url=`https://wa.me/${number}?text=${encodeURIComponent(body)}`;
  const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.style.display='none';document.body.append(link);link.click();link.remove();
  msg('WhatsApp chat prepared — press Send in WhatsApp to deliver your enquiry.');closeModal('contactModal');return;
 }
 if(content.settings.enquiryEmail||CONFIG.enquiryEmail){location.href=`mailto:${encodeURIComponent(content.settings.enquiryEmail||CONFIG.enquiryEmail)}?subject=${encodeURIComponent('Busan Lanka tour enquiry')}&body=${encodeURIComponent(body)}`;closeModal('contactModal');return;}
 const copied=await copyText(body);
 if(copied){msg(t('copied'));closeModal('contactModal');}else{msg(t('contactPending'));$('#contactSetupNote').textContent=body;}
}

function addChat(role,text){
 state.chat.push({role,text});const el=$('#guideMessages');const row=document.createElement('div');row.className='chat-row '+(role==='user'?'user':'bot');row.textContent=text;el.appendChild(row);el.scrollTop=el.scrollHeight;
}
function renderGuideQuick(){
 const prompts=state.lang==='en'?['Tell me about Sigiriya','What can I see in Ella?','What should I eat?']:state.lang==='si'?['සීගිරිය ගැන කියන්න','ඇල්ල ගැන කියන්න','ලංකාවේ ආහාර']:['Sigiriya','Ella','Sri Lankan food'];
 $('#guideQuick').innerHTML=prompts.map(p=>`<button type="button" data-question="${esc(p)}">${esc(p)}</button>`).join('');
}
function openGuide(){closeAllModals();overlayOpen('guidePanel');$('#guideStatus').textContent=supabaseEnabled?'AI • Cloud mode (service may need deployment)':'Sample guide • No live AI connection';if(!state.chat.length){addChat('bot',`${t('tripWelcome')} ✨\n${t('questionAbout')}`);}$('#guideInput').focus();}
function fallbackAiAnswer(q){
 const search=q.toLocaleLowerCase();const match=KNOWLEDGE.find(entry=>entry.patterns.some(p=>search.includes(p)));
 if(match?.id)return (content.stories[match.id]||STORIES[match.id]).text[state.lang]||(content.stories[match.id]||STORIES[match.id]).text.en;
 if(match?.reply)return match.reply[state.lang]||match.reply.en;
 return t('demoResponse');
}
async function askGuide(q){
 const question=String(q||'').trim();if(!question)return;
 const history=state.chat.filter(c=>c.role==='user'||c.role==='bot').slice(-8).map(c=>({role:c.role==='user'?'user':'assistant',content:c.text.slice(0,600)}));
 addChat('user',question);
 const input=$('#guideInput'),send=$('#guideForm button[type="submit"]');input.disabled=true;send.disabled=true;
 try{
  if(supabaseEnabled){
   $('#guideStatus').textContent='AI • Connecting securely';
   const answer=await askLiveGuide(question,state.lang,history);
   addChat('bot',answer);$('#guideStatus').textContent='AI • Gemini Live';
  }else{
   $('#guideStatus').textContent='Sample guide • No live AI connection';
   addChat('bot','[Preview] '+fallbackAiAnswer(question));
  }
 }catch(err){
  $('#guideStatus').textContent='AI • Unavailable';
  addChat('bot',`Live travel guide unavailable: ${err.message} Please try again or contact Busan Lanka.`);
 }finally{input.disabled=false;send.disabled=false;}
}

function stopSpeech(){if('speechSynthesis'in window){try{speechSynthesis.cancel();}catch{}}state.voice=null;}
function speak(text){
 if(!('speechSynthesis'in window)){msg(t('speechUnavailable'));return;}
 stopSpeech();const utter=new SpeechSynthesisUtterance(text);utter.lang=langVoice();utter.rate=.91;utter.pitch=1.04;utter.volume=1;
 const voices=speechSynthesis.getVoices();let found=voices.find(v=>v.lang.toLowerCase()===utter.lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(state.lang+'-'));
 if(found)utter.voice=found;
 // Some systems lack native Sinhala/Korean voices; never claim otherwise.
 if(!found && (state.lang==='si'||state.lang==='ko'))msg(t('speechUnavailable'));
 state.voice=utter;speechSynthesis.speak(utter);
}
function playChime(){if(!state.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;let ctx=new AC();let now=ctx.currentTime;[660,880,990].forEach((hz,i)=>{let osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(hz,now+i*.14);gain.gain.setValueAtTime(.0001,now+i*.14);gain.gain.exponentialRampToValueAtTime(.055,now+i*.14+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.14+.28);osc.connect(gain);gain.connect(ctx.destination);osc.start(now+i*.14);osc.stop(now+i*.14+.29);});setTimeout(()=>ctx.close(),1100);}catch{}}
function startTour(){closeAllModals();state.tourStep='welcome';$('#tourOverlay').hidden=false;document.body.style.overflow='hidden';renderTourStage();}
function endTour(){stopSpeech();if(state.watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(state.watchId);}state.watchId=null;state.active=false;state.locationGranted=false;state.coords=null;state.seen.clear();$('#tourOverlay').hidden=true;document.body.style.overflow='';}
function goStage(step){stopSpeech();state.tourStep=step;state.active=step==='active';renderTourStage();if(state.active)evaluateZones();}
function renderTourStage(){
 const stage=$('#tourStage');
 if(state.tourStep==='welcome'){
  stage.innerHTML=`<div class="welcome-controls"><label class="sr-only" for="tourLanguage">Select language</label><select id="tourLanguage">${Object.entries(LANGS).map(([code,v])=>`<option value="${code}" ${state.lang===code?'selected':''}>${esc(v.label)}</option>`).join('')}</select><button id="tourSpeak">${esc(t('listenWelcome'))}</button><button id="tourStopSpeech">${esc(t('stopVoice'))}</button></div><div class="welcome-card"><div class="sun">☀</div><div class="eyebrow light">BUSAN LANKA TRAVEL & TOURS</div><h2>${esc(t('tripWelcome'))}</h2><p>${esc(t('tripWelcomeText'))}</p><button class="button button-white" id="welcomeContinue">${esc(t('continue'))} ↗</button><button class="skip-welcome" id="welcomeSkip">${esc(t('skip'))}</button></div>`;
 }
 if(state.tourStep==='setup'){
  stage.innerHTML=`<div class="setup-heading"><div class="tour-mini-kicker">✦ ${esc(t('tripIntro'))}</div><h2>${esc(t('ready'))}</h2><p>${esc(t('readyText'))}</p></div><div class="setup-options"><div class="setup-option"><span class="option-icon">◎</span><div><b>${esc(t('allowLocation'))}</b><p>${esc(t('allowLocationSub'))}</p></div><button id="enableLocation" class="${state.locationGranted?'enabled':''}">${esc(t(state.locationGranted?'enabled':'enable'))}</button></div><div class="setup-option"><span class="option-icon">♧</span><div><b>${esc(t('allowAlerts'))}</b><p>${esc(t('allowAlertsSub'))}</p></div><button id="enableAlerts" class="${state.notificationsGranted?'enabled':''}">${esc(t(state.notificationsGranted?'enabled':'enable'))}</button></div><div class="setup-option"><span class="option-icon">♫</span><div><b>${esc(t('allowSound'))}</b><p>${esc(t('allowSoundSub'))}</p></div><button id="enableSound" class="${state.sound?'enabled':''}">${esc(t(state.sound?'enabled':'enable'))}</button></div></div><div class="setup-footer"><button id="beginTour" class="button button-gradient">${esc(t('startExplore'))} ↗</button></div><p class="tiny-note">${esc(t('privacyGPS'))}</p>`;
 }
 if(state.tourStep==='active'){
  stage.innerHTML=`<div class="tour-active-title"><div><div class="tour-mini-kicker">✦ BUSAN AI COMPANION</div><h2>${esc(t('liveTour'))}</h2><p class="tiny-note">${esc(t('privacyGPS'))}</p></div><span>● ${esc(t('tripActive'))}</span></div><div class="trip-location"><span>◎</span><div><strong id="locationStatus">${esc(state.locationGranted?t('gpsActive'):t('gpsInactive'))}</strong><p id="locationSub">${esc(state.locationGranted?(state.coords?`GPS: ${state.coords.lat.toFixed(4)}, ${state.coords.lon.toFixed(4)}`:t('allowLocationSub')):t('gpsDenied'))}</p></div></div><div id="tripAlert"></div><div class="trip-section-caption">${esc(t('sampleZones'))}</div><div class="tour-demo-list"><button data-story="sigiriya"><span>🏯</span><b>${esc(t('storySigiriya'))}</b><small>${esc(t('readStory'))}</small></button><button data-story="galle"><span>🏰</span><b>${esc(t('storyGalle'))}</b><small>${esc(t('readStory'))}</small></button><button data-story="buththala"><span>🐘</span><b>${esc(t('storyBuththala'))}</b><small>${esc(t('notLive'))}</small></button></div><p class="tiny-note">${esc(t('storyInfo'))}</p><div class="setup-footer" style="margin-top:40px"><button id="tourOpenAi" class="button button-dark">✦ ${esc(t('askGuide'))}</button><button class="button" id="endTrip" style="background:#e8edf5;color:#364968">${esc(t('stopTrip'))}</button></div>`;
  if(state.story)renderStory();
 }
}
function renderStory(){
 const area=$('#tripAlert');if(!area)return;
 const story=content.stories[state.story];if(!story){area.innerHTML='';return;}
 const content=story.text[state.lang]||story.text.en;
 area.innerHTML=`<div class="trip-alert ${story.type==='warning'?'warning':'history'}"><b>${story.emoji} ${esc(story.title)}</b><p>${esc(content)}</p>${story.type==='warning'?`<p class="note">${esc(t('notLive'))}</p>`:''}<div class="trip-actions"><button class="pill-btn" id="listenStory">▶ ${esc(t('listenStory'))}</button><button class="pill-btn" id="dismissStory">✕ ${esc(t('dismiss'))}</button></div></div>`;
 area.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function triggerStory(id,automatic=false){
 if(!content.stories[id])return;state.story=id;renderStory();
 if(automatic){playChime();if(state.notificationsGranted&&'Notification' in window&&Notification.permission==='granted'){
  try{new Notification('Busan Lanka • Nearby story',{body:content.stories[id].title,icon:'./assets/icon-192.png'});}catch{}
 }
 }
}
function distanceMeters(a,b){const R=6371000,rad=n=>n*Math.PI/180;let dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);let v=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));}
function onPosition(p){
 state.coords={lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy};state.locationGranted=true;
 if($('#locationStatus')){$('#locationStatus').textContent=t('gpsActive');$('#locationSub').textContent=`GPS: ${state.coords.lat.toFixed(4)}, ${state.coords.lon.toFixed(4)}`;}
 evaluateZones();
}
function evaluateZones(){
 if(!state.active||!state.coords||state.coords.accuracy>200)return;
 for(const zone of (content.zones||ZONES)){if(state.seen.has(zone.id))continue;if(distanceMeters(state.coords,zone)<=zone.radius){state.seen.add(zone.id);triggerStory(zone.id,true);break;}}
}
function onPositionError(){if(state.watchId!==null&&navigator.geolocation)navigator.geolocation.clearWatch(state.watchId);state.watchId=null;state.locationGranted=false;msg(t('noGPS'));if($('#locationStatus'))$('#locationStatus').textContent=t('gpsInactive');}
function requestLocation(){
 if(!navigator.geolocation||!window.isSecureContext){msg(t('noGPS'));return;}
 if(state.watchId!==null){state.locationGranted=true;renderTourStage();return;}
 state.watchId=navigator.geolocation.watchPosition(p=>{let prior=state.locationGranted;onPosition(p);if(!prior&&state.tourStep==='setup')renderTourStage();},onPositionError,{enableHighAccuracy:true,maximumAge:10000,timeout:25000});
}
async function requestAlerts(){
 if(!('Notification'in window)||!window.isSecureContext){msg(t('notifUnavailable'));return;}
 try{let permission=await Notification.requestPermission();state.notificationsGranted=permission==='granted';if(!state.notificationsGranted)msg(t('notifUnavailable'));renderTourStage();}catch{msg(t('notifUnavailable'));}
}
function tourInteractions(e){
 const id=e.target.closest('button')?.id;
 if(!id)return;
 if(id==='tourSpeak'){speak(t('tripWelcome')+' '+t('tripWelcomeText'));}
 if(id==='tourStopSpeech'){stopSpeech();}
 if(id==='welcomeContinue'||id==='welcomeSkip'){goStage('setup');}
 if(id==='enableLocation'){requestLocation();}
 if(id==='enableAlerts'){requestAlerts();}
 if(id==='enableSound'){state.sound=!state.sound;if(state.sound)playChime();renderTourStage();}
 if(id==='beginTour'){goStage('active');}
 if(id==='endTrip'){endTour();}
 if(id==='listenStory'&&state.story){speak(content.stories[state.story].text[state.lang]||content.stories[state.story].text.en);}
 if(id==='dismissStory'){state.story=null;stopSpeech();renderStory();}
 if(id==='tourOpenAi'){openGuide();}
}
function initEvents(){
 $('#langSelect').addEventListener('change',e=>setLanguage(e.target.value));
 $('#tourFilters').addEventListener('click',e=>{const button=e.target.closest('[data-filter]');if(button){state.filter=button.dataset.filter;renderFilters();renderTours();}});
 $('#tourGrid').addEventListener('click',e=>{const b=e.target.closest('[data-package]');if(b)showPackage(b.dataset.package);});
 $('#packageModal').addEventListener('click',e=>{const b=e.target.closest('[data-enquire]');if(b){openContact(b.dataset.enquire);return;}const day=e.target.closest('[data-day]');if(day){selectedDay=Number(day.dataset.day);drawPackage();return;}const photo=e.target.closest('[data-photo]');if(photo)openPhoto(photo.dataset.photo,photo.dataset.alt);});
 $('#galleryGrid').addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(b)openPhoto(b.dataset.photo,b.dataset.alt);});
 $('#photoClose').addEventListener('click',()=>$('#photoLightbox').close());
 $('#heroControls').addEventListener('click',e=>{const dot=e.target.closest('[data-slide]');if(dot){changeSlide(Number(dot.dataset.slide));startSlider();return;}const arrow=e.target.closest('[data-move]');if(arrow){changeSlide(currentSlide+Number(arrow.dataset.move));startSlider();}});
 $$('.hero').forEach(el=>{el.addEventListener('mouseenter',()=>clearInterval(slideTimer));el.addEventListener('mouseleave',startSlider);});
 $$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
 $('#genericOverlay').addEventListener('click',closeAllModals);
 ['headerContact','footerContact'].forEach(id=>$('#'+id).addEventListener('click',()=>openContact()));
 ['heroGuide','sectionGuide','bottomGuide','floatingAi','footerAi'].forEach(id=>$('#'+id).addEventListener('click',openGuide));
 ['tryTour','bottomTrip'].forEach(id=>$('#'+id).addEventListener('click',startTour));
 $('#enquiryForm').addEventListener('submit',sendEnquiry);
 $('#guideForm').addEventListener('submit',async e=>{e.preventDefault();const input=$('#guideInput');let q=input.value;input.value='';await askGuide(q);});
 $('#guideQuick').addEventListener('click',e=>{let b=e.target.closest('[data-question]');if(b)askGuide(b.dataset.question);});
 $('#tourStage').addEventListener('click',e=>{const story=e.target.closest('button[data-story]');if(story){triggerStory(story.dataset.story);return;}tourInteractions(e);});
 $('#tourStage').addEventListener('change',e=>{if(e.target.id==='tourLanguage')setLanguage(e.target.value);});
 $('#tourBack').addEventListener('click',()=>{if(state.tourStep==='active')goStage('setup');else if(state.tourStep==='setup')goStage('welcome');else endTour();});
 $('#tourExit').addEventListener('click',endTour);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#tourOverlay').hidden)endTour();else closeAllModals();}});
 $$('.bottom-nav [data-mobile]').forEach(item => item.addEventListener('click', () => {
  $$('.bottom-nav [data-mobile]').forEach(tab => {
    const active = tab === item;
    tab.classList.toggle('is-active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
 }));
 $$('a[href^="#"]:not(.bottom-nav a)').forEach(a => a.addEventListener('click', () => {
   const target = a.getAttribute('href');
   if (target === '#home' || target === '#tours') {
     $$('.bottom-nav [data-mobile]').forEach(tab => {
       const active = tab.getAttribute('href') === target;
       tab.classList.toggle('is-active', active);
       if (active) tab.setAttribute('aria-current', 'page');
       else tab.removeAttribute('aria-current');
     });
   }
 }));
}
async function init(){
 $('#year').textContent=new Date().getFullYear();
 try{content=await publicContent();}catch(e){console.warn('Published content unavailable; showing bundled preview',e);content=structuredClone(DEFAULT_CONTENT);msg('Site content unavailable; showing preview.');}
 setLanguage(detectLang());initEvents();startSlider();
 if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
 if(new URL(location.href).searchParams.get('tour')==='1')startTour();
}
init();
