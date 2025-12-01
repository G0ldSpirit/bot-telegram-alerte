import axios from 'axios';

/**
 * Service pour interagir avec l'API Polymarket
 */
class PolymarketService {
  constructor() {
    this.apiUrl = 'https://api.polymarket.com/events?active=true';
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheDuration = 60000; // 1 minute de cache
  }

  /**
   * Recherche un marché contenant les mots-clés spécifiés
   * @param {string[]} keywords - Mots-clés à rechercher
   * @returns {Object|null} Le marché trouvé ou null
   */
  async findMarket(keywords = ['London', 'temperature']) {
    try {
      const events = await this.fetchEvents();

      // Rechercher le marché correspondant aux mots-clés
      const market = events.find(event => {
        const title = event.title?.toLowerCase() || '';
        const description = event.description?.toLowerCase() || '';
        const content = `${title} ${description}`;

        return keywords.every(keyword =>
          content.includes(keyword.toLowerCase())
        );
      });

      if (!market) {
        console.log('❌ Aucun marché trouvé avec les mots-clés:', keywords.join(', '));
        return null;
      }

      return this.formatMarket(market);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche du marché:', error.message);
      return null;
    }
  }

  /**
   * Récupère tous les événements actifs depuis l'API Polymarket
   * @returns {Array} Liste des événements
   */
  async fetchEvents() {
    // Utiliser le cache si disponible et valide
    if (this.cache && this.cacheTimestamp &&
        (Date.now() - this.cacheTimestamp < this.cacheDuration)) {
      return this.cache;
    }

    try {
      console.log('🔍 Récupération des marchés Polymarket...');
      const response = await axios.get(this.apiUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'PolymarketMonitor/1.0'
        }
      });

      this.cache = response.data || [];
      this.cacheTimestamp = Date.now();

      console.log(`✅ ${this.cache.length} marchés récupérés`);
      return this.cache;
    } catch (error) {
      console.error('❌ Erreur API Polymarket:', error.message);

      // Retourner le cache même périmé en cas d'erreur
      if (this.cache) {
        console.log('⚠️  Utilisation du cache périmé');
        return this.cache;
      }

      throw error;
    }
  }

  /**
   * Formate les données du marché pour un usage simplifié
   * @param {Object} market - Données brutes du marché
   * @returns {Object} Données formatées
   */
  formatMarket(market) {
    const options = [];

    // Extraire les options et leurs probabilités
    if (market.markets) {
      market.markets.forEach(m => {
        const probability = parseFloat(m.outcomePrices?.[0] || 0) * 100;
        options.push({
          name: m.question || m.groupItemTitle || 'Option',
          probability: parseFloat(probability.toFixed(2)),
          price: parseFloat(m.outcomePrices?.[0] || 0)
        });
      });
    }

    return {
      id: market.id,
      slug: market.slug,
      title: market.title,
      description: market.description,
      options: options,
      endDate: market.endDate,
      url: `https://polymarket.com/event/${market.slug}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Vérifie si une probabilité dépasse le seuil
   * @param {Object} market - Données du marché
   * @param {number} threshold - Seuil en pourcentage (par défaut 65)
   * @returns {Array} Options qui dépassent le seuil
   */
  checkThreshold(market, threshold = 65) {
    if (!market || !market.options) {
      return [];
    }

    return market.options.filter(option => option.probability > threshold);
  }

  /**
   * Invalide le cache
   */
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = null;
  }
}

export default new PolymarketService();
