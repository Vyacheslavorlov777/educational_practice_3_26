const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { openDatabase, seedIfEmpty } = require('./db');
const { getAllPartners, getPartnerById, createPartner, updatePartner } = require('./partnerService');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const db = openDatabase();
seedIfEmpty(db);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const partnerIdMatch = req.url.match(/^\/api\/partners\/(\d+)$/);

  if (req.url === '/api/partners' && req.method === 'GET') {
    try {
      sendJson(res, 200, getAllPartners(db));
    } catch (error) {
      sendJson(res, 500, { error: 'Не удалось получить список партнеров' });
    }
    return;
  }

  if (req.url === '/api/partners' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      sendJson(res, 201, createPartner(db, data));
    } catch (error) {
      sendJson(res, 500, { error: 'Не удалось создать партнера' });
    }
    return;
  }

  if (partnerIdMatch && req.method === 'GET') {
    const partner = getPartnerById(db, Number(partnerIdMatch[1]));
    if (!partner) {
      sendJson(res, 404, { error: 'Партнер не найден' });
      return;
    }
    sendJson(res, 200, partner);
    return;
  }

  if (partnerIdMatch && req.method === 'PUT') {
    try {
      const data = await readJsonBody(req);
      const partner = updatePartner(db, Number(partnerIdMatch[1]), data);
      if (!partner) {
        sendJson(res, 404, { error: 'Партнер не найден' });
        return;
      }
      sendJson(res, 200, partner);
    } catch (error) {
      sendJson(res, 500, { error: 'Не удалось обновить партнера' });
    }
    return;
  }

  const requestedPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  serveStaticFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`CRUD-интеграция запущена: http://localhost:${PORT}`);
});
