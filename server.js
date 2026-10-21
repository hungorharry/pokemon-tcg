const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'snorlax-munchlax-investment-research');
const CARDS_JSON_PATH = path.join(PUBLIC_DIR, 'data', 'cards.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

const { createMarket } = require('./ebay-market');
const market = createMarket();
const { createResearchService, loadResearch } = require('./graded-research');
const research = createResearchService();

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: GET /api/cards
  if (reqPath === '/api/cards') {
    fs.readFile(CARDS_JSON_PATH, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Cannot read cards dataset' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      const saved = loadResearch().records;
      res.end(JSON.stringify(JSON.parse(data).map(card => ({ ...card, psa_research: saved[card.id] || null }))));
    });
    return;
  }

  if (reqPath === '/api/psa/research') {
    const query = new URL(req.url, 'http://localhost').searchParams;
    const card = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8')).find(c => c.id === query.get('cardId'));
    if (!card) { res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ error: 'Không tìm thấy thẻ.' })); return; }
    research.get(card, query.get('refresh') === '1').then(data => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(data));
    }).catch(() => { res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ error: 'Chưa lấy được dữ liệu nguồn.' })); });
    return;
  }
  if (reqPath === '/api/ebay/status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ configured: market.configured(), marketplace: 'EBAY_US' }));
    return;
  }
  if (reqPath === '/api/ebay/listings') {
    const id = new URL(req.url, 'http://localhost').searchParams.get('cardId');
    const card = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8')).find(c => c.id === id);
    if (!card) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Không tìm thấy thẻ.' })); return;
    }
    market.search(card).then(data => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(data));
    }).catch(err => {
      res.writeHead(err.status || 502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ code: err.code || 'EBAY_UNAVAILABLE', error: err.status ? err.message : 'Kết nối eBay bị gián đoạn. Vui lòng thử lại.' }));
    }); return;
  }
  if (reqPath === '/api/scan-prices') {
    res.writeHead(410, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Chọn một thẻ để tìm tin rao qua /api/ebay/listings.' })); return;
  }

  // API Endpoint: GET /api/qa-report (Rules v2 Image QA Report)
  if (reqPath === '/api/qa-report') {
    const qaPath = path.join(PUBLIC_DIR, 'data', 'image-qa-report.json');
    if (fs.existsSync(qaPath)) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(fs.readFileSync(qaPath, 'utf-8'));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'QA Report not found' }));
    }
    return;
  }

  // API Endpoint: GET /api/review-queue (Rules v2 Image Review Queue)
  if (reqPath === '/api/review-queue') {
    const queuePath = path.join(PUBLIC_DIR, 'data', 'image-review-queue.json');
    if (fs.existsSync(queuePath)) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(fs.readFileSync(queuePath, 'utf-8'));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Review queue not found' }));
    }
    return;
  }

  // API Endpoint: GET /api/psa-cert?cert=12345678 (PSA Official Cert Verifier)
  if (reqPath === '/api/psa-cert') {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const certNum = urlObj.searchParams.get('cert') || '48291048';
    
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      certNumber: certNum,
      gradingCompany: "PSA (Professional Sports Authenticator)",
      verificationUrl: `https://www.psacard.com/cert/${certNum}`,
      imageFrontCandidate: `https://cert-images.psa.com/${certNum}/large/${certNum}_f.jpg`,
      imageBackCandidate: `https://cert-images.psa.com/${certNum}/large/${certNum}_b.jpg`,
      note: "Hồ sơ xác minh gốc tại psacard.com/cert; ảnh phụ thuộc chứng thư số thực tế của PSA"
    }));
    return;
  }

  // Static File Serving
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Snorlax & Munchlax Mega Graded Card Dashboard`);
  console.log(`🏠 Local URL:   http://localhost:${PORT}`);
  console.log(`🌐 LAN / Wi-Fi: http://192.168.245.101:${PORT}`);
  console.log(`eBay Browse: ${market.configured() ? 'Configured' : 'Not configured - Production credentials required'}`);
  console.log(`=======================================================`);
});
