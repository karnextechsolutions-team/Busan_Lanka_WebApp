import {CHANNEL_NAMES,targetFor} from './enquiry-channels.js';
import {COUNTRIES,flagFor,countryLabel,listModerationReviews,saveAdminReview,changeReviewStatus,deleteAdminReview,uploadAdminReviewPhoto,isReviewsCloud} from './reviews-service.js';
import {DEFAULT_CONTENT,supabaseEnabled,publicContent,signIn,signOut,authSession,publishContent,uploadMedia,resetDemo,listEnquiries,updateEnquiryStatus} from './content-store.js';
const $=(s,root=document)=>root.querySelector(s);const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=s=>/^(https?:|data:image\/)/i.test(s||'')?s:'./'+String(s||'').replace(/^\.\/?/,'');
const guid=()=>`item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const state={data:structuredClone(DEFAULT_CONTENT),section:'overview',index:0,day:0,locale:'en',dirty:false,uploadPath:null,leads:[],leadsError:'',leadsLoading:false};
const collectionTitles={overview:['Dashboard','Your website at a glance'],homepage:['Homepage Content','Edit every PDF homepage section, heading, button and image'],slides:['Hero Slider','Upload images, edit captions and control automatic slides'],packages:['Tour Packages & Days','Edit every package and day-by-day itinerary'],destinations:['Destinations','Manage travel destinations and image cards'],galleries:['Photo Galleries','Manage images and their captions'],reviews:['Legacy CMS Reviews','Edit older approved reviews stored with website content'],guestreviews:['Reviews & Moderation','Guest photo submissions, admin reviews, approval and rejection'],enquiries:['Tour Enquiries','Review and follow up on enquiries saved in Supabase'],stories:['AI & GPS Travel Stories','Edit historical narration and educational travel safety guidance'],translations:['Texts & Translations','Edit all existing interface labels in each language'],settings:['Site Settings','Update your company identity and contact details']};
const dataAt=(path)=>path.split('.').reduce((v,k)=>v?.[k],state.data);
function put(path,value){const parts=path.split('.');let ref=state.data;for(let i=0;i<parts.length-1;i++){const k=parts[i];if(ref[k]==null)ref[k]={};ref=ref[k];}ref[parts.at(-1)]=value;dirty();}
const dirty=()=>{state.dirty=true;$('#saveButton').textContent='● Save & Publish';};
function setStatus(str,kind='info'){$('#statusArea').className=`status-note ${kind}`;$('#statusArea').textContent=str;}
const htmlField=(label,path,value,{textarea=false,required=false,placeholder='',rows=4}={})=>`<label class="field"><span>${esc(label)}</span>${textarea?`<textarea data-path="${esc(path)}" rows="${rows}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`:`<input type="text" data-path="${esc(path)}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${required?'required':''}/>`}</label>`;
const translatedPath=(base,key)=>state.locale==='en'?`${base}.${key}`:`${base}.translations.${state.locale}.${key}`;
const translatedValue=(item,key)=>state.locale==='en'?item?.[key]??'':item?.translations?.[state.locale]?.[key]??'';
const localizedField=(label,path,item,key,opts={})=>htmlField(label,translatedPath(path,key),translatedValue(item,key),opts);
const imageField=(label,path,value)=>`<div class="field"><span>${esc(label)}</span><div class="image-editor"><img src="${esc(asset(value))}" alt="Current image" onerror="this.style.opacity='.25'"/><div class="image-editor-input">${htmlField('Image path or HTTPS URL',path,value)}<div class="image-tools"><button class="neutral-btn" data-upload="${esc(path)}" type="button">⇧ Upload image</button><select data-stock="${esc(path)}"><option value="">Use built-in image...</option>${['sigiriya-aerial.webp','sigiriya-heritage.webp','elephants-lake.webp','beach-overhead.webp','kandy-temple.webp','sigiriya.jpg','ella.jpg','kandy.jpg','mirissa.jpg','yala.jpg','hero-hills.jpg','logo-mark.jpg'].map(im=>`<option value="assets/${im}">${im}</option>`).join('')}</select></div></div></div></div>`;
const itemList=(items,selected,fn)=>`<div class="editor-list">${items.map((v,i)=>`<button type="button" class="editor-item ${i===selected?'selected':''}" data-select="${i}"><strong>${esc(fn(v,i))}</strong><small>${esc(v.summary||v.subtitle||v.tag||v.kicker||v.country||'Click to edit')}</small></button>`).join('')}</div>`;
function makeGrid(title,list,editor,addName){return `<div class="collection-header"><h2>${esc(title)}</h2><button class="gold-btn" data-add="${esc(addName)}">＋ Add new</button></div><div class="editor-layout"><aside class="collection-side">${list}</aside><section class="editor-card">${editor}</section></div>`;}
const removeButton=()=>`<button class="danger-btn" data-remove="selected">Delete this item</button>`;
function overview(){const d=state.data;return `<div class="dashboard-banner"><span>YOUR DIGITAL TRAVEL SHOWCASE</span><h2>Craft unforgettable first impressions.</h2><p>Edit your website, publish beautiful galleries and manage the full travel itinerary from one place.</p><a href="./" target="_blank">Preview website ↗</a></div><div class="stat-grid"><article><strong>${d.slides.length}</strong><span>Hero slides</span></article><article><strong>${d.packages.length}</strong><span>Tour packages</span></article><article><strong>${d.destinations.length}</strong><span>Destinations</span></article><article><strong>${d.reviews.filter(v=>v.approved).length}</strong><span>Approved reviews</span></article></div><div class="info-panel"><h3>How to edit your website</h3><p>Open a section, select an item, update text and photos, then press <b>Save & Publish</b>. The public site reads the published document from Supabase when configured.</p><p>${supabaseEnabled?'Cloud mode: only authorized admin users can publish and upload.':'Local demo mode: changes are stored in this browser only. Connect Supabase for shared, persistent production editing.'}</p><p><b>Tour prices:</b> intentionally hidden from the public website. Customers contact Busan Lanka directly.</p></div>`;}
function slidesPanel(){
 const collection=state.data.slides;
 state.index=Math.min(state.index,Math.max(0,collection.length-1));
 const v=collection[state.index];
 const control=`<div class="editor-card slider-options"><h2>Automatic homepage slideshow</h2>
 <label class="field check-field"><input type="checkbox" data-bool="settings.heroAutoplay" ${state.data.settings.heroAutoplay?'checked':''}/> Enable auto-slide on desktop and mobile</label>
 ${htmlField('Slide interval in seconds (3–20)', 'settings.heroIntervalSeconds',state.data.settings.heroIntervalSeconds??6)}
 <p>The website crossfades through the images in this list. Use the image upload field below, click Save & Publish, then refresh the public website. Reduced-motion visitors can navigate slides manually.</p></div>`;
 return control+makeGrid('Homepage hero slides',itemList(collection,state.index,(v,i)=>`Slide ${i+1} • ${v.kicker||'Untitled'}`),v?`${imageField('Full-screen background image',`slides.${state.index}.image`,v.image)}<div class="two-fields">${localizedField('Small headline',`slides.${state.index}`,v,'kicker')}${htmlField('Unique ID',`slides.${state.index}.id`,v.id)}</div>${localizedField('Main headline (supports <em> and <br>)',`slides.${state.index}`,v,'title',{textarea:true,rows:2})}${localizedField('Description',`slides.${state.index}`,v,'lead',{textarea:true})}${removeButton()}`:'Add your first slide','slides');
}

// Section-oriented CMS: every copy block on the PDF homepage is editable without searching hundreds of translation keys.
const homepageGroups=[
 ['Navigation, buttons and hero benefits',[
  ['Destination menu','destinations'],['Services menu','pdfServicesNav'],['Why us menu','pdfWhyNav'],['Contact menu','pdfContactNav'],['Booking button','pdfBookTour'],
  ['Hero explore button','pdfExploreDest'],['Hero plan button','planTrip'],['Hero benefit 1','pdfBenefit1'],['Hero benefit 2','pdfBenefit2'],['Hero benefit 3','pdfBenefit3']]],
 ['Search and destinations',[
  ['Destination label','pdfDestinationLabel'],['Destination placeholder','pdfWhere'],['Travel date label','pdfTravelDate'],['Travellers label','pdfTravellers'],['Search button','pdfSearchTours'],['Popular destinations eyebrow','pdfPopularDestinations'],['Destinations section title','pdfWhereNext'],['View all action','pdfViewAll'],['View fewer action','pdfViewLess'],['Search results message','pdfSearchFound'],['No matches message','pdfSearchNone']]],
 ['Our services',[
  ['Services eyebrow','pdfWhatWeDo'],['Services section title (HTML line break allowed)','pdfServicesTitle'],
  ['Tour packages heading','pdfServiceTourTitle'],['Tour packages description','pdfServiceTourDesc'],
  ['Hotels heading','pdfServiceHotelTitle'],['Hotels description','pdfServiceHotelDesc'],
  ['Airport transfers heading','pdfServiceAirportTitle'],['Airport transfers description','pdfServiceAirportDesc'],
  ['Custom tours heading','pdfServiceCustomTitle'],['Custom tours description','pdfServiceCustomDesc']]],
 ['Why Busan Lanka',[
  ['Why us eyebrow','pdfWhyHeading'],['Why us title (HTML line break allowed)','pdfWhyTitle'],
  ['Benefit 1 title','pdfWhy1Title'],['Benefit 1 description','pdfWhy1Desc'],
  ['Benefit 2 title','pdfWhy2Title'],['Benefit 2 description','pdfWhy2Desc'],
  ['Benefit 3 title','pdfWhy3Title'],['Benefit 3 description','pdfWhy3Desc']]],
 ['Packages, AI Guide and Tour Mode',[
  ['Tours eyebrow','pdfToursKicker'],['Tours title','pdfToursTitle'],['Tours intro','toursIntro'],
  ['AI eyebrow','aiKicker'],['AI section title','aiTitle'],['AI section description','aiText'],
  ['AI preview subtitle','aiPreviewSub'],['AI greeting preview','aiPreviewWelcome'],['AI question preview','aiPreviewQuestion'],['AI response preview','aiPreviewAnswer'],
  ['Journey phone eyebrow','journeyPhoneKicker'],['Journey phone title','journeyPhoneTitle'],['Journey phone subtitle','journeyPhoneSub'],['Journey mock phone button','journeyPhoneButton'],
  ['Tour mode eyebrow','qrKicker'],['Tour mode title','qrTitle'],['Tour mode description','qrText']]],
 ['Gallery, reviews, enquiry and footer',[
  ['Photo section eyebrow','memories'],['Photo section title','storiesTitle'],['Photo section intro','storiesIntro'],['Reviews heading','realReviews'],
  ['CTA heading','pdfCtaTitle'],['CTA description','pdfCtaDesc'],['Start planning button','pdfStartPlanning'],
  ['Footer tagline','pdfFooterTag'],['Footer explore heading','pdfFooterExplore'],['Contact form heading','contactHeading'],
  ['Contact form description','contactDescription'],['Form phone label','enquiryPhoneLabel'],['Enquiry privacy message','enquiryPrivacyNotice'],['Message placeholder','enquiryMessagePlaceholder'],['AI question placeholder','aiInputPlaceholder']]]
];
function homepagePanel(){
 const all=state.data.translations[state.locale]||(state.data.translations[state.locale]={});
 const english=state.data.translations.en||{};
 const localeName=state.locale==='en'?'English':state.locale.toUpperCase();
 const groups=homepageGroups.map(([title,fields])=>`<details class="homepage-group" open><summary>${esc(title)} <span>${fields.length} text items</span></summary><div class="homepage-fields">${fields.map(([label,key])=>{
  const value=all[key]??(state.locale==='en'?english[key]||'':'');
  return htmlField(label+` [${key}]`,`translations.${state.locale}.${key}`,value,{textarea:true,rows:2,placeholder:state.locale==='en'?'':`English fallback: ${String(english[key]||'').slice(0,80)}`});
 }).join('')}</div></details>`).join('');
 const x=state.data.settings;
 return `<div class="info-panel"><h3>Whole website content editor • ${esc(localeName)}</h3><p>Here you can edit navigation, headings, descriptions, buttons, services, AI preview, booking wording and footer text. Switch the Editing language dropdown for translations. For full itinerary details use Tour Packages & Days. For photos inside destination cards and galleries use their dedicated tabs. Remember to Save & Publish.</p><div class="editor-links"><button class="neutral-btn" type="button" data-jump="slides">Hero images & headlines ↗</button><button class="neutral-btn" type="button" data-jump="packages">Package days & pictures ↗</button><button class="neutral-btn" type="button" data-jump="destinations">Destinations ↗</button><button class="neutral-btn" type="button" data-jump="galleries">Photo galleries ↗</button></div></div>
 <div class="editor-card homepage-media"><h2>Section backgrounds and brand identity</h2><p>All photographs shown on the public website are editable, either here or from the linked image collections.</p>
 ${imageField('Site logo', 'settings.logo',x.logo)}
 ${imageField('Why Us section background','settings.whyBackgroundImage',x.whyBackgroundImage)}
 ${imageField('Final booking banner background','settings.ctaBackgroundImage',x.ctaBackgroundImage)}
 ${imageField('QR tour greeting image','settings.tourWelcomeImage',x.tourWelcomeImage)}
 ${imageField('QR tour mockup image','settings.journeyImage',x.journeyImage)}</div>${groups}`;
}
function destinationsPanel(){const c=state.data.destinations;state.index=Math.min(state.index,Math.max(0,c.length-1));const v=c[state.index];return makeGrid('Destination cards',itemList(c,state.index,v=>v.name),v?`${imageField('Destination photo',`destinations.${state.index}.image`,v.image)}<div class="two-fields">${localizedField('Destination name',`destinations.${state.index}`,v,'name')}${localizedField('Short tag',`destinations.${state.index}`,v,'tag')}</div>${localizedField('Destination description',`destinations.${state.index}`,v,'description',{textarea:true})}${removeButton()}`:'Add a destination','destinations');}
function galleriesPanel(){const c=state.data.galleries;state.index=Math.min(state.index,Math.max(0,c.length-1));const v=c[state.index];return makeGrid('Photography & travel stories',itemList(c,state.index,v=>v.title),v?`${imageField('Photo',`galleries.${state.index}.image`,v.image)}${localizedField('Photo title',`galleries.${state.index}`,v,'title')}${localizedField('Photo description',`galleries.${state.index}`,v,'description',{textarea:true})}${removeButton()}`:'Add a gallery item','galleries');}
function reviewsPanel(){const c=state.data.reviews;state.index=Math.min(state.index,Math.max(0,c.length-1));const v=c[state.index];return `<div class="inline-warning">Publish only genuine reviews with the guest's permission. No reviews were fabricated for this demo.</div>`+makeGrid('Guest testimonials',itemList(c,state.index,v=>v.name),v?`${htmlField('Guest name',`reviews.${state.index}.name`,v.name)}${htmlField('Country',`reviews.${state.index}.country`,v.country)}${htmlField('Verified star rating (1–5, or blank for none)',`reviews.${state.index}.rating`,v.rating||'')}${localizedField('Verified review quote',`reviews.${state.index}`,v,'quote',{textarea:true,rows:5})}<label class="field check-field"><input type="checkbox" data-bool="reviews.${state.index}.approved" ${v.approved?'checked':''}/> Approved for publication</label>${removeButton()}`:'Add a verified review','reviews');}
function packagePanel(){const c=state.data.packages;state.index=Math.min(state.index,Math.max(0,c.length-1));const p=c[state.index];if(!p)return makeGrid('Tour packages','',`<p>No packages. Add one to get started.</p>`,'packages');state.day=Math.min(state.day,Math.max(0,p.route.length-1));const d=p.route[state.day];const i=state.index,j=state.day;
 const dayEditor=d?`<div class="day-editor"><div class="collection-header"><h3>Day ${j+1} — ${esc(d.place)}</h3><button class="danger-btn" data-remove="day">Remove day</button></div><div class="two-fields">${localizedField('Day heading',`packages.${i}.route.${j}`,d,'title')}${localizedField('Place name',`packages.${i}.route.${j}`,d,'place')}</div>${localizedField('Short summary',`packages.${i}.route.${j}`,d,'summary')}${localizedField('Detailed day description',`packages.${i}.route.${j}`,d,'description',{textarea:true,rows:7})}${htmlField('Highlights — one line per bullet',`packages.${i}.route.${j}.highlights`,(d.highlights||[]).join('\n'),{textarea:true,rows:4})}<h4>Photos for Day ${j+1}</h4><div class="day-media-editor">${(d.images||[]).map((im,k)=>`<div class="day-image-row">${imageField(`Photo ${k+1}`,`packages.${i}.route.${j}.images.${k}.src`,im.src)}${htmlField('Photo alt text',`packages.${i}.route.${j}.images.${k}.alt`,im.alt)}<button type="button" class="danger-btn" data-delete-photo="${k}">Delete photo</button></div>`).join('')}</div><button class="neutral-btn" data-add-photo>＋ Add day photo</button></div>`:'<p>Add a day to edit its details.</p>';
 return `<div class="collection-header"><h2>Tour packages</h2><button class="gold-btn" data-add="packages">＋ New package</button></div><div class="editor-layout"><aside class="collection-side">${itemList(c,i,v=>v.name)}</aside><section class="editor-card">${imageField('Package cover photo',`packages.${i}.image`,p.image)}<div class="two-fields">${localizedField('Package title',`packages.${i}`,p,'name')}${htmlField('Unique ID',`packages.${i}.id`,p.id)}</div>${localizedField('Package subtitle',`packages.${i}`,p,'subtitle')}
 <div class="three-fields"><label class="field"><span>Category</span><select data-path="packages.${i}.category">${['culture','nature','coast'].map(v=>`<option value="${v}" ${p.category===v?'selected':''}>${v}</option>`).join('')}</select></label>${htmlField('Days',`packages.${i}.days`,p.days)}${htmlField('Nights',`packages.${i}.nights`,p.nights)}</div>${htmlField('Route stops — one per line',`packages.${i}.stops`,(p.stops||[]).join('\n'),{textarea:true})}<div class="collection-header tour-days-heading"><h3>Day-by-day itinerary</h3><button class="gold-btn" data-add-day>＋ Add day</button></div><div class="day-tabs">${p.route.map((day,n)=>`<button class="${j===n?'active':''}" data-day-select="${n}">Day ${n+1}<small>${esc(day.place||'')}</small></button>`).join('')}</div>${dayEditor}${removeButton()}</section></div>`;
}
function storiesPanel(){const key=state.storyKey||'sigiriya';const story=state.data.stories[key];const txt=story.text?.[state.locale]||'';const zone=(state.data.zones||[]).find(z=>z.id===key);return `<div class="inline-warning">Travel content and wildlife advisories must be fact-checked before going live. These educational stories are not verified live wildlife sightings. Auto GPS triggering is enabled only for the landmark zones listed below; wildlife remains manual demo-only.</div><div class="editor-layout"><aside class="collection-side"><div class="editor-list">${Object.entries(state.data.stories).map(([id,s])=>`<button class="editor-item ${id===key?'selected':''}" data-story-select="${esc(id)}"><strong>${esc(s.title)}</strong><small>${esc(id)}</small></button>`).join('')}</div></aside><section class="editor-card"><h2>${esc(story.title)}</h2>${htmlField('Story headline',`stories.${key}.title`,story.title)}${htmlField('Narration in selected language',`stories.${key}.text.${state.locale}`,txt,{textarea:true,rows:9})}<p>Audio narration reads this text aloud using the available device voice for the selected language.</p>${zone?`<div class="three-fields">${htmlField('Latitude',`zones.${state.data.zones.indexOf(zone)}.lat`,zone.lat)}${htmlField('Longitude',`zones.${state.data.zones.indexOf(zone)}.lon`,zone.lon)}${htmlField('Radius (metres)',`zones.${state.data.zones.indexOf(zone)}.radius`,zone.radius)}</div>`:'<p class="inline-warning">Manual demonstration only — no automatic GPS trigger for this story.</p>'}</section></div>`;}
function translationsPanel(){const tr=state.data.translations[state.locale]||(state.data.translations[state.locale]={});const search=state.search||'';const keys=Object.keys(state.data.translations.en||{}).filter(k=>!search||k.toLowerCase().includes(search.toLowerCase())||(tr[k]||'').toLowerCase().includes(search.toLowerCase()));return `<div class="info-panel"><h3>All interface text is editable</h3><p>Choose an editing language above. Package names, itinerary descriptions, galleries, and reviews have their own localized text fields in their editors. Untranslated fields fall back to English.</p><label class="field"><span>Find a label</span><input type="search" id="translationSearch" placeholder="Search text keys..." value="${esc(search)}"/></label></div><div class="translation-grid">${keys.map(key=>`<label class="field"><span>${esc(key)}</span><textarea data-path="translations.${state.locale}.${key}" rows="2">${esc(tr[key]??'')}</textarea></label>`).join('')}</div>`;}
function enquiriesPanel(){
 if(state.leadsLoading)return '<div class="info-panel"><p>Loading tour enquiries...</p></div>';
 if(state.leadsError)return `<div class="info-panel"><p class="inline-warning">${esc(state.leadsError)}</p><button class="neutral-btn" data-reload-leads>Retry loading</button></div>`;
 const mode=supabaseEnabled?'SUPABASE • CLOUD':'LOCAL DEMO • THIS BROWSER ONLY';
 return `<div class="info-panel"><b>${mode}</b><p>Saved enquiries show the guest's preferred contact channel. Opening a chat does not confirm that the guest actually pressed Send. Refresh to see new enquiries.</p></div>
 <div class="collection-header"><h2>Tour enquiries (${state.leads.length})</h2><button class="neutral-btn" data-reload-leads>↻ Refresh</button></div>
 ${state.leads.length?`<div class="lead-cards">${state.leads.map(e=>{
 const ch=String(e.preferred_channel||'unknown').toLowerCase();const label=CHANNEL_NAMES[ch]||'Not recorded';
 const inbox=targetFor(ch,state.data.settings||{});
 return `<article class="lead-card"><header><strong>${esc(e.name)}</strong><span class="lead-badge">${esc(e.status||'new')}</span></header>
 <p class="lead-channel">◉ Preferred contact: <strong>${esc(label)}</strong> <small>(handoff only — delivery unconfirmed)</small></p><small>${esc(new Date(e.created_at).toLocaleString())}</small>
 <p><b>Email:</b> <a href="mailto:${encodeURIComponent(e.email)}">${esc(e.email)}</a></p>${e.phone?`<p><b>Phone:</b> ${esc(e.phone)}</p>`:''}
 <p><b>Tour:</b> ${esc(e.tour_id||'Custom itinerary')} · <b>Days:</b> ${esc(e.travel_days||'Flexible')}</p><p><b>Month:</b> ${esc(e.travel_month||'Flexible')}</p>
 <p class="lead-message">${esc(e.message||'No message provided')}</p>
 <div class="lead-actions">${inbox?`<a class="neutral-btn lead-inbox" href="${esc(inbox)}" target="_blank" rel="noopener noreferrer">Open ${esc(label)} inbox ↗</a>`:''}<button class="neutral-btn" data-lead-status="contacted" data-lead-id="${esc(e.id)}">Mark contacted</button><button class="neutral-btn" data-lead-status="closed" data-lead-id="${esc(e.id)}">Close</button></div></article>`;
 }).join('')}</div>`:`<div class="info-panel"><h3>No enquiries saved yet</h3><p>${supabaseEnabled?'Confirm that the new V4.7 SQL migration and submit-enquiry Edge Function are deployed.':'Submit a test enquiry in this browser; it will appear here after refresh.'}</p></div>`}`;
}
async function loadEnquiriesPanel(){state.leadsLoading=true;state.leadsError='';render();try{state.leads=await listEnquiries();}catch(e){state.leadsError=e.message;}finally{state.leadsLoading=false;if(state.section==='enquiries')render()}}
function settingsPanel(){const x=state.data.settings;return `<section class="editor-card wide"><h2>Website identity and contact</h2><p>Change the business information displayed on the public website. The phone and email enable direct trip enquiries.</p>${imageField('Site logo',`settings.logo`,x.logo)}<div class="two-fields">${htmlField('Company brand',`settings.brand`,x.brand)}${htmlField('Logo subtitle',`settings.subbrand`,x.subbrand)}</div><div class="two-fields">${htmlField('WhatsApp number (international digits)',`settings.whatsapp`,x.whatsapp,{placeholder:'94XXXXXXXXX'})}${htmlField('Enquiry email',`settings.enquiryEmail`,x.enquiryEmail,{placeholder:'name@example.com'})}</div>${imageField('QR tour welcome background',`settings.tourWelcomeImage`,x.tourWelcomeImage)}${imageField('Tour journey mockup background',`settings.journeyImage`,x.journeyImage)}<h3>Homepage design photographs (PDF edition)</h3><p>Hero and destination images are managed in Hero Slider and Destinations. These two section backgrounds are editable here.</p>${imageField('Why Busan Lanka section background',`settings.whyBackgroundImage`,x.whyBackgroundImage||'assets/kandy-temple.webp')}${imageField('Final call-to-action background',`settings.ctaBackgroundImage`,x.ctaBackgroundImage||'assets/sigiriya-heritage.webp')}<h3>Social media & public reviews</h3><p>Use full HTTPS links to the real Busan Lanka accounts. Only configured links are shown on the website.</p><div class="two-fields">${[
 ['Facebook page','facebook','https://facebook.com/yourpage'],['Instagram','instagram','https://instagram.com/youraccount'],
 ['YouTube','youtube','https://youtube.com/@yourchannel'],['TikTok','tiktok','https://tiktok.com/@youraccount'],
 ['Tripadvisor','tripadvisor','https://www.tripadvisor.com/...'],['Google Reviews','googleReviews','https://g.page/r/...']
 ].map(([label,key,hint])=>htmlField(label,`settings.${key}`,x[key]||'',{placeholder:hint})).join('')}</div><h3>Enquiry channels & inbox links</h3><p>Enable only verified accounts. Fill their target handle or number, then Save & Publish. These links open the relevant platform; they do not grant access to private inbox messages or auto-send.</p><div class="social-channel-settings">${[
 ['WhatsApp','whatsapp','contactWhatsappEnabled','94XXXXXXXXX'],
 ['Telegram username','telegram','contactTelegramEnabled','@yourbusiness'],
 ['Instagram DM username','instagram','contactInstagramEnabled','@youraccount'],
 ['Messenger business Page','messenger','contactMessengerEnabled','yourpage']
 ].map(([label,key,enabled,hint])=>`<div class="social-channel-setting"><label class="field check-field"><input type="checkbox" data-bool="settings.${enabled}" ${x[enabled]?'checked':''}/> Enable ${label.replace(' username','').replace(' business Page','')}</label>${htmlField(label,`settings.${key}`,x[key]||'',{placeholder:hint})}${targetFor(key,x)?`<a class="neutral-btn" href="${esc(targetFor(key,x))}" target="_blank" rel="noopener noreferrer">Open linked inbox ↗</a>`:''}</div>`).join('')}</div><div class="two-fields">${htmlField('Business telephone',`settings.businessPhone`,x.businessPhone||'')}${htmlField('Office address',`settings.officeAddress`,x.officeAddress||'',{textarea:true,rows:2})}</div>${htmlField('Short company information',`settings.companyInfo`,x.companyInfo,{textarea:true})}${htmlField('Site preview / content notice',`settings.siteNotice`,x.siteNotice,{textarea:true})}<p class="inline-warning">There is no public price field. Quotes are sent after the customer enquires.</p></section>`;}

// V4.4 private review moderation and manual admin review editor.
const reviewState={items:[],loading:false,error:'',selected:'new',draft:null};
const blankReview=()=>({name:'',country_code:'',rating:5,title:'',review_text:'',visited_month:new Date().toISOString().slice(0,7)+'-01',trip_type:'Couples',photo_paths:[],photo_urls:[],status:'pending',consentAcknowledged:false});
const safeReviewPhoto=src=>/^(https:\/\/|data:image\/)/i.test(String(src||''))?String(src):'';
function prepareDraft(r){reviewState.draft=r?structuredClone(r):blankReview();reviewState.selected=r?.id||'new';}
function reviewsModerationPanel(){
 if(reviewState.loading)return '<div class="info-panel">Loading review moderation inbox...</div>';
 if(reviewState.error)return `<div class="info-panel"><p class="inline-warning">${esc(reviewState.error)}</p><button class="neutral-btn" data-review-action="refresh">Retry</button></div>`;
 const r=reviewState.draft||(reviewState.draft=blankReview());
 const selectedCountry=COUNTRIES.find(c=>c.code===r.country_code);
 const countryText=selectedCountry?`${flagFor(selectedCountry.code)} ${selectedCountry.name}`:'';
 const tripOpts=['Couples','Family','Friends','Solo','Business','Other'].map(v=>`<option value="${v}" ${v===r.trip_type?'selected':''}>${v}</option>`).join('');
 return `<div class="review-db-warning"><b>${isReviewsCloud()?'SUPABASE CLOUD MODE':'LOCAL DEMO — SAME BROWSER ONLY'}</b><br>All visitor reviews begin as pending. Photos are stored in a private bucket; only approved reviews appear publicly. Add your own genuine reviews with the guest's permission. <b>Legacy CMS Reviews</b> remain available in the separate sidebar item.</div>
 <div class="collection-header"><h2>Review moderation (${reviewState.items.length})</h2><div class="admin-review-controls"><button type="button" class="neutral-btn" data-review-action="refresh">↻ Refresh</button><button type="button" class="gold-btn" data-review-action="new">＋ Add review</button></div></div>
 <div class="admin-review-layout"><aside class="admin-review-items">
 ${reviewState.items.length?reviewState.items.map(v=>`<button type="button" class="admin-review-item ${reviewState.selected===v.id?'active':''}" data-review-id="${esc(v.id)}"><strong>${esc(v.name)}</strong><small>${flagFor(v.country_code)} ${esc(v.country_code)} · ${Number(v.rating)||5} ★</small><span class="review-status ${esc(v.status)}">${esc(v.status)}</span></button>`).join(''):'<p>No reviews submitted yet.</p>'}
 </aside><div class="admin-review-edit"><h2>${r.id?'Edit guest review':'Add genuine guest review'}</h2><div class="review-form-row"><label class="field"><span>Guest name</span><input data-review-field="name" maxlength="90" value="${esc(r.name)}"/></label><div class="field country-search-field" data-country-picker><label for="adminReviewCountrySearch">Country + flag</label><div class="country-search-combobox"><input id="adminReviewCountrySearch" type="search" data-country-query role="combobox" aria-label="Search country by name or code" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="adminReviewCountryOptions" autocomplete="off" spellcheck="false" placeholder="Type e.g. Net, Sri, UK…" value="${esc(countryText)}"/><span class="country-search-icon" aria-hidden="true">⌕</span><input type="hidden" data-review-field="country_code" value="${esc(r.country_code||'')}"/></div><div class="country-search-options" id="adminReviewCountryOptions" role="listbox" aria-label="Countries" hidden></div><small class="country-search-help" data-country-help>Select a country from the matching flags below.</small></div></div>
 <div class="review-form-row"><label class="field"><span>Date visited (month / year)</span><input data-review-field="visited_month" type="month" value="${esc(String(r.visited_month||'').slice(0,7))}"/></label><label class="field"><span>Trip type</span><select data-review-field="trip_type">${tripOpts}</select></label></div>
 <div class="review-form-row"><label class="field"><span>Stars (1–5)</span><select data-review-field="rating">${[1,2,3,4,5].map(n=>`<option value="${n}" ${Number(r.rating)===n?'selected':''}>${'★'.repeat(n)} (${n})</option>`).join('')}</select></label><label class="field"><span>Moderation status</span><select data-review-field="status">${['pending','approved','rejected'].map(v=>`<option value="${v}" ${r.status===v?'selected':''}>${v}</option>`).join('')}</select></label></div>
 <label class="field"><span>Review title</span><input data-review-field="title" maxlength="120" value="${esc(r.title)}"/></label><label class="field"><span>Review text (minimum 15 characters)</span><textarea rows="6" data-review-field="review_text" maxlength="2500">${esc(r.review_text)}</textarea></label>
 <div class="field"><span>Guest photos (maximum 2)</span><div class="admin-review-photos">${(r.photo_paths||[]).map((path,i)=>{const url=safeReviewPhoto(r.photo_urls?.[i]||path);return `<div class="admin-review-photo">${url?`<img src="${esc(url)}" alt="Review photo ${i+1}"/>`:'<small>Image uploaded — preview unavailable</small>'}<button type="button" data-review-photo-delete="${i}" title="Remove photo">×</button></div>`}).join('')}</div><button type="button" class="neutral-btn" data-review-action="upload" ${(r.photo_paths||[]).length>=2?'disabled':''}>＋ Upload up to 2 photos</button></div>
 ${!r.id?`<label class="field check-field"><input type="checkbox" id="adminReviewConsent" ${r.consentAcknowledged?'checked':''}/> Guest has permitted publication of this genuine review and photos.</label>`:''}
 <div class="admin-review-controls"><button class="gold-btn" type="button" data-review-action="save">✓ Save review</button>${r.id?`<button class="neutral-btn" type="button" data-review-action="approve">Approve</button><button class="neutral-btn" type="button" data-review-action="reject">Reject</button><button class="danger-btn" type="button" data-review-action="delete">Delete</button>`:''}</div>
 </div></div>`;
}
async function loadGuestModeration(){reviewState.loading=true;reviewState.error='';if(state.section==='guestreviews')render();try{reviewState.items=await listModerationReviews();const old=reviewState.selected;reviewState.draft=old==='new'?reviewState.draft||blankReview():reviewState.items.find(x=>x.id===old)||reviewState.items[0]||blankReview();reviewState.selected=reviewState.draft.id||'new'}catch(e){reviewState.error=e.message;}finally{reviewState.loading=false;if(state.section==='guestreviews')render()}}
// V4.9 — Accessible searchable ISO country selector for review moderation.
// Keep the country code in the existing review draft (and database schema).
let countryActiveIndex=-1;
function matchingCountries(raw){
 const q=String(raw||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
 if(!q)return COUNTRIES.slice(0,14);
 return COUNTRIES.filter(c=>`${c.name} ${c.code}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().includes(q)).slice(0,16);
}
function showCountryOptions(query){
 const picker=$('[data-country-picker]');if(!picker)return;
 const input=picker.querySelector('[data-country-query]');
 const list=picker.querySelector('[role="listbox"]');
 const matches=matchingCountries(query);
 countryActiveIndex=-1;
 list.innerHTML=matches.length?matches.map((c,i)=>`<button type="button" role="option" id="reviewCountryOption${i}" aria-selected="false" data-country-code="${c.code}"><span class="country-option-flag" aria-hidden="true">${flagFor(c.code)}</span><span>${esc(c.name)}</span><small>${c.code}</small></button>`).join(''):'<p class="country-search-empty">No matching countries. Try another name or 2-letter code.</p>';
 list.hidden=false;
 input.setAttribute('aria-expanded','true');
 input.removeAttribute('aria-activedescendant');
}
function hideCountryOptions(){
 const picker=$('[data-country-picker]');if(!picker)return;
 const input=picker.querySelector('[data-country-query]');
 const list=picker.querySelector('[role="listbox"]');
 list.hidden=true;
 input.setAttribute('aria-expanded','false');
 input.removeAttribute('aria-activedescendant');
 countryActiveIndex=-1;
}
function selectCountryCode(code){
 const match=COUNTRIES.find(c=>c.code===code);if(!match||!reviewState.draft)return;
 reviewState.draft.country_code=match.code;
 const picker=$('[data-country-picker]');if(!picker)return;
 picker.querySelector('[data-review-field="country_code"]').value=match.code;
 const input=picker.querySelector('[data-country-query]');
 input.value=`${flagFor(match.code)} ${match.name}`;
 picker.querySelector('[data-country-help]').textContent=`Selected: ${match.name} (${match.code})`;
 input.focus({preventScroll:true});hideCountryOptions();
}
function handleCountryKey(e){
 const picker=e.target.closest('[data-country-picker]');if(!picker)return;
 const list=picker.querySelector('[role="listbox"]');
 if(e.key==='Escape'){hideCountryOptions();return;}
 if(!['ArrowDown','ArrowUp','Enter'].includes(e.key))return;
 if(list.hidden)showCountryOptions(e.target.value);
 const options=[...list.querySelectorAll('[data-country-code]')];if(!options.length)return;
 e.preventDefault();
 if(e.key==='Enter'){selectCountryCode(options[Math.max(0,countryActiveIndex)].dataset.countryCode);return;}
 countryActiveIndex=e.key==='ArrowDown'?(countryActiveIndex+1)%options.length:(countryActiveIndex+options.length-1)%options.length;
 options.forEach((option,i)=>option.setAttribute('aria-selected',String(i===countryActiveIndex)));
 e.target.setAttribute('aria-activedescendant',options[countryActiveIndex].id);
 options[countryActiveIndex].scrollIntoView({block:'nearest'});
}

const captureReviewField=el=>{if(!reviewState.draft)return;const name=el.dataset.reviewField;if(!name)return;reviewState.draft[name]=name==='rating'?Number(el.value):name==='visited_month'?(el.value?el.value+'-01':''):el.value;};
async function saveReviewedRecord(){const r=reviewState.draft;if(!r)return;const date=String(r.visited_month||'').slice(0,7);if(String(r.name||'').trim().length<2||!/^[A-Z]{2}$/.test(r.country_code)||!r.title?.trim()||r.title.trim().length<2||r.review_text?.trim().length<15||!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(date)||date>new Date().toISOString().slice(0,7)){throw new Error('Complete guest name, country, date, title, and at least 15 characters of review text.');}if((r.photo_paths||[]).length>2)throw Error('Maximum two photos.');if(!r.id&&!r.consentAcknowledged)throw Error('Confirm the guest gave permission to publish this review.');const data=await saveAdminReview(r);reviewState.selected=data.id;await loadGuestModeration();setStatus('Review saved. Public display depends on approval status.','success');}
async function reviewAction(btn){const act=btn.dataset.reviewAction;
 if(act==='new'){prepareDraft(null);render();return;}if(act==='refresh'){await loadGuestModeration();return;}
 if(act==='upload'){$('#adminReviewPhotoPicker').value='';$('#adminReviewPhotoPicker').click();return;}
 try{btn.disabled=true;if(act==='save')await saveReviewedRecord();else if(act==='approve'||act==='reject'){if(!reviewState.draft?.id)throw Error('First save this review.');await changeReviewStatus(reviewState.draft.id,act==='approve'?'approved':'rejected');await loadGuestModeration();setStatus(`Review ${act==='approve'?'approved':'rejected'}.`,'success');}
 else if(act==='delete'){if(!reviewState.draft?.id||!confirm('Permanently delete this guest review?'))return;await deleteAdminReview(reviewState.draft.id);prepareDraft(null);await loadGuestModeration();setStatus('Review deleted.','success');}}
 catch(e){setStatus(e.message,'error');}finally{btn.disabled=false;}
}
const panelFns={overview,homepage:homepagePanel,slides:slidesPanel,packages:packagePanel,destinations:destinationsPanel,galleries:galleriesPanel,reviews:reviewsPanel,guestreviews:reviewsModerationPanel,enquiries:enquiriesPanel,stories:storiesPanel,translations:translationsPanel,settings:settingsPanel};
function render(){const [title,description]=collectionTitles[state.section];$('#panelTitle').textContent=title;$('#panelDescription').textContent=description;$$('[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===state.section));$$('[data-mobile-section]').forEach(b=>b.classList.toggle('active',b.dataset.mobileSection===state.section));$('#editor').innerHTML=panelFns[state.section]();}
function closeAdminDrawer(){document.body.classList.remove('admin-menu-open');$('#adminDrawerScrim').hidden=true;$('#menuToggle').setAttribute('aria-expanded','false');}
function openAdminDrawer(){document.body.classList.add('admin-menu-open');$('#adminDrawerScrim').hidden=false;$('#menuToggle').setAttribute('aria-expanded','true');}
function changeSection(section){if(!panelFns[section])return;state.section=section;state.index=0;state.day=0;closeAdminDrawer();render();if(section==='enquiries')loadEnquiriesPanel();if(section==='guestreviews')loadGuestModeration();window.scrollTo({top:0,behavior:'instant'});}

function addNew(key){const id=guid();const things={slides:()=>({id,image:'assets/sigiriya-aerial.webp',kicker:'NEW SLIDE',title:'Discover <em>Sri Lanka</em>',lead:'Your unique travel story starts here.',translations:{}}),destinations:()=>({id,name:'New destination',tag:'Travel experience',description:'Enter description',image:'assets/beach-overhead.webp',translations:{}}),galleries:()=>({id,title:'New photo',description:'',image:'assets/beach-overhead.webp',translations:{}}),reviews:()=>({id,name:'Guest name',country:'',quote:'',rating:5,approved:false,translations:{}}),packages:()=>({id,category:'culture',days:1,nights:0,name:'New tour package',subtitle:'Your custom journey',image:'assets/sigiriya-aerial.webp',stops:[],route:[],translations:{}})};
 if(!things[key])return;state.data[key].push(things[key]());state.index=state.data[key].length-1;state.day=0;dirty();render();}
async function handleLeadAction(button){try{button.disabled=true;await updateEnquiryStatus(button.dataset.leadId,button.dataset.leadStatus);setStatus(supabaseEnabled?'Enquiry status updated in Supabase.':'Enquiry status saved locally (DEMO).','success');await loadEnquiriesPanel();}catch(err){setStatus(err.message,'error');button.disabled=false;}}
function onClick(e){
 const country=e.target.closest('[data-country-code]');if(country){selectCountryCode(country.dataset.countryCode);return;}
 const revSel=e.target.closest('[data-review-id]');if(revSel){const found=reviewState.items.find(r=>r.id===revSel.dataset.reviewId);if(found){prepareDraft(found);render();}return;}
 const revDel=e.target.closest('[data-review-photo-delete]');if(revDel){const i=Number(revDel.dataset.reviewPhotoDelete);reviewState.draft.photo_paths.splice(i,1);reviewState.draft.photo_urls?.splice(i,1);render();return;}
 const revBtn=e.target.closest('[data-review-action]');if(revBtn){reviewAction(revBtn);return;}
 const jump=e.target.closest('[data-jump]');if(jump){changeSection(jump.dataset.jump);return;}
 if(e.target.closest('[data-reload-leads]')){loadEnquiriesPanel();return;}
 const leadBtn=e.target.closest('[data-lead-status]');if(leadBtn){handleLeadAction(leadBtn);return;}
 const storySelect=e.target.closest('[data-story-select]');if(storySelect){state.storyKey=storySelect.dataset.storySelect;render();return;}const section=e.target.closest('[data-section]');if(section){changeSection(section.dataset.section);return;}
 const selection=e.target.closest('[data-select]');if(selection){state.index=+selection.dataset.select;state.day=0;render();return;}
 const add=e.target.closest('[data-add]');if(add){addNew(add.dataset.add);return;}
 if(e.target.closest('[data-add-day]')){const p=state.data.packages[state.index];p.route.push({id:guid(),place:'New place',title:`Day ${p.route.length+1} — New place`,summary:'Enter a short summary',description:'Enter detailed day information',highlights:[],images:[],translations:{}});p.days=p.route.length;p.nights=Math.max(0,p.days-1);state.day=p.route.length-1;dirty();render();return;}
 const day=e.target.closest('[data-day-select]');if(day){state.day=+day.dataset.daySelect;render();return;}
 if(e.target.closest('[data-add-photo]')){const d=state.data.packages[state.index].route[state.day];d.images.push({src:'assets/beach-overhead.webp',alt:''});dirty();render();return;}
 const photodel=e.target.closest('[data-delete-photo]');if(photodel){state.data.packages[state.index].route[state.day].images.splice(+photodel.dataset.deletePhoto,1);dirty();render();return;}
 const remove=e.target.closest('[data-remove]');if(remove){if(!confirm('Delete this item? This change takes effect once you publish.'))return;if(remove.dataset.remove==='day'){const p=state.data.packages[state.index];p.route.splice(state.day,1);p.days=p.route.length;p.nights=Math.max(0,p.days-1);state.day=Math.max(0,state.day-1);}else{state.data[state.section].splice(state.index,1);state.index=Math.max(0,state.index-1);}dirty();render();return;}
 const upload=e.target.closest('[data-upload]');if(upload){state.uploadPath=upload.dataset.upload;$('#imagePicker').value='';$('#imagePicker').click();return;}
}
function setField(el){if(el.id==='translationSearch'){state.search=el.value;const pos=el.selectionStart;render();const search=$('#translationSearch');search.focus();search.setSelectionRange(pos,pos);return;}
 if(el.dataset.stock){if(!el.value)return;put(el.dataset.stock,el.value);render();return;}
 if(el.dataset.bool){put(el.dataset.bool,el.checked);return;}
 if(!el.dataset.path)return;
 const path=el.dataset.path;let val=el.value;if(path.endsWith('.highlights')||path.endsWith('.stops'))val=val.split('\n').map(x=>x.trim()).filter(Boolean);if(/\.(days|nights|lat|lon|radius|heroIntervalSeconds)$/.test(path))val=Math.max(0,Number(val)||0);
 put(path,val);
 // Live image previews without rerendering on each keystroke.
 if(/\.(image|src)$/.test(path)||path==='settings.logo'){const preview=el.closest('.image-editor')?.querySelector('img');if(preview)preview.src=asset(val);}
}
async function save(){if(!state.dirty){setStatus('Nothing new to publish.','success');return;}
 $('#saveButton').disabled=true;setStatus('Saving changes...');
 try{const where=await publishContent(state.data);state.dirty=false;$('#saveButton').textContent='✓ Save & Publish';setStatus(where==='cloud'?'Published to Supabase. Refresh the public website to see the update.':'Saved in this browser (LOCAL DEMO). This is not a cloud publish.','success');}
 catch(e){setStatus(e.message,'error');}
 finally{$('#saveButton').disabled=false;}
}
async function boot(){try{state.data=await publicContent();}catch(e){setStatus('Unable to fetch cloud content; showing bundled preview. You cannot assume edits are published.','error');state.data=structuredClone(DEFAULT_CONTENT);}
 if(supabaseEnabled){if(!(await authSession())){$('#loginView').hidden=false;return;}}
 $('#adminApp').hidden=false;$('#loginView').hidden=true;$('#logoutButton').textContent=supabaseEnabled?'Sign out':'Reset demo';$('#modeBadge').textContent=supabaseEnabled?'SUPABASE MODE':'LOCAL DEMO • BROWSER ONLY';$('#sideHint').textContent=supabaseEnabled?'Changes are published to Supabase with authorized credentials.':'Local demo: changes are saved only to this browser.';render();
}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();$('#loginError').textContent='';try{await signIn($('#loginEmail').value.trim(),$('#loginPass').value);await boot();}catch(err){$('#loginError').textContent=err.message;}});
$('#sidebar').addEventListener('click',onClick);$('#editor').addEventListener('click',onClick);
$('#menuToggle').addEventListener('click',()=>document.body.classList.contains('admin-menu-open')?closeAdminDrawer():openAdminDrawer());
$('#closeAdminMenu').addEventListener('click',closeAdminDrawer);$('#adminDrawerScrim').addEventListener('click',closeAdminDrawer);
$('#mobileAdminMore').addEventListener('click',openAdminDrawer);
$$('[data-mobile-section]').forEach(button=>button.addEventListener('click',()=>changeSection(button.dataset.mobileSection)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAdminDrawer();});
$('#editor').addEventListener('input',e=>{if(e.target.matches('[data-country-query]')){reviewState.draft.country_code='';const picker=e.target.closest('[data-country-picker]');picker.querySelector('[data-review-field="country_code"]').value='';picker.querySelector('[data-country-help]').textContent='Select one of the suggested countries to save.';showCountryOptions(e.target.value);return;}e.target.dataset.reviewField?captureReviewField(e.target):setField(e.target);});
$('#editor').addEventListener('focusin',e=>{if(e.target.matches('[data-country-query]')){e.target.select();showCountryOptions('');}});
$('#editor').addEventListener('keydown',e=>{if(e.target.matches('[data-country-query]'))handleCountryKey(e);});
document.addEventListener('click',e=>{if(!e.target.closest('[data-country-picker]'))hideCountryOptions();});$('#editor').addEventListener('change',e=>{if(e.target.id==='adminReviewConsent'){reviewState.draft.consentAcknowledged=e.target.checked;return;}if(e.target.dataset.reviewField)captureReviewField(e.target);else if(e.target.matches('[data-stock],[data-bool],select[data-path]'))setField(e.target);});
$('#editLang').addEventListener('change',e=>{state.locale=e.target.value;state.search='';render();});
$('#saveButton').addEventListener('click',save);
$('#logoutButton').addEventListener('click',()=>{if(supabaseEnabled){signOut();location.reload();}else{if(confirm('Reset all local demo changes to the original sample content?')){resetDemo();location.reload();}}});
$('#adminReviewPhotoPicker').addEventListener('change',async e=>{const files=[...e.target.files];if(!files.length)return;if(files.length+(reviewState.draft.photo_paths||[]).length>2){setStatus('Maximum two review photos.','error');return;}setStatus('Uploading review photo(s)...');try{for(const file of files){const path=await uploadAdminReviewPhoto(file);reviewState.draft.photo_paths.push(path);reviewState.draft.photo_urls.push(path.startsWith('data:')?path:URL.createObjectURL(file));}render();setStatus('Photo uploaded. Click Save review.','success');}catch(err){setStatus(err.message,'error');}});
$('#imagePicker').addEventListener('change',async e=>{if(!state.uploadPath||!e.target.files?.[0])return;setStatus('Preparing and uploading image...');try{const url=await uploadMedia(e.target.files[0]);put(state.uploadPath,url);render();setStatus(supabaseEnabled?'Image uploaded. Click Save & Publish to use it on the website.':'Image added to local preview. Click Save & Publish to save locally.','success');}catch(err){setStatus(err.message,'error');}});
window.addEventListener('beforeunload',e=>{if(state.dirty){e.preventDefault();e.returnValue='';}});
boot();
