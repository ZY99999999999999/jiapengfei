// 蒙古族纹样平台 - 轻量 HTTP 服务器（Node.js，无需任何依赖）
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2]) || 8766;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SVG_DIR = path.join(ROOT, 'wenyang_svg');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.wasm': 'application/wasm',
};

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
for (const category of ['geo', 'rel', 'bio']) {
  fs.mkdirSync(path.join(SVG_DIR, category), { recursive: true });
}

const server = http.createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ========== API 路由：数据读写 ==========
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // GET /api/patterns — 返回三类纹样 SVG 文件列表，供“指尖纹韵”读取。
  if (req.method === 'GET' && urlPath === '/api/patterns') {
    const result = {};
    for (const category of ['geo', 'rel', 'bio']) {
      const categoryDir = path.join(SVG_DIR, category);
      result[category] = fs.readdirSync(categoryDir)
        .filter(filename => filename.toLowerCase().endsWith('.svg'))
        .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result));
    return;
  }

  // GET /api/data/:filename  — 读取 JSON 数据
  if (req.method === 'GET' && urlPath.startsWith('/api/data/')) {
    const filename = path.basename(urlPath);
    if (!filename.endsWith('.json')) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Only .json files allowed' }));
      return;
    }
    const filePath = path.join(DATA_DIR, filename);
    if (!filePath.startsWith(DATA_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end('{}');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // POST /api/data/:filename  — 写入 JSON 数据
  if (req.method === 'POST' && urlPath.startsWith('/api/data/')) {
    const filename = path.basename(urlPath);
    if (!filename.endsWith('.json')) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Only .json files allowed' }));
      return;
    }
    const filePath = path.join(DATA_DIR, filename);
    if (!filePath.startsWith(DATA_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        JSON.parse(body); // 验证是合法 JSON
        fs.writeFile(filePath, body, 'utf8', (err) => {
          if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Write failed' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true }));
        });
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // ========== 静态文件服务 ==========
  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  filePath = path.join(ROOT, filePath);

  // 安全检查：防止目录穿越
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404);res.end('Not Found');return;}
    const headers={'Content-Type':MIME[path.extname(filePath).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    let start=0,end=stat.size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
      if(!match[1])start=Math.max(0,stat.size-Number(match[2]));
      else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length']=Math.max(0,end-start+1);
    res.writeHead(status,headers);
    if(req.method==='HEAD'||stat.size===0){res.end();return;}
    const stream=fs.createReadStream(filePath,{start,end});
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✨ 蒙古族纹样交互设计平台');
  console.log('  ─────────────────────────────────');
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log('');
  console.log('  按 Ctrl+C 停止服务器');
  console.log('');
});
