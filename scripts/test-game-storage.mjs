import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';
nextEnv.loadEnvConfig(process.cwd());
const origin = 'http://127.0.0.1:4317';
const password = readFileSync('.skye-admin-credentials.txt','utf8').match(/^Password: (.+)$/m)?.[1];
const sql = neon(process.env.DATABASE_URL);
let id; let cookie;
async function call(path, method = 'GET', body, authenticated = false, requestOrigin = origin) {
  return fetch(origin + path, { method, headers: { 'Content-Type':'application/json', Origin: requestOrigin, ...(authenticated && cookie ? {Cookie:cookie} : {}) }, ...(body ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(20000) });
}
const config = {spaces:Array.from({length:25},(_,i)=>({title:`Test ${i}`,content:'Temporary storage verification.'})),options:[{label:'One',weight:1},{label:'Two',weight:3}]};
try {
  assert.equal((await call('/api/games','POST',{name:'Unauthorized',config})).status,401);
  assert.equal((await call('/api/admin/session','POST',{password:'incorrect-test-password'})).status,401);
  const login=await call('/api/admin/session','POST',{password}); assert.equal(login.status,200);
  const setCookie=login.headers.get('set-cookie'); assert(setCookie.includes('HttpOnly')); assert(setCookie.includes('SameSite=strict')); cookie=setCookie.split(';')[0];
  assert.equal((await (await call('/api/admin/session','GET',null,true)).json()).admin,true);
  assert.equal((await call('/api/games','POST',{name:'Cross origin',config},true,'https://untrusted.invalid')).status,403);
  assert.equal((await call('/api/games','POST',{name:'Invalid',config:{...config,options:[{label:'Bad',weight:0}]}},true)).status,400);
  const create=await call('/api/games','POST',{name:'Temporary storage verification',config},true); assert.equal(create.status,201); const saved=(await create.json()).game; id=saved.id; assert.equal(saved.version,1);
  const fromNewVisitor=(await (await call('/api/games')).json()).games.find(game=>game.id===id); assert.deepEqual(fromNewVisitor.config,config);
  assert.equal((await call(`/api/games/${id}`,'PUT',{name:'Visitor overwrite',config,version:1})).status,401);
  const updatedConfig=structuredClone(config); updatedConfig.spaces[2].content='Persisted instruction';
  const update=await call(`/api/games/${id}`,'PUT',{name:'Temporary storage verification',config:updatedConfig,version:1},true); assert.equal(update.status,200);assert.equal((await update.json()).game.version,2);
  assert.equal((await call(`/api/games/${id}`,'PUT',{name:'Stale overwrite',config,version:1},true)).status,409);
  const reloaded=(await (await call('/api/games')).json()).games.find(game=>game.id===id);assert.equal(reloaded.config.spaces[2].content,'Persisted instruction');
  assert.equal((await call('/api/admin/session','DELETE',null,true)).status,200);
  assert.equal((await call(`/api/games/${id}`,'PUT',{name:'Expired login',config,version:2},true)).status,401);
  console.log('PASS: login, HttpOnly session, visitor write rejection, same-origin protection, input validation, Neon save/reload/update, version conflict, logout revocation.');
} catch (error) { console.error('FAIL:',error instanceof assert.AssertionError ? error.message : 'Storage test request failed.');process.exitCode=1; }
finally {
  if(cookie) await call('/api/admin/session','DELETE',null,true).catch(()=>{});
  if(id) await sql`DELETE FROM skye_game_presets WHERE id = ${id}::uuid`;
  console.log('Temporary test game removed.');
}
