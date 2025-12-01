import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import apiRoutes from './api/routes.js';
import Monitor from './monitor/monitor.js';

// Configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Routes API
app.use('/api', apiRoutes);

// Route racine - Interface web
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   POLYMARKET TELEGRAM ALERT SYSTEM            ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Serveur web: http://localhost:${PORT}`);
  console.log(`📡 API:         http://localhost:${PORT}/api/odds`);
  console.log('');

  // Démarrer le monitoring
  const monitor = new Monitor();
  monitor.start();
});

export default app;
