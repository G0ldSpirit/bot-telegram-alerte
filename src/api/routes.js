import express from 'express';
import polymarket from '../services/polymarket.js';

const router = express.Router();

/**
 * Route: GET /api/odds
 * Retourne les probabilités actuelles du marché
 */
router.get('/odds', async (req, res) => {
  try {
    const keywords = (process.env.MARKET_KEYWORDS || 'London,temperature').split(',');
    const threshold = parseFloat(process.env.ALERT_THRESHOLD) || 65;

    // Rechercher le marché
    const market = await polymarket.findMarket(keywords);

    if (!market) {
      return res.status(404).json({
        error: 'Marché non trouvé',
        keywords: keywords
      });
    }

    // Ajouter l'indicateur de seuil pour chaque option
    const options = market.options.map(option => ({
      ...option,
      aboveThreshold: option.probability > threshold
    }));

    // Retourner les données
    res.json({
      title: market.title,
      description: market.description,
      options: options,
      threshold: threshold,
      url: market.url,
      timestamp: market.timestamp
    });
  } catch (error) {
    console.error('Erreur API /odds:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

/**
 * Route: GET /api/status
 * Retourne le statut du système
 */
router.get('/status', async (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    config: {
      threshold: parseFloat(process.env.ALERT_THRESHOLD) || 65,
      interval: parseInt(process.env.MONITOR_INTERVAL_MINUTES) || 5,
      keywords: (process.env.MARKET_KEYWORDS || 'London,temperature').split(',')
    }
  });
});

/**
 * Route: POST /api/clear-cache
 * Efface le cache Polymarket
 */
router.post('/clear-cache', (req, res) => {
  polymarket.clearCache();
  res.json({
    success: true,
    message: 'Cache effacé'
  });
});

export default router;
