/* PDF homepage enhancement: destination search, all destinations, contact details.
   Existing app.js remains responsible for CMS, AI, tour modals and enquiries. */
import {publicContent} from './content-store.js';
const $=selector=>document.querySelector(selector);
let search={destination:'',date:'',travellers:'2'};
const text=s=>String(s??'').trim();
const translate=(key)=>{
  const locale=document.documentElement.lang||'en';
  if(cmsSearchContent){const k={found:'pdfSearchFound',none:'pdfSearchNone',viewAll:'pdfViewAll',viewLess:'pdfViewLess'}[key];const x=cmsSearchContent.translations?.[locale]?.[k]||cmsSearchContent.translations?.en?.[k];if(x)return x;}
  const translations={
    en:{found:'Matching journeys are shown below. Dates and group size can be included in your enquiry.',none:'No exact tour match yet. Our team can create a custom itinerary for you.',viewAll:'View all destinations ↗',viewLess:'Show fewer destinations ↑'},
    si:{found:'ගැළපෙන සංචාර පහතින් පෙන්වයි. වැඩි විස්තර සඳහා අමතන්න.',none:'දැනට සෘජුව ගැළපෙන සංචාරයක් නැත. විශේෂ සංචාරයක් සැලසුම් කළ හැක.',viewAll:'සියලු ස්ථාන බලන්න ↗',viewLess:'අඩුවෙන් පෙන්වන්න ↑'}
  };
  return (translations[locale]||translations.en)[key];
};

const searchDestination=$('#pdfDestination');
let cmsSearchContent=null;
function refreshDestinationOptions(){
 if(!cmsSearchContent||!searchDestination)return;
 const old=searchDestination.value;
 searchDestination.replaceChildren();
 const blank=document.createElement('option');blank.value='';blank.textContent=cmsSearchContent.translations?.[document.documentElement.lang]?.pdfWhere||cmsSearchContent.translations?.en?.pdfWhere||'Where to?';searchDestination.append(blank);
 const locale=document.documentElement.lang||'en';
 (cmsSearchContent.destinations||[]).forEach(dest=>{
  const opt=document.createElement('option');
  opt.value=String(dest.name||'').trim();
  opt.textContent=dest.translations?.[locale]?.name||dest.name||'Destination';
  if(opt.value)searchDestination.append(opt);
 });
 if([...searchDestination.options].some(o=>o.value===old))searchDestination.value=old;
}
document.addEventListener('busan:content-ready',event=>{cmsSearchContent=event.detail.content;refreshDestinationOptions();});
document.addEventListener('busan:language-change',refreshDestinationOptions);
// Handle either module load order: app.js may have finished initialization before this module subscribes.
publicContent().then(data=>{if(!cmsSearchContent){cmsSearchContent=data;refreshDestinationOptions();}}).catch(()=>{});

const viewBtn=$('#pdfViewDestinations');
viewBtn?.addEventListener('click',()=>{
  const grid=$('#destinationGrid');const expanded=grid.classList.toggle('is-expanded');
  viewBtn.setAttribute('aria-expanded',String(expanded));
  viewBtn.textContent=translate(expanded?'viewLess':'viewAll');
});
document.addEventListener('busan:language-change',()=>{
  if($('#destinationGrid')?.classList.contains('is-expanded'))viewBtn.textContent=translate('viewLess');
});
const searchStatus=$('#pdfSearchStatus');
const applySearch=()=>{
  const cards=[...document.querySelectorAll('#tourGrid .tour-card')];
  if(!cards.length)return;
  const query=search.destination.toLowerCase();
  let matching=0;
  cards.forEach(card=>{
    const ok=!query||card.textContent.toLowerCase().includes(query);
    card.hidden=!ok;
    if(ok)matching++;
  });
  if(!search.destination){searchStatus.hidden=true;return;}
  searchStatus.hidden=false;
  searchStatus.textContent=matching?translate('found'):translate('none');
};
const grid=$('#tourGrid');
if(grid){const observer=new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'))applySearch();
});observer.observe(grid,{childList:true});}
$('#pdfTourSearch')?.addEventListener('submit',event=>{
  event.preventDefault();
  search={destination:text($('#pdfDestination').value),date:text($('#pdfDate').value),travellers:text($('#pdfTravellers').value)||'2'};
  // Reset category filters first, then narrow to journeys including the selected destination.
  const all=$('#tourFilters [data-filter="all"]');
  if(all && !all.classList.contains('active'))all.click();
  applySearch();
  $('#tours')?.scrollIntoView({behavior:'smooth',block:'start'});
});
// Preserve travel planning preferences when opening the existing enquiry form.
const fillEnquiryDetails=()=>{
 const form=$('#enquiryForm');if(!form||$('#contactModal')?.hidden)return;
 const parts=[search.destination?`Preferred destination: ${search.destination}`:'',search.date?`Preferred travel date: ${search.date}`:'',search.travellers?`Travelers: ${search.travellers}`:''].filter(Boolean);
 if(parts.length){const message=form.querySelector('[name="message"]');if(message&&!message.value.trim())message.value=parts.join('\n');
 if(search.date){const month=form.querySelector('[name="month"]');if(month&&!month.value)month.value=search.date.slice(0,7);}}
};
document.addEventListener('click',event=>{
 if(event.target.closest('#headerContact,#heroGuide,#footerContact,#footerContactExtra,[data-enquire]'))queueMicrotask(fillEnquiryDetails);
},true);
$('#footerContactExtra')?.addEventListener('click',()=>$('#footerContact')?.click());
// This data is editable in Admin -> Site Settings. Never invent a phone/address.
const setFooterContacts=async()=>{
 const target=$('#pdfFooterContacts');if(!target)return;
 try{
  const data=await publicContent();const setting=data?.settings||{};
  target.replaceChildren();
  const contactEntries=[
   {value:text(setting.whatsapp).replace(/\D/g,''),label:'WhatsApp',href:null},
   {value:text(setting.enquiryEmail),label:'Email',href:null},
   {value:text(setting.businessPhone),label:'Telephone',href:null},
   {value:text(setting.officeAddress),label:'Address',href:null},
   {value:text(setting.companyInfo),label:'About',href:null}
  ];
  for(const entry of contactEntries){
   if(!entry.value)continue;
   const el=document.createElement(['About','Address'].includes(entry.label)?'p':'a');
   if(entry.label==='WhatsApp'){
    if(entry.value.length<9||entry.value.length>15)continue;
    el.href=`https://wa.me/${entry.value}`;el.target='_blank';el.rel='noopener noreferrer';el.textContent=`WhatsApp: +${entry.value}`;
   }else if(entry.label==='Telephone'){
    const number=entry.value.replace(/[^+\d]/g,'');
    if(number.length<7)continue;el.href=`tel:${number}`;el.textContent=`Tel: ${entry.value}`;
   }else if(entry.label==='Email'){
    el.href=`mailto:${encodeURIComponent(entry.value)}`;el.textContent=entry.value;
   }else{
    el.textContent=entry.value;
   }
   target.append(el);
  }
 }catch(error){console.warn('Site contact details were not available:',error);}
};
setFooterContacts();
// Search date defaults to today or later, without requiring a date to browse packages.
const day=new Date();const dateInput=$('#pdfDate');
if(dateInput){dateInput.min=[day.getFullYear(),String(day.getMonth()+1).padStart(2,'0'),String(day.getDate()).padStart(2,'0')].join('-');}
