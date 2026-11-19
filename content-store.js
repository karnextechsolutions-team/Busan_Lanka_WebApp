import { TRANS, DESTINATIONS, PACKAGES, STORIES, ZONES } from './data.js';
import { SUPABASE } from './supabase-config.js';
import {localEnquiries,updateLocalEnquiry} from './enquiry-channels.js';

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
 version:5,
 settings:{heroAutoplay:true,heroIntervalSeconds:6,contactWhatsappEnabled:true,contactTelegramEnabled:false,contactInstagramEnabled:false,contactMessengerEnabled:false,telegram:'',messenger:'',businessPhone:'',officeAddress:'',whyBackgroundImage:'assets/kandy-temple.webp',ctaBackgroundImage:'assets/sigiriya-heritage.webp',storyJungleImage:'assets/elephants-lake.webp',storyFallsImage:'assets/sigiriya-heritage.webp',storyBridgeImage:'assets/ella.jpg',storyOceanImage:'assets/beach-overhead.webp',facebook:'',instagram:'',youtube:'',tiktok:'',tripadvisor:'',googleReviews:'',brand:'BUSAN LANKA',subbrand:'TRAVEL & TOURS',logo:'assets/logo-mark.jpg',whatsapp:'',enquiryEmail:'',companyInfo:'A locally guided journey through Sri Lanka.',tourWelcomeImage:'assets/sigiriya-aerial.webp',journeyImage:'assets/sigiriya-heritage.webp',siteNotice:'Preview content: replace with verified Busan Lanka itineraries, licensed photos and approved reviews before launch.'},
 slides:[
  {id:'hero-sigiriya',image:'assets/sigiriya-heritage.webp',kicker:'SRI LANKA · TRAVEL & TOURS',title:'Wake up inside the <em>postcard.</em>',lead:'Sunrise fortresses, glowing temples and endless coast. We plan the tours, stays and transfers, you just arrive.',translations:{}},
  {id:'hero-beach',image:'assets/beach-overhead.webp',kicker:'COASTLINES & GOLDEN HORIZONS',title:'Chase the <em>sunshine</em><br>on our shores.',lead:'Discover the beautiful coast, tropical culture and peaceful ocean escapes.',translations:{}},
  {id:'hero-hills',image:'assets/hero-hills.jpg',kicker:'THE HILLS ARE CALLING',title:'Find <em>magic</em><br>in the mountains.',lead:'From tea country to scenic trails, explore Sri Lanka at your own pace.',translations:{}},
  {id:'hero-kandy',image:'assets/kandy-temple.webp',kicker:'CULTURE, STORIES & PEOPLE',title:'Explore our <em>living</em><br>heritage.',lead:'Listen to centuries of stories, meet local people and make unforgettable memories.',translations:{}}
 ],
 destinations:[
  {id:'sigiriya',name:'Sigiriya',tag:'CULTURE & HERITAGE',image:'assets/sigiriya-heritage.webp',description:'The rock fortress at sunrise, above a sea of jungle.',translations:{}},
  {id:'ella',name:'Ella',tag:'Mountain paradise',image:'assets/ella.jpg',description:'Hills, train journeys and lush scenery.',translations:{}},
  {id:'mirissa',name:'Golden Beaches',tag:'COASTAL ESCAPES',image:'assets/beach-overhead.webp',description:'Surf, sand and swaying palms.',translations:{}},
  {id:'kandy',name:'Kandy',tag:'SACRED CITY',image:'assets/kandy-temple.webp',description:'Temple lights at twilight.',translations:{}},
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

// PDF homepage copy; editable under Admin → Texts & Translations.
const PDF_HOMEPAGE_LABELS={
  "en": {
    "pdfServicesNav": "Services",
    "pdfWhyNav": "Why us",
    "pdfContactNav": "Contact",
    "pdfBookTour": "Book a tour",
    "pdfExploreDest": "Explore destinations",
    "pdfBenefit1": "Custom itineraries",
    "pdfBenefit2": "Local guides",
    "pdfBenefit3": "Airport transfers",
    "pdfDestinationLabel": "DESTINATION",
    "pdfWhere": "Where to?",
    "pdfTravelDate": "TRAVEL DATE",
    "pdfTravellers": "TRAVELLERS",
    "pdfSearchTours": "Search tours",
    "pdfPopularDestinations": "POPULAR DESTINATIONS",
    "pdfWhereNext": "Where will you go next?",
    "pdfViewAll": "View all destinations ↗",
    "pdfViewLess": "Show fewer destinations",
    "pdfWhatWeDo": "WHAT WE DO",
    "pdfServicesTitle": "Everything for the trip, in<br>one place.",
    "pdfServiceTourTitle": "Tour packages",
    "pdfServiceTourDesc": "Ready-made routes for culture, coast, hills and wildlife, built to run smoothly.",
    "pdfServiceHotelTitle": "Hotels and stays",
    "pdfServiceHotelDesc": "From beach villas to hill-country bungalows, booked to match your style and budget.",
    "pdfServiceAirportTitle": "Airport transfers",
    "pdfServiceAirportDesc": "Comfortable pickups and private drivers, so every leg of the journey is covered.",
    "pdfServiceCustomTitle": "Custom itineraries",
    "pdfServiceCustomDesc": "Tell us what you love and we will shape a trip around it, day by day.",
    "pdfWhyHeading": "WHY BUSAN LANKA",
    "pdfWhyTitle": "Travel planned by<br>people who care<br><em>how it feels.</em>",
    "pdfWhy1Title": "Local knowledge",
    "pdfWhy1Desc": "We plan around real places, real timing and the little details that make a day easy.",
    "pdfWhy2Title": "Made around you",
    "pdfWhy2Desc": "Every itinerary starts from your pace, interests and group, never a fixed script.",
    "pdfWhy3Title": "Support all the way",
    "pdfWhy3Desc": "One team from first message to your flight home, reachable when plans change.",
    "pdfToursKicker": "CURATED JOURNEYS",
    "pdfToursTitle": "Explore Sri Lanka,<br><em>your way.</em>",
    "pdfCtaTitle": "Your next sunrise is waiting.",
    "pdfCtaDesc": "Share where and when. We will reply with a plan that fits.",
    "pdfStartPlanning": "Start planning",
    "pdfFooterTag": "Tours, stays and transfers, planned with care.",
    "pdfFooterExplore": "EXPLORE",
    "pdfSearchFound": "Matching journeys are shown below. Contact us to customize dates and travelers.",
    "pdfSearchNone": "No exact matching package yet. Contact us for a custom itinerary."
  },
  "si": {
    "pdfServicesNav": "සේවා",
    "pdfWhyNav": "අප ගැන",
    "pdfContactNav": "සම්බන්ධ වන්න",
    "pdfBookTour": "සංචාරයක් ඉල්ලන්න",
    "pdfExploreDest": "සංචාරක ස්ථාන බලන්න",
    "pdfBenefit1": "අභිරුචි සංචාර",
    "pdfBenefit2": "දේශීය මඟපෙන්වන්නන්",
    "pdfBenefit3": "ගුවන්තොටුපළ ප්‍රවාහන",
    "pdfDestinationLabel": "සංචාරක ස්ථානය",
    "pdfWhere": "කොහේද යන්නේ?",
    "pdfTravelDate": "සංචාර දිනය",
    "pdfTravellers": "සංචාරකයන්",
    "pdfSearchTours": "සංචාර සොයන්න",
    "pdfPopularDestinations": "ජනප්‍රිය සංචාරක ස්ථාන",
    "pdfWhereNext": "ඊළඟට යන්නේ කොහේද?",
    "pdfViewAll": "සියලු ස්ථාන බලන්න ↗",
    "pdfViewLess": "අඩුවෙන් පෙන්වන්න",
    "pdfWhatWeDo": "අපගේ සේවා",
    "pdfServicesTitle": "ඔබේ සම්පූර්ණ සංචාරය<br>එකම තැනකින්.",
    "pdfServiceTourTitle": "සංචාර පැකේජ",
    "pdfServiceTourDesc": "සංස්කෘතිය, වෙරළ, කඳුකරය සහ වනජීවී සංචාර සඳහා සැලසුම් කළ මාර්ග.",
    "pdfServiceHotelTitle": "හෝටල් සහ නවාතැන්",
    "pdfServiceHotelDesc": "ඔබේ රුචිය සහ අයවැය අනුව නවාතැන් සංවිධානය කරමු.",
    "pdfServiceAirportTitle": "ගුවන්තොටුපළ ප්‍රවාහන",
    "pdfServiceAirportDesc": "පහසු ගමන් සඳහා පුද්ගලික රියදුරු සහ ප්‍රවාහන පහසුකම්.",
    "pdfServiceCustomTitle": "ඔබට ගැළපෙන සංචාර",
    "pdfServiceCustomDesc": "ඔබ කැමති අත්දැකීම් අනුව දිනෙන් දින සංචාරය සකස් කරමු.",
    "pdfWhyHeading": "BUSAN LANKA ඇයි?",
    "pdfWhyTitle": "ඔබේ ගමන<br>සැලකිල්ලෙන්<br><em>සැලසුම් කරමු.</em>",
    "pdfWhy1Title": "දේශීය දැනුම",
    "pdfWhy1Desc": "ස්ථාන, ගමන් කාලය සහ කුඩා විස්තර ගැන සැලකිලිමත් වෙමු.",
    "pdfWhy2Title": "ඔබ වෙනුවෙන් සැකසූ",
    "pdfWhy2Desc": "ඔබේ රුචිය, වේගය සහ කණ්ඩායම අනුව සැලසුම්.",
    "pdfWhy3Title": "මුළු ගමන පුරා සහාය",
    "pdfWhy3Desc": "පළමු පණිවිඩයේ සිට ආපසු යන තුරුම සහාය.",
    "pdfToursKicker": "විශේෂ සංචාර",
    "pdfToursTitle": "ශ්‍රී ලංකාව ගවේෂණය කරන්න,<br><em>ඔබේ ආකාරයට.</em>",
    "pdfCtaTitle": "ඔබේ ඊළඟ සුන්දර උදෑසන බලා සිටියි.",
    "pdfCtaDesc": "කොහේද, කවදාද කියන්න. ඔබට ගැළපෙන සැලසුමක් අපි ලබාදෙමු.",
    "pdfStartPlanning": "සැලසුම් කරන්න",
    "pdfFooterTag": "සංචාර, නවාතැන් සහ ප්‍රවාහන සේවා සැලකිල්ලෙන්.",
    "pdfFooterExplore": "ගවේෂණය",
    "pdfSearchFound": "ගැළපෙන සංචාර පහතින් පෙන්වයි. වැඩි විස්තර සඳහා අමතන්න.",
    "pdfSearchNone": "දැනට සෘජුව ගැළපෙන සංචාරයක් නැත. ඔබට විශේෂ සැලසුමක් ලබාදෙමු."
  },
  "de": {
    "pdfServicesNav": "Leistungen",
    "pdfWhyNav": "Warum wir",
    "pdfContactNav": "Kontakt",
    "pdfBookTour": "Tour anfragen",
    "pdfExploreDest": "Reiseziele entdecken",
    "pdfSearchTours": "Touren suchen",
    "pdfWhereNext": "Wohin geht es als Nächstes?",
    "pdfStartPlanning": "Reise planen",
    "pdfCtaTitle": "Ihr nächster Sonnenaufgang wartet.",
    "pdfCtaDesc": "Sagen Sie uns, wann und wohin. Wir gestalten Ihre Reise."
  },
  "fr": {
    "pdfServicesNav": "Services",
    "pdfWhyNav": "Pourquoi nous",
    "pdfContactNav": "Contact",
    "pdfBookTour": "Réserver un circuit",
    "pdfExploreDest": "Explorer les destinations",
    "pdfSearchTours": "Rechercher",
    "pdfWhereNext": "Où irez-vous ensuite ?",
    "pdfStartPlanning": "Planifier",
    "pdfCtaTitle": "Votre prochain lever de soleil vous attend.",
    "pdfCtaDesc": "Dites-nous où et quand. Nous préparerons votre voyage."
  },
  "ru": {
    "pdfServicesNav": "Услуги",
    "pdfWhyNav": "Почему мы",
    "pdfContactNav": "Контакты",
    "pdfBookTour": "Запросить тур",
    "pdfExploreDest": "Направления",
    "pdfSearchTours": "Найти туры",
    "pdfWhereNext": "Куда отправимся дальше?",
    "pdfStartPlanning": "Планировать",
    "pdfCtaTitle": "Ваш следующий рассвет ждёт вас.",
    "pdfCtaDesc": "Расскажите куда и когда, мы составим план поездки."
  },
  "ko": {
    "pdfServicesNav": "서비스",
    "pdfWhyNav": "선택 이유",
    "pdfContactNav": "연락처",
    "pdfBookTour": "투어 문의",
    "pdfExploreDest": "여행지 보기",
    "pdfSearchTours": "투어 검색",
    "pdfWhereNext": "다음 여행지는 어디인가요?",
    "pdfStartPlanning": "여행 계획하기",
    "pdfCtaTitle": "다음 일출이 기다리고 있습니다.",
    "pdfCtaDesc": "언제 어디로 가실지 알려주시면 맞춤 계획을 세워드립니다."
  }
};
for(const [lang,labels] of Object.entries(PDF_HOMEPAGE_LABELS)) Object.assign(DEFAULT_CONTENT.translations[lang], labels);

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
// V4.3: strings previously hardcoded in the page are now editable and translatable.
const EXTRA_PAGE_LABELS={
  aiPreviewSub:'Explore • Discover • Enjoy',
  aiPreviewWelcome:'Ayubowan! 👋 Welcome to Sri Lanka. What would you love to discover today?',
  aiPreviewQuestion:'Tell me something magical about Sigiriya ✨',
  aiPreviewAnswer:'High above the jungle rises a 5th-century rock fortress — a place of royal gardens, art and incredible views...',
  journeyPhoneKicker:'YOUR JOURNEY STARTS HERE',
  journeyPhoneTitle:'Hello,<br>Sri Lanka.',
  journeyPhoneSub:'✦ Your personal guide awaits',
  journeyPhoneButton:'Start my tour ↗',
  enquiryPhoneLabel:'WhatsApp / phone (optional)',
  enquiryPrivacyNotice:'Your enquiry details may be stored securely for trip follow-up when our booking system is connected. Please do not include sensitive identity or payment information.',
  aiInputPlaceholder:'Ask about Sri Lanka...',
  enquiryMessagePlaceholder:'Tell us about your dream trip...'
};
for(const [key,value] of Object.entries(EXTRA_PAGE_LABELS)){
  if(!DEFAULT_CONTENT.translations.en[key])DEFAULT_CONTENT.translations.en[key]=value;
}
// V4.7: customer contact choices remain editable under Texts & Translations.
const ENQUIRY_V47_LABELS={
 en:{contactChannelPrompt:'Choose how to contact Busan Lanka',contactOpenChat:'Open chat',contactCopyChoice:'Copy enquiry',contactNoChannel:'No channels configured'},
 si:{contactChannelPrompt:'සම්බන්ධ විය යුතු ආකාරය තෝරන්න',contactOpenChat:'Chat විවෘත කරන්න',contactCopyChoice:'විමසීම පිටපත් කරන්න',contactNoChannel:'සම්බන්ධතා ගිණුම් සකසා නැත'},
 de:{contactChannelPrompt:'Wie möchten Sie Busan Lanka kontaktieren?',contactOpenChat:'Chat öffnen',contactCopyChoice:'Anfrage kopieren',contactNoChannel:'Keine Kontakte eingerichtet'},
 fr:{contactChannelPrompt:'Comment contacter Busan Lanka ?',contactOpenChat:'Ouvrir le chat',contactCopyChoice:'Copier la demande',contactNoChannel:'Aucun canal configuré'},
 ru:{contactChannelPrompt:'Как связаться с Busan Lanka?',contactOpenChat:'Открыть чат',contactCopyChoice:'Копировать запрос',contactNoChannel:'Каналы не настроены'},
 ko:{contactChannelPrompt:'Busan Lanka에 문의할 방법을 선택하세요',contactOpenChat:'채팅 열기',contactCopyChoice:'문의 복사',contactNoChannel:'연락처가 설정되지 않았습니다'}
};
for(const [language,labels] of Object.entries(ENQUIRY_V47_LABELS))Object.assign(DEFAULT_CONTENT.translations[language],labels);
export const supabaseEnabled=Boolean(SUPABASE.url&&SUPABASE.anonKey);
const STORE_KEY='busan-lanka-cms-v2-demo'; // Keep key to preserve existing v2 local edits
const normalize = content => {
  if(!content || typeof content!=='object') return copy(DEFAULT_CONTENT);
  const result={...copy(DEFAULT_CONTENT),...content};
  for(const k of ['settings','slides','destinations','packages','galleries','reviews','stories','zones','translations']) if(!result[k]) result[k]=copy(DEFAULT_CONTENT[k]);
  result.settings={...copy(DEFAULT_CONTENT.settings),...result.settings};
  // Migrate only untouched V3 sample hero/destination copy to the client-approved PDF design.
  // Preserve any custom content that differs from the original demo seed.
  if(Array.isArray(result.slides)&&result.slides[0]){
    const first=result.slides[0];
    const oldHeroTitles=[
      'Discover the <em>wonders</em><br>of Sri Lanka.',
      'Find your <em>wonder</em><br />in Sri Lanka.',
      'Find your <em>wonder</em><br>in Sri Lanka.'
    ];
    if(oldHeroTitles.includes(first.title) && !Object.keys(first.translations||{}).length){
      result.slides[0]={...first,...copy(DEFAULT_CONTENT.slides[0]),translations:first.translations||{}};
    }
  }
  const originalTags={sigiriya:'Ancient wonder',kandy:'Culture & heritage',mirissa:'Coastal escape'};
  for(const dest of result.destinations||[]){
    const wanted=DEFAULT_CONTENT.destinations.find(d=>d.id===dest.id);
    if(wanted && dest.tag===originalTags[dest.id] && !Object.keys(dest.translations||{}).length){
      dest.tag=wanted.tag;dest.description=wanted.description;
      if(dest.id==='mirissa') dest.name=wanted.name;
      if(dest.id==='sigiriya') dest.image=wanted.image;
    }
  }
  result.version=Math.max(5,Number(result.version)||0);

  // Keep new UI translation keys editable when older CMS content is loaded.
  const previousTranslations=result.translations||{};
  result.translations={...copy(DEFAULT_CONTENT.translations),...Object.fromEntries(Object.entries(previousTranslations).map(([lang,values])=>[lang,{...(DEFAULT_CONTENT.translations[lang]||{}),...(values||{})}]))};
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
 const saved=await res.json();
 if(!Array.isArray(saved) || saved.length!==1)throw new Error('Content was not published. Confirm the site_content main row exists and this user is allowed in cms_admins/RLS.');
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
 if(!supabaseEnabled) return localEnquiries();
 const s=await authSession();if(!s)throw new Error('Please sign in again.');
 const res=await fetch(`${base()}/rest/v1/tour_enquiries?select=id,name,email,phone,travel_days,travel_month,tour_id,message,locale,status,preferred_channel,source,created_at&order=created_at.desc&limit=100`,{headers:{apikey:SUPABASE.anonKey,Authorization:`Bearer ${s.access_token}`}});
 if(!res.ok)throw new Error(`Cannot read enquiries (${res.status}): ${await res.text()}`);
 return res.json();
}
export async function updateEnquiryStatus(id,status){
 if(!supabaseEnabled)return updateLocalEnquiry(id,status);
 if(!['new','contacted','closed'].includes(status))throw new Error('Invalid status');
 const s=await authSession();if(!s)throw new Error('Please sign in again.');
 const res=await fetch(`${base()}/rest/v1/tour_enquiries?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{apikey:SUPABASE.anonKey,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({status})});
 if(!res.ok)throw new Error(`Cannot update enquiry (${res.status}): ${await res.text()}`);
 const rows=await res.json();if(!rows.length)throw new Error('Enquiry not found or access denied');
 return rows[0];
}
