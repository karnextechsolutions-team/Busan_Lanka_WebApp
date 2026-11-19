export type JsonObject = Record<string, unknown>;
// Only concrete, verified hosts are allowed. Add any later custom domain through
// BUSAN_ALLOWED_ORIGINS (comma-separated, without trailing slashes).
const localOrigins = [
 'http://localhost:8080',
 'http://127.0.0.1:8080',
 'https://tranquil-marshmallow-7cd3a4.netlify.app', // currently deployed preview host
];
export function checkOrigin(request: Request): string | null {
 const origin = request.headers.get('origin');
 const configured = (Deno.env.get('BUSAN_ALLOWED_ORIGINS') || '').split(',')
  .map(value => value.trim().replace(/\/$/, '')).filter(Boolean);
 const allowed = [...new Set([...configured, ...localOrigins])];
 if (!origin) return allowed[0] || null;
 return allowed.includes(origin) ? origin : null;
}
export function response(origin: string, status: number, body: JsonObject): Response {
 return new Response(JSON.stringify(body), { status, headers: {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'apikey, authorization, content-type, x-client-info, x-retry-count, traceparent, tracestate, baggage','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'} });
}
export function preflight(request: Request): Response | null {
 const origin = checkOrigin(request);
 if (!origin) return new Response('Forbidden origin or BUSAN_ALLOWED_ORIGINS not configured', { status: 403 });
 if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'apikey, authorization, content-type, x-client-info, x-retry-count, traceparent, tracestate, baggage','Vary':'Origin'}});
 if (request.method !== 'POST') return response(origin, 405, { error: 'Method not allowed' });
 if (!request.headers.get('apikey')) return response(origin, 401, { error: 'Missing public API key' });
 return null;
}
export async function parseBody(request: Request): Promise<JsonObject | null> {
 const size = Number(request.headers.get('content-length') || 0);if(size > 12_000)return null;
 try{const data:unknown=await request.json();return data&&typeof data==='object'&&!Array.isArray(data)?data as JsonObject:null;}catch{return null;}
}
export function serviceCredentials():{url:string;key:string}|null{
 const url=Deno.env.get('SUPABASE_URL');
 let currentSecret='';
 try{currentSecret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}')?.default||'';}catch{}
 // 2026 projects favor sb_secret_ keys; older projects may still use service_role JWTs.
 const key=currentSecret||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
 return url&&key?{url,key}:null;
}
export function serviceHeaders(credentials:{key:string}):Record<string,string>{
 // New sb_secret_ keys must NOT be used in Authorization: Bearer.
 return credentials.key.startsWith('sb_secret_')
  ?{apikey:credentials.key,'Content-Type':'application/json'}
  :{apikey:credentials.key,Authorization:`Bearer ${credentials.key}`,'Content-Type':'application/json'};
}
export async function quota(request:Request,bucket:string,limit:number,windowSeconds:number):Promise<boolean>{
 const credentials=serviceCredentials();const salt=Deno.env.get('BUSAN_RATE_LIMIT_SALT');if(!credentials||!salt)return false;
 const ip=(request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]||'unknown').trim().slice(0,96);
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${salt}:${ip}`));
 const fingerprint=bucket.includes('global')?'all-visitors':[...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('');
 const res=await fetch(`${credentials.url}/rest/v1/rpc/consume_api_quota`,{method:'POST',headers:serviceHeaders(credentials),body:JSON.stringify({p_bucket:bucket,p_fingerprint:fingerprint,p_limit:limit,p_window_seconds:windowSeconds})});
 if(!res.ok)return false;
 return await res.json()===true;
}
