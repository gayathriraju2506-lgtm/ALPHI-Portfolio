const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;
const AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';
const FALLBACK_NAV_FILE = path.join(rootDir, 'data', 'sample-nav.txt');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function proxyNav(res) {
  try {
    const response = await fetch(AMFI_NAV_URL, {
      headers: {
        'User-Agent': 'ALPHI-Portfolio/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`AMFI responded with status ${response.status}`);
    }

    const body = await response.text();

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(body);
  } catch (error) {
    fs.readFile(FALLBACK_NAV_FILE, 'utf8', (fileError, fallbackData) => {
      if (fileError) {
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: 'Unable to fetch NAV data from upstream.',
          details: error.message
        }));
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-NAV-Data-Source': 'fallback'
      });
      res.end(fallbackData);
    });
  }
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/api/nav') {
    proxyNav(res);
    return;
  }

  const sanitizedPath = path.normalize(req.url.split('?')[0]).replace(/^\/+/, '');
  const requestedPath = sanitizedPath === '' ? 'index.html' : sanitizedPath;
  const filePath = path.join(rootDir, requestedPath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  sendFile(filePath, res);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
