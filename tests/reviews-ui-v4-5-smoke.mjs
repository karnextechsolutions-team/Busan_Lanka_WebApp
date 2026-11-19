import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
// Checking as .mjs avoids Node's ambiguous .js module detection.
const tmp=mkdtempSync(join(tmpdir(),'busan-v45-'));
try{
 for(const name of ['admin.js','guest-reviews.js','reviews-service.js','app.js','pdf-home-v4.js','content-store.js','ai-service.js','data.js']){
  const output=join(tmp,name.replace(/\.js$/,'.mjs'));
  writeFileSync(output,readFileSync(new URL('../'+name,import.meta.url)));
  const result=spawnSync(process.execPath,['--check',output],{encoding:'utf8'});
  assert.equal(result.status,0,`${name} is invalid syntax: ${result.stderr}`);
 }
}finally{rmSync(tmp,{recursive:true,force:true})}
const reviewSource=readFileSync(new URL('../guest-reviews.js',import.meta.url),'utf8');
const helpers=reviewSource.slice(reviewSource.indexOf('const REVIEW_EXPAND_LABELS='),reviewSource.indexOf('\nlet reviewCarouselTimer='));
assert(helpers.includes('created_at'),'relative submission date must use created_at');
const document={documentElement:{lang:'en'}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const functions=new Function('document','flagFor','countryLabel','esc','monthLabel',helpers+'\nreturn {reviewCard,relativeReviewTime}')(document,()=> '🇬🇧',()=> 'United Kingdom',esc,()=> 'Oct 2026');
const now=Date.UTC(2026,10,19,12);
assert.equal(functions.relativeReviewTime(new Date(now-14*86400000).toISOString(),now),'2 weeks ago');
assert.equal(functions.relativeReviewTime(new Date(now-2*86400000).toISOString(),now),'2 days ago');
assert.equal(functions.relativeReviewTime(new Date(now-2*3600000).toISOString(),now),'2 hours ago');
assert.equal(functions.relativeReviewTime('',now),'');
let text='A wonderful day '.repeat(75);
const row={name:'Review Guest',country_code:'GB',rating:5,title:'Brilliant',review_text:text,visited_month:'2026-10-01',trip_type:'Friends',created_at:new Date(Date.now()-14*86400000).toISOString()};
const card=functions.reviewCard(row,0);
assert(card.includes('2 weeks ago'),'Expected relative review submission age');
assert(card.includes('is-collapsed'),'Expected long review collapsed');
assert(card.includes('Read more'),'Expected Read more button');
assert(card.includes('aria-expanded="false"'),'Expected accessible expand state');
assert(card.includes('Date visited'),'Date visited should remain separate');
const legacy=functions.reviewCard({...row,created_at:undefined},1);
assert(!legacy.includes('ago</time>'),'Legacy reviews without created_at should not fabricate submission date');
console.log('PASS V4.5: admin and review module syntax, relative posted dates, compact review/read-more markup');
