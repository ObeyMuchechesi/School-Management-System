const mongoose = require('mongoose');
const app = require('./deploy-app');

let connectionPromise;

function getExpressUrl(req) {
  const wildcardPath = req.query && req.query.path;
  if (!wildcardPath) return req.url;

  const path = Array.isArray(wildcardPath) ? wildcardPath.join('/') : String(wildcardPath);
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined && item !== null) query.append(key, String(item));
    }
  }

  const search = query.toString();
  return `/api/${path}${search ? `?${search}` : ''}`;
}

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error('MONGO_URI and JWT_SECRET must be configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
}

module.exports = async function handler(req, res) {
  try {
    await connectDatabase();
    req.url = getExpressUrl(req);
    app(req, res);
  } catch (error) {
    console.error('API initialization failed:', error.message);
    res.status(503).json({ message: 'API unavailable. Check the deployment configuration.' });
  }
};
