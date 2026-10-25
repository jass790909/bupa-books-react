// @vitest-environment node
import {it,expect} from 'vitest';
import {createApp,UPSTREAM} from '../../server/app.mjs';
async function run(fetcher,check){const server=createApp(fetcher).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));try{await check(`http://127.0.0.1:${server.address().port}`);}finally{await new Promise(r=>server.close(r));}}
it('proxies only the fixed endpoint and strips upstream cookies',()=>run(async(url)=>{expect(url).toBe(UPSTREAM);return new Response('[]',{headers:{'content-type':'application/json','set-cookie':'secret=yes'}});},async base=>{const r=await fetch(base+'/api/bookowners');expect(r.status).toBe(200);expect(await r.json()).toEqual([]);expect(r.headers.get('set-cookie')).toBeNull();expect((await fetch(base+'/api/other')).status).toBe(404);}));
it('returns a safe gateway error for upstream failures',()=>run(async()=>{throw new Error('private detail');},async base=>{const r=await fetch(base+'/api/bookowners');expect(r.status).toBe(502);expect(await r.text()).not.toContain('private detail');}));
