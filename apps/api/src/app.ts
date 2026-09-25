import express from 'express';
import { corsMiddleware } from './middlewares/cors.middleware';
import { papersController } from './controllers/papers.controller';

const app = express();
app.use(corsMiddleware);
app.use(express.json());
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => papersController.getHealth(req, res));
app.get('/api/papers', (req, res) => papersController.getPaperList(req, res));
app.get('/api/papers/:id', (req, res) => papersController.getPaperById(req, res));
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Ruta no encontrada.' });
});

export default app;
