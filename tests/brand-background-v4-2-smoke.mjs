import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=get('index.html'),css=get('brand-background-v4-2.css'),sw=get('sw.js'),build=get('tools/build-netlify.mjs');
assert(html.includes('brand-background-v4-2.css'),'New stylesheet linked');
assert(css.includes('.pdf-destinations::before')&&css.includes('.ai-section::before'),'Background overlays included');
for(const f of ['assets/busan-logo-watercolor-v42.svg','assets/busan-logo-wave-v42.svg']){
 assert(existsSync(new URL('../'+f,import.meta.url)),`Missing ${f}`);
 assert(sw.includes(f.split('/')[1]),`Service worker missing ${f}`);
}
assert(build.includes('brand-background-v4-2.css'),'Netlify build excludes new CSS');
for(const hex of ['#1B673D','#E99E45','#FAD888','#F4566C','#CC0503','#F75703']) assert(css.includes(hex),`Exact palette missing ${hex}`);
assert(!html.includes('story-v3-5.js')&&!html.includes('story-scene'),'Removed old scroll animations');
console.log('PASS exact six logo colors, gradient backgrounds, SVG assets, Netlify and cache references');
