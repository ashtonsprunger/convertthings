const path = require('path');
const fs = require('fs');

/**
 * Webpack Dev Server custom middleware for local development (npm start)
 * Bypasses the connect-history-api-fallback "dot rule" for clean conversion URLs
 * containing decimal values (e.g. /convert/0.5-m-to-ft, /convert/10.5-km-to-mi).
 */
module.exports = function (app) {
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    // Skip static assets, bundle files, and API endpoints
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/static') ||
      req.path.endsWith('.js') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.svg') ||
      req.path.endsWith('.ico') ||
      req.path.endsWith('.json') ||
      req.path.endsWith('.txt')
    ) {
      return next();
    }

    // Rewrite /convert/* routes and direct category routes to index.html
    if (req.path.startsWith('/convert/') || /^\/[a-z_]+$/.test(req.path)) {
      const publicIndex = path.resolve(__dirname, '../public/index.html');
      if (fs.existsSync(publicIndex)) {
        return res.sendFile(publicIndex);
      }
    }
    next();
  });
};
