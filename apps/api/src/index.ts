import express from 'express';
import { config } from './config';
import { corsMiddleware } from './middlewares/cors.middleware';
import { papersController } from './controllers/papers.controller';

const app = express();

// Middlewares globales
app.use(corsMiddleware);
app.use(express.json());

// Logger simple para desarrollo
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Rutas de la API
app.get('/api/health', (req, res) => papersController.getHealth(req, res));
app.get('/api/papers', (req, res) => papersController.getPaperList(req, res));
app.get('/api/papers/:id', (req, res) => papersController.getPaperById(req, res));

// Manejador 404
app.use((_req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Ruta no encontrada.',
  });
});

// Iniciar servidor
const port = config.port;
export const server = app.listen(port, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`===============================================`);
    console.log(`🚀 PaperPay API escuchando en http://localhost:${port}`);
    console.log(`📡 Red: stellar:testnet`);
    console.log(`🏛️ Tesorería: ${config.stellarTreasuryPublicKey}`);
    console.log(`⚡ Modo: ${config.selfSettle ? 'SELF_SETTLE' : 'FACILITATOR'}`);
    console.log(`===============================================`);
  }
});

export default app;
