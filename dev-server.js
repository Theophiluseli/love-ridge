const { spawn } = require('child_process');
const http = require('http');

console.log('[Loveridge Server] Initializing Next.js multi-port listening engine...');

// 1. Launch Next.js on port 3000
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next process:', err);
});

// 2. Start reverse proxy listeners on ports 3001 and 3002
[3001, 3002].forEach((port) => {
  const server = http.createServer((req, res) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="refresh" content="2">
            <title>Loveridge Platform Initializing...</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 400px; }
              .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #065f46; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
              @keyframes spin { to { transform: rotate(360deg); } }
              h2 { color: #0f172a; margin: 0 0 10px; font-size: 20px; }
              p { color: #64748b; font-size: 14px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <h2>Loveridge System Starting</h2>
              <p>Connecting server engine on port 3000...</p>
            </div>
          </body>
        </html>
      `);
    });

    req.pipe(proxyReq, { end: true });
  });

  // Handle WebSocket upgrade for Next.js HMR
  server.on('upgrade', (req, socket, head) => {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: req.url,
      method: req.method,
      headers: req.headers,
    });

    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
      socket.write(
        `HTTP/1.1 101 Switching Protocols\r\n` +
          Object.keys(proxyRes.headers)
            .map((h) => `${h}: ${proxyRes.headers[h]}`)
            .join('\r\n') +
          '\r\n\r\n'
      );
      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });

    proxyReq.on('error', () => {
      socket.destroy();
    });

    proxyReq.end();
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[Multi-Port Listener] Active on http://localhost:${port} -> forwarding to http://localhost:3000`);
  });
});
