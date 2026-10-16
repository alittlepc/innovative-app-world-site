import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import simulateHandler from './api/simulate.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Mount the serverless function handler directly
app.all('/api/simulate', async (req, res) => {
  try {
    await simulateHandler(req, res);
  } catch (err: any) {
    console.error('Server error handling /api/simulate:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error',
      });
    }
  }
});

// Mount Vite middleware for dev or static serving for production
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve('dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`IAW Settlement Rail running on http://0.0.0.0:${port}`);
});
