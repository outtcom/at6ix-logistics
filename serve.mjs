// serve.mjs — zero-dependency static file server
import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml; charset=utf-8',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.ogg':  'video/ogg',
};

const COMPRESSIBLE = new Set(['text/html; charset=utf-8', 'text/css; charset=utf-8', 'application/javascript; charset=utf-8', 'application/json; charset=utf-8', 'image/svg+xml; charset=utf-8', 'text/plain; charset=utf-8']);

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.resolve(__dirname, '.' + urlPath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const withHtml = filePath + '.html';
      fs.stat(withHtml, (err2, stat2) => {
        if (err2 || !stat2.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: ' + urlPath);
          return;
        }
        serveFile(withHtml, stat2, res, req);
      });
      return;
    }
    serveFile(filePath, stat, res, req);
  });
});

function serveFile(filePath, stat, res, req) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isAsset = filePath.includes(path.sep + 'assets' + path.sep);
  const cacheControl = isAsset ? 'public, max-age=31536000, immutable' : 'no-cache';
  const fileSize = stat.size;

  // Handle HTTP Range requests for video/audio (required for seek support)
  const rangeHeader = req.headers.range;
  if (rangeHeader && (contentType.startsWith('video/') || contentType.startsWith('audio/'))) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`,
        'Content-Type': contentType,
      });
      res.end();
      return;
    }

    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges':  'bytes',
      'Content-Length': chunkSize,
      'Content-Type':   contentType,
      'Cache-Control':  cacheControl,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  // Non-range: serve full file
  // For video files stream directly (skip gzip)
  if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
    res.writeHead(200, {
      'Content-Type':   contentType,
      'Content-Length': fileSize,
      'Accept-Ranges':  'bytes',
      'Cache-Control':  cacheControl,
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (COMPRESSIBLE.has(contentType) && acceptEncoding.includes('gzip')) {
      zlib.gzip(data, (gzErr, compressed) => {
        if (gzErr) {
          res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': data.length, 'Cache-Control': cacheControl });
          res.end(data);
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType, 'Content-Encoding': 'gzip', 'Content-Length': compressed.length, 'Cache-Control': cacheControl });
        res.end(compressed);
      });
    } else {
      res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': data.length, 'Cache-Control': cacheControl });
      res.end(data);
    }
  });
}

server.listen(PORT, () => {
  console.log(`AT6ix Logistics dev server → http://localhost:${PORT}`);
  console.log(`Serving: ${__dirname}`);
  console.log('Ctrl+C to stop.');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Stop the existing server first.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
