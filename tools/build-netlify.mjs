/**
 * Safe static build for Netlify. Only explicitly selected public files go to dist/.
 * Supabase SQL, Edge Functions, README, tests, .env etc. never go to dist/.
 * Requires only Node 20+ built-ins; no npm install.
 */
import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
const publicFiles = [
  'index.html','admin.html',
  'styles.css','theme-v2.css','responsive-v3-2.css','admin.css',
  'app.js','admin.js','ai-service.js','content-store.js','data.js',
  'sw.js','manifest.webmanifest'
];
const publicDirs = ['assets'];

rmSync(out, {recursive:true, force:true});
mkdirSync(out, {recursive:true});
for (const file of publicFiles) {
  const src = join(root, file);
  if(!existsSync(src)) throw Error(`Missing public file: ${file}`);
  copyFileSync(src,join(out,file));
}
for(const dir of publicDirs){
  const src=join(root,dir);
  if(!existsSync(src)) throw Error(`Missing public assets directory: ${dir}`);
  cpSync(src,join(out,dir),{recursive:true});
}
const url=(process.env.PUBLIC_SUPABASE_URL||'').trim();
const key=(process.env.PUBLIC_SUPABASE_ANON_KEY||'').trim();
if(Boolean(url)!==Boolean(key)) throw Error('Set both PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in Netlify, or neither for preview/demo mode.');
if(url && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) throw Error('PUBLIC_SUPABASE_URL must be your exact https://PROJECT_REF.supabase.co project URL.');
if(key && !(key.startsWith('sb_publishable_') || /^[a-zA-Z0-9_-]{50,}$/.test(key))) throw Error('Expected a Supabase publishable or legacy anon key. Never use service-role/secret keys here.');
if(key && (key.startsWith('sb_secret_') || /service_role/i.test(key))) throw Error('Secret/service-role keys must never go in public config.');
writeFileSync(join(out,'supabase-config.js'),
  '// Browser-public Supabase URL and publishable key; never add privileged secrets.\n'+
  `export const SUPABASE = {url: ${JSON.stringify(url)}, anonKey: ${JSON.stringify(key)}};\n`
);
console.log(`Netlify static build completed: ${out}`);
console.log(`Supabase frontend: ${url ? 'configured (public key only)' : 'preview/demo mode'}`);
console.log(`Files in dist/: ${readdirSync(out).join(', ')}`);
