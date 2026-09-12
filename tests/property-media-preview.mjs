// Local static-output QA only. No production server/API or dependency change.
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
const root=await realpath(path.resolve(import.meta.dirname,'../out'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.mp4':'video/mp4','.wav':'audio/wav','.glb':'model/gltf-binary','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(path.relative(root,file).startsWith('..')){res.writeHead(403);res.end();return;}
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    file=await realpath(file);
    if(path.relative(root,file).startsWith('..')){res.writeHead(403);res.end();return;}
    const size=(await stat(file)).size;
    let start=0,end=size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2])){res.writeHead(416);res.end();return;}
      start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
      end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
      if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
      status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);
    }
    res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':end-start+1,'Accept-Ranges':'bytes','Cache-Control':'no-store'});
    if(req.method==='HEAD'){res.end();return;}
    const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }catch{if(!res.headersSent)res.writeHead(404);res.end();}
});
server.listen(Number(process.env.PM_PREVIEW_PORT||4197),'127.0.0.1',()=>console.log(`Static QA: http://127.0.0.1:${server.address().port}/property-media/`));
