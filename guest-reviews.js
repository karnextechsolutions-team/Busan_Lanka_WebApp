import {COUNTRIES,flagFor,countryLabel,loadApprovedReviews,submitGuestReview,photoToWebp,isReviewsCloud} from './reviews-service.js?v=48';
import {publicContent} from './content-store.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const texts={
 en:['REAL GUEST EXPERIENCES','Stories worth sharing.','Read genuine traveler reviews, or share your experience with photos.','★ Write a review','Guest reviews appear here only after review by our team.','YOUR SRI LANKA EXPERIENCE','Share your story.','How was your journey? Submit a genuine experience to be reviewed before publication.','Your name','Country','Date visited (month/year)','Trip type','Your rating','Review title','Your review','Add up to 2 photos (optional)','JPEG, PNG or WebP. Up to 6 MB each; resized before upload.','I own this review and photos and agree they may be published after approval.','Submit review for approval','Your review is kept private while pending. Submitted photos are not published until approval.','Select country','Select trip type','No published reviews yet. Be the first to share your journey!','Your review has been received and is awaiting approval.','Please choose a maximum of two photos.'],
 si:['සංචාරක අත්දැකීම්','ඔබේ සංචාරක මතකයන්.','අමුත්තන්ගේ අත්දැකීම් කියවන්න. ඔබේ සංචාරය ඡායාරූප සමඟ බෙදාගන්න.','★ Review එකක් ලියන්න','අනුමත කළ reviews පමණක් ප්‍රසිද්ධ වේ.','ශ්‍රී ලංකාවේ ඔබේ ගමන','ඔබේ අත්දැකීම කියන්න.','අනුමැතියෙන් පසු පළ කිරීමට සත්‍ය අත්දැකීමක් ඉදිරිපත් කරන්න.','ඔබේ නම','රට','පැමිණි මාසය/වසර','සංචාර වර්ගය','තරු ගණන','Review මාතෘකාව','ඔබේ අදහස','ඡායාරූප 2ක් දක්වා (අනිවාර්ය නැත)','JPEG, PNG, WebP; එකක් 6MB දක්වා.','අනුමැතියෙන් පසු මගේ අදහස සහ ඡායාරූප පළ කිරීමට එකඟ වෙමි.','අනුමැතියට යවන්න','අනුමත වනතුරු ඔබේ අදහස සහ ඡායාරූප රහසිගතව තබයි.','රට තෝරන්න','සංචාර වර්ගය තෝරන්න','තවමත් අනුමත reviews නැත.','ඔබේ review එක අනුමැතිය සඳහා ලැබුණා.','ඡායාරූප දෙකක් දක්වා පමණක් තෝරන්න.'],
 de:['GÄSTEERFAHRUNGEN','Erlebnisse, die bleiben.','Echte Bewertungen lesen oder Ihre Reise mit Fotos teilen.','★ Bewertung schreiben','Nur freigegebene Bewertungen werden veröffentlicht.','IHRE REISE NACH SRI LANKA','Ihre Geschichte.','Teilen Sie Ihre Erfahrung. Die Veröffentlichung erfolgt nach Prüfung.','Ihr Name','Land','Besuchsmonat / Jahr','Reiseart','Bewertung','Titel','Ihre Bewertung','Bis zu 2 Fotos (optional)','JPEG, PNG oder WebP, bis 6 MB pro Foto.','Ich stimme der Veröffentlichung meiner Bewertung und Fotos nach Freigabe zu.','Zur Prüfung senden','Bis zur Freigabe bleiben Ihre Angaben privat.','Land wählen','Reiseart wählen','Noch keine veröffentlichten Bewertungen.','Ihre Bewertung wartet auf Freigabe.','Maximal zwei Fotos auswählen.'],
 fr:['AVIS DES VOYAGEURS','Des souvenirs à partager.','Consultez des avis authentiques ou partagez votre expérience en photos.','★ Écrire un avis','Seuls les avis approuvés sont publiés.','VOTRE VOYAGE AU SRI LANKA','Racontez votre voyage.','Partagez votre expérience; la publication nécessite une approbation.','Votre nom','Pays','Mois / année de visite','Type de voyage','Note','Titre','Votre avis','Jusqu’à 2 photos (facultatif)','JPEG, PNG ou WebP, 6 Mo maximum chacune.','J’accepte la publication de mon avis et de mes photos après approbation.','Envoyer pour approbation','Les photos restent privées en attendant la modération.','Choisir un pays','Choisir un type','Aucun avis publié pour le moment.','Votre avis est en attente de validation.','Deux photos maximum.'],
 ru:['ОТЗЫВЫ ГОСТЕЙ','Истории путешествий.','Читайте отзывы или делитесь своими впечатлениями с фото.','★ Оставить отзыв','Публикуются только одобренные отзывы.','ВАША ПОЕЗДКА','Расскажите о поездке.','Отзыв будет опубликован после проверки.','Ваше имя','Страна','Месяц / год поездки','Тип поездки','Оценка','Заголовок','Ваш отзыв','До 2 фото (необязательно)','JPEG, PNG или WebP, до 6 МБ каждое.','Я согласен на публикацию отзыва и фото после одобрения.','Отправить на проверку','Фотографии приватны до одобрения.','Выберите страну','Тип поездки','Пока нет опубликованных отзывов.','Отзыв отправлен на проверку.','Максимум два фото.'],
 ko:['여행객 후기','함께 나누는 여행 이야기.','실제 후기를 읽거나 사진과 함께 경험을 공유하세요.','★ 후기 작성','승인된 후기만 게시됩니다.','스리랑카 여행','여행 이야기를 들려주세요.','확인 후 공개되는 실제 여행 후기를 제출해 주세요.','이름','국가','방문 월/연도','여행 유형','별점','후기 제목','후기 내용','사진 최대 2장 (선택)','JPEG, PNG, WebP, 각 최대 6MB.','승인 후 후기와 사진 게시에 동의합니다.','후기 제출','승인 전까지 후기는 비공개입니다.','국가 선택','여행 유형 선택','아직 게시된 후기가 없습니다.','승인 대기 중입니다.','사진은 두 장까지 업로드하세요.']
};
const T=n=>(texts[document.documentElement.lang]||texts.en)[n];
let legacy=[],posted=[],selectedFiles=[];
const monthLabel=s=>{if(!s)return '';try{return new Date(`${String(s).slice(0,7)}-01T12:00:00`).toLocaleDateString(document.documentElement.lang||'en',{month:'short',year:'numeric'})}catch{return String(s).slice(0,7)}};
const REVIEW_EXPAND_LABELS={
 en:['Read more','Read less'],si:['තවත් කියවන්න','අඩුවෙන් පෙන්වන්න'],
 de:['Mehr lesen','Weniger anzeigen'],fr:['Lire la suite','Afficher moins'],
 ru:['Читать далее','Свернуть'],ko:['더 읽기','접기']
};
const activeLocale=()=>String(document.documentElement.lang||'en').toLowerCase().split('-')[0];
const reviewExpandLabel=(expanded)=> (REVIEW_EXPAND_LABELS[activeLocale()]||REVIEW_EXPAND_LABELS.en)[expanded?1:0];
// The submission timestamp is supplied by the DB (created_at) or stored at local submission.
// Never turn the separately entered "Date visited" into a fabricated review-posted date.
function relativeReviewTime(timestamp, now=Date.now()){
 const t=Date.parse(String(timestamp||''));
 if(!Number.isFinite(t))return '';
 const diff=Math.max(0,now-t),s=Math.floor(diff/1000);
 if(s<45)return activeLocale()==='si'?'දැන්':'Just now';
 let value,unit;
 if(s<60*60){value=Math.max(1,Math.floor(s/60));unit='minute';}
 else if(s<24*60*60){value=Math.floor(s/3600);unit='hour';}
 else if(s<7*24*60*60){value=Math.floor(s/86400);unit='day';}
 else if(s<30*24*60*60){value=Math.floor(s/(7*86400));unit='week';}
 else if(s<365*24*60*60){value=Math.floor(s/(30*86400));unit='month';}
 else {value=Math.floor(s/(365*86400));unit='year';}
 try{return new Intl.RelativeTimeFormat(activeLocale(),{numeric:'always'}).format(-value,unit)}
 catch{return new Intl.RelativeTimeFormat('en',{numeric:'always'}).format(-value,unit)}
}
function reviewCard(r,index){
 const country=r.country_code?`${flagFor(r.country_code)} ${countryLabel(r.country_code)}`:(r.country||'');
 const title=r.title||'';const quote=String(r.review_text||r.quote||'');const stars=Number(r.rating);
 const hasRating=Number.isInteger(stars)&&stars>=1&&stars<=5;
 const imgs=(r.photo_urls||r.images||[]).slice(0,2);
 const copyId=`review-text-${index}`;
 const needsExpand=quote.length>225||quote.split(/\r?\n/).length>4;
 const relative=r.created_at?relativeReviewTime(r.created_at):'';
 const postedTime=relative?`<time class="review-posted-time" datetime="${esc(r.created_at)}" title="${esc(new Date(r.created_at).toLocaleString(document.documentElement.lang||'en'))}">${esc(relative)}</time>`:'';
 return `<article class="guest-review-card"><div class="guest-card-top"><span class="review-avatar">${esc(String(r.name||'G').slice(0,1).toUpperCase())}</span><div class="guest-card-name"><strong>${esc(r.name)}</strong><small>${esc(country)}</small></div>${postedTime||'<span class="review-card-badge">✓ Reviewed</span>'}</div>
 ${hasRating?`<div class="guest-stars" aria-label="${stars} of 5 stars">${'★'.repeat(stars)}</div>`:''}
 ${title?`<h3>${esc(title)}</h3>`:''}
 <p id="${copyId}" class="guest-review-quote${needsExpand?' is-collapsed':''}">${esc(quote)}</p>
 ${needsExpand?`<button type="button" class="review-read-toggle" data-review-expand="${copyId}" aria-controls="${copyId}" aria-expanded="false">${reviewExpandLabel(false)}</button>`:''}
 ${imgs.length?`<div class="guest-review-photos">${imgs.map(url=>`<button type="button" data-review-image="${esc(url)}" aria-label="Open guest photo"><img src="${esc(url)}" alt="Travel experience shared by ${esc(r.name)}" loading="lazy"/></button>`).join('')}</div>`:''}
 <div class="guest-review-meta">${r.visited_month?`<span><b>Date visited</b> ${esc(monthLabel(r.visited_month))}</span>`:''}${r.trip_type?`<span><b>Trip type</b> ${esc(r.trip_type)}</span>`:''}</div></article>`;
}
let reviewCarouselTimer=null;
let reviewVisible=true;
const carouselReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const reviewStep=()=>{
 const list=$('#reviewsGrid'),card=list?.querySelector('.guest-review-card');if(!card)return 0;
 const gap=parseFloat(getComputedStyle(list).columnGap)||18;
 return card.getBoundingClientRect().width+gap;
};
function moveReviews(direction=1){
 const list=$('#reviewsGrid');if(!list||list.scrollWidth<=list.clientWidth+5)return;
 const next=list.scrollLeft+reviewStep()*direction;
 list.scrollTo({left:next>=list.scrollWidth-list.clientWidth-5?0:Math.max(0,next),behavior:carouselReduced.matches?'instant':'smooth'});
}
function pauseReviewCarousel(){clearInterval(reviewCarouselTimer);reviewCarouselTimer=null}
function resumeReviewCarousel(){
 pauseReviewCarousel();const grid=$('#reviewsGrid');
 if(carouselReduced.matches||!reviewVisible||document.hidden||grid.matches(':hover')||grid.matches(':focus-within'))return;
 if(grid.querySelectorAll('.guest-review-card').length<= (window.innerWidth<=760?1:window.innerWidth<=1050?2:3))return;
 reviewCarouselTimer=setInterval(()=>moveReviews(1),5500);
}
const reviewObserver=new IntersectionObserver(entries=>{reviewVisible=entries[0]?.isIntersecting||false;resumeReviewCarousel()},{threshold:.12});
reviewObserver.observe($('#reviewsGrid'));
$('#reviewsGrid').addEventListener('pointerenter',pauseReviewCarousel);
$('#reviewsGrid').addEventListener('pointerleave',resumeReviewCarousel);
$('#reviewsGrid').addEventListener('focusin',pauseReviewCarousel);
$('#reviewsGrid').addEventListener('focusout',resumeReviewCarousel);
document.addEventListener('visibilitychange',resumeReviewCarousel);
window.addEventListener('resize',resumeReviewCarousel);
carouselReduced.addEventListener('change',resumeReviewCarousel);
$('#reviewPrev').addEventListener('click',()=>{moveReviews(-1);resumeReviewCarousel()});
$('#reviewNext').addEventListener('click',()=>{moveReviews(1);resumeReviewCarousel()});
function drawReviews(){
 const target=$('#reviewsGrid');if(!target)return;
 const items=[...posted,...legacy.filter(r=>r.approved)];
 target.innerHTML=items.length?items.map((r,i)=>reviewCard(r,i)).join(''):`<div class="review-empty">${esc(T(22))}</div>`;
 const counter=$('#reviewTotal');const total=(posted.totalCount??posted.length)+legacy.filter(r=>r.approved).length;counter.textContent=`${total} approved traveler review${total===1?'':'s'}`;
 const arrows=items.length>(window.innerWidth<=760?1:window.innerWidth<=1050?2:3);
 $('#reviewPrev').disabled=!arrows;$('#reviewNext').disabled=!arrows;
 resumeReviewCarousel();
}
async function refresh(){try{posted=await loadApprovedReviews()}catch(e){console.warn('Live reviews unavailable:',e);posted=[];}try{const content=await publicContent();legacy=content.reviews||[]}catch{}drawReviews()}
function translate(){const ids=['reviewKicker','guestReviewsTitle','reviewIntro','writeReviewButton','reviewsDisclaimer','newReviewKicker','newReviewTitle','reviewFormIntro','reviewNameLabel','reviewCountryLabel','reviewMonthLabel','reviewTripTypeLabel','reviewRatingLabel','reviewTitleLabel','reviewTextLabel','reviewPhotosLabel','reviewPhotoHint','reviewConsentText','guestReviewSubmit','reviewFormPrivacy'];ids.forEach((id,i)=>{const el=$('#'+id);if(el)el.textContent=T(i)});const country=$('#reviewCountry'),old=country.value;const display=new Intl.DisplayNames([document.documentElement.lang||'en'],{type:'region'});country.innerHTML=`<option value="">${esc(T(20))}</option>`+COUNTRIES.map(c=>`<option value="${c.code}">${flagFor(c.code)} ${esc(display.of(c.code)||c.name)}</option>`).join('');country.value=old;$('#reviewTripType').options[0].textContent=T(21);drawReviews();}
function drawRating(n){const v=Number(n);$('#guestReviewForm [name=rating]').value=String(v);document.querySelectorAll('#reviewStarButtons [data-rating]').forEach(b=>{const on=Number(b.dataset.rating)<=v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(Number(b.dataset.rating)===v));});$('#reviewRatingText').textContent=`${v} / 5`;}
const dialog=$('#guestReviewDialog');
$('#writeReviewButton').addEventListener('click',()=>{dialog.showModal();$('#reviewFormStatus').textContent='';$('#reviewMonth').max=new Date().toISOString().slice(0,7);});
$('#closeGuestReview').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
$('#reviewStarButtons').addEventListener('click',e=>{const b=e.target.closest('[data-rating]');if(b)drawRating(b.dataset.rating)});drawRating(5);
$('#guestReviewPhotos').addEventListener('change',e=>{selectedFiles=[...e.target.files];if(selectedFiles.length>2){selectedFiles=[];e.target.value='';$('#reviewFormStatus').textContent=T(24)}else $('#reviewFormStatus').textContent='';$('#reviewPhotoPreviews').replaceChildren(...selectedFiles.map(f=>{const im=document.createElement('img');im.src=URL.createObjectURL(f);im.onload=()=>URL.revokeObjectURL(im.src);im.alt='Your selected photo';return im}));});
$('#guestReviewForm').addEventListener('submit',async e=>{
 e.preventDefault();const f=e.currentTarget;const btn=$('#guestReviewSubmit'),status=$('#reviewFormStatus');if(!f.reportValidity())return;
 btn.disabled=true;status.textContent='Submitting your review...';
 try{
  const photos=[];for(const file of selectedFiles)photos.push(await photoToWebp(file));
  const values=Object.fromEntries(new FormData(f));const consent=f.querySelector('[name=consent]').checked;
  const out=await submitGuestReview({...values,consent,photos});status.textContent=T(23)+(out.mode==='local'?' (LOCAL DEMO — browser only)':'');
  f.reset();selectedFiles=[];$('#reviewPhotoPreviews').replaceChildren();drawRating(5);await refresh();
 }catch(err){status.textContent=err.message}finally{btn.disabled=false}
});
$('#reviewsGrid').addEventListener('click',e=>{
 const more=e.target.closest('[data-review-expand]');
 if(more){
  const p=document.getElementById(more.dataset.reviewExpand);if(!p)return;
  const expanded=more.getAttribute('aria-expanded')==='true';
  p.classList.toggle('is-collapsed',expanded);
  more.setAttribute('aria-expanded',String(!expanded));
  more.textContent=reviewExpandLabel(!expanded);
  return;
 }
 const b=e.target.closest('[data-review-image]');if(!b)return;
 const img=$('#fullPhoto'),cap=$('#photoCaption'),box=$('#photoLightbox');
 img.src=b.dataset.reviewImage;img.alt='Traveler photo';cap.textContent='Guest travel photo';box.showModal();
});
document.addEventListener('busan:content-ready',()=>refresh());
document.addEventListener('busan:language-change',translate);
translate();refresh();
