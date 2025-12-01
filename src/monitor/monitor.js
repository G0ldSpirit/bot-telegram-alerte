import dotenv from 'dotenv';
import cron from 'node-cron';
import polymarket from '../services/polymarket.js';
import telegram from '../bot/telegram.js';

dotenv.config();

/**
 * Système de monitoring Polymarket
 */
class Monitor {
  constructor() {
    this.threshold = parseFloat(process.env.ALERT_THRESHOLD) || 65;
    this.keywords = (process.env.MARKET_KEYWORDS || 'London,temperature').split(',');
    this.interval = parseInt(process.env.MONITOR_INTERVAL_MINUTES) || 5;
    this.lastAlertTimestamp = {};
    this.alertCooldown = 30 * 60 * 1000; // 30 minutes entre les mêmes alertes
    this.cronJob = null;
  }

  /**
   * Démarre le monitoring
   * @param {boolean} runImmediately - Exécuter une vérification immédiatement
   */
  async start(runImmediately = true) {
    console.log('🚀 Démarrage du monitoring Polymarket');
    console.log(`   Seuil d'alerte: ${this.threshold}%`);
    console.log(`   Mots-clés: ${this.keywords.join(', ')}`);
    console.log(`   Intervalle: ${this.interval} minutes`);
    console.log('');

    // Initialiser le bot Telegram
    telegram.init();

    // Exécution immédiate si demandé
    if (runImmediately) {
      await this.check();
    }

    // Configurer le cron job
    this.scheduleCron();
  }

  /**
   * Configure le cron job pour l'exécution périodique
   */
  scheduleCron() {
    // Convertir l'intervalle en expression cron
    const cronExpression = `*/${this.interval} * * * *`;

    console.log(`⏰ Planification: toutes les ${this.interval} minutes`);
    console.log(`   Expression cron: ${cronExpression}`);
    console.log('');

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('⏰ Exécution planifiée du monitoring...');
      await this.check();
    });
  }

  /**
   * Effectue une vérification du marché
   */
  async check() {
    try {
      const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
      console.log(`🔍 [${timestamp}] Vérification en cours...`);

      // Rechercher le marché
      const market = await polymarket.findMarket(this.keywords);

      if (!market) {
        console.log('⚠️  Aucun marché trouvé');
        return null;
      }

      console.log(`✅ Marché trouvé: ${market.title}`);

      // Afficher les probabilités
      market.options.forEach(option => {
        const indicator = option.probability > this.threshold ? '🔥' : '  ';
        console.log(`${indicator} ${option.name}: ${option.probability.toFixed(2)}%`);
      });

      // Vérifier les seuils
      const alerts = polymarket.checkThreshold(market, this.threshold);

      if (alerts.length > 0) {
        console.log(`\n🚨 ${alerts.length} alerte(s) détectée(s)!`);

        // Vérifier le cooldown
        const shouldSendAlert = this.shouldSendAlert(market.id, alerts);

        if (shouldSendAlert) {
          await telegram.sendAlert(market, alerts, this.threshold);
          this.updateLastAlert(market.id, alerts);
        } else {
          console.log('⏸️  Alerte en cooldown, non envoyée');
        }
      } else {
        console.log('\n✅ Aucune alerte');
      }

      console.log('');
      return market;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error.message);
      return null;
    }
  }

  /**
   * Vérifie si une alerte doit être envoyée (cooldown)
   * @param {string} marketId - ID du marché
   * @param {Array} alerts - Alertes détectées
   * @returns {boolean} True si l'alerte doit être envoyée
   */
  shouldSendAlert(marketId, alerts) {
    const key = `${marketId}-${alerts.map(a => a.name).join('-')}`;
    const lastAlert = this.lastAlertTimestamp[key];

    if (!lastAlert) {
      return true;
    }

    const timeSinceLastAlert = Date.now() - lastAlert;
    return timeSinceLastAlert > this.alertCooldown;
  }

  /**
   * Met à jour le timestamp de la dernière alerte
   * @param {string} marketId - ID du marché
   * @param {Array} alerts - Alertes envoyées
   */
  updateLastAlert(marketId, alerts) {
    const key = `${marketId}-${alerts.map(a => a.name).join('-')}`;
    this.lastAlertTimestamp[key] = Date.now();
  }

  /**
   * Arrête le monitoring
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏹️  Monitoring arrêté');
    }
  }

  /**
   * Exécute une vérification manuelle unique
   */
  async runOnce() {
    console.log('🔍 Exécution unique du monitoring...\n');
    telegram.init();
    const market = await this.check();
    process.exit(market ? 0 : 1);
  }
}

// Exécution en mode standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new Monitor();

  // Gérer les arguments de ligne de commande
  const args = process.argv.slice(2);

  if (args.includes('--once')) {
    // Mode exécution unique
    monitor.runOnce();
  } else {
    // Mode continu
    monitor.start();

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n⏹️  Arrêt du monitoring...');
      monitor.stop();
      process.exit(0);
    });
  }
}

export default Monitor;
