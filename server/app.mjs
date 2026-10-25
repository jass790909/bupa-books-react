import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const UPSTREAM = 'https://digitalcodingtest.bupa.com.au/api/v1/bookowners';
export function createApp(fetcher=fetch) {
 const app=express(); app.disable('x-powered-by');
 app.use((_req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','strict-origin-when-cross-origin');next();});
 app.get('/api/bookowners',async(_req,res)=>{
   res.set('Cache-Control','no-store');
   try{
    const upstream=await fetcher(UPSTREAM,{signal:AbortSignal.timeout(10000),headers:{Accept:'application/json'}});
    if(!upstream.ok)throw new Error('Upstream HTTP failure');
    if(!upstream.headers.get('content-type')?.includes('application/json'))throw new Error('Invalid content type');
    // Cap memory usage; never forward upstream cookies, headers or error details.
    const reader=upstream.body.getReader(); let bytes=0; const chunks=[];
    try {while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>2*1024*1024)throw new Error('Payload too large');chunks.push(value);}}finally{await reader.cancel();}
    const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if(!Array.isArray(data))throw new Error('Unexpected payload');
    res.json(data);
   }catch{res.status(502).json({error:'The book service is temporarily unavailable.'});}
 });
 app.use('/api',(_req,res)=>res.status(404).json({error:'Not found'}));
 const dist=fileURLToPath(new URL('../dist',import.meta.url));
 app.use(express.static(dist));
 app.get('/',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
 return app;
}
