import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Service de notification Telegram
 */
class TelegramService {
  constructor() {
    this.token = process.env.TELEGRAM_TOKEN;
    this.chatId = process.env.CHAT_ID;
    this.bot = null;
    this.initialized = false;
  }

  /**
   * Initialise le bot Telegram
   */
  init() {
    if (!this.token) {
      console.warn('⚠️  TELEGRAM_TOKEN non défini. Les notifications ne seront pas envoyées.');
      return false;
    }

    if (!this.chatId) {
      console.warn('⚠️  CHAT_ID non défini. Les notifications ne seront pas envoyées.');
      return false;
    }

    try {
      this.bot = new TelegramBot(this.token, { polling: false });
      this.initialized = true;
      console.log('✅ Bot Telegram initialisé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du bot:', error.message);
      return false;
    }
  }

  /**
   * Envoie une alerte pour les options qui dépassent le seuil
   * @param {Object} market - Données du marché
   * @param {Array} alerts - Options qui dépassent le seuil
   * @param {number} threshold - Seuil utilisé
   */
  async sendAlert(market, alerts, threshold = 65) {
    if (!this.initialized) {
      console.log('⚠️  Bot non initialisé, alerte non envoyée');
      return false;
    }

    try {
      const message = this.formatAlertMessage(market, alerts, threshold);

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      console.log('✅ Alerte Telegram envoyée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'alerte:', error.message);
      return false;
    }
  }

  /**
   * Formate le message d'alerte en Markdown
   * @param {Object} market - Données du marché
   * @param {Array} alerts - Options qui dépassent le seuil
   * @param {number} threshold - Seuil utilisé
   * @returns {string} Message formaté
   */
  formatAlertMessage(market, alerts, threshold) {
    const emoji = '🚨';
    const lines = [
      `${emoji} *ALERTE POLYMARKET* ${emoji}`,
      '',
      `*Marché:* ${market.title}`,
      '',
      `*Probabilité(s) > ${threshold}%:*`
    ];

    // Ajouter les alertes
    alerts.forEach(alert => {
      const percentage = alert.probability.toFixed(2);
      lines.push(`  • *${alert.name}*: \`${percentage}%\``);
    });

    lines.push('');
    lines.push('*Toutes les options:*');

    // Ajouter toutes les options pour contexte
    market.options.forEach(option => {
      const percentage = option.probability.toFixed(2);
      const indicator = option.probability > threshold ? '🔥' : '  ';
      lines.push(`${indicator} ${option.name}: \`${percentage}%\``);
    });

    lines.push('');
    lines.push(`🔗 [Voir sur Polymarket](${market.url})`);
    lines.push('');
    lines.push(`⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`);

    return lines.join('\n');
  }

  /**
   * Envoie un message de test
   */
  async sendTestMessage() {
    if (!this.initialized) {
      console.log('⚠️  Bot non initialisé');
      return false;
    }

    try {
      const message = [
        '✅ *Test de connexion*',
        '',
        'Le bot Telegram est correctement configuré et opérationnel.',
        '',
        `⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`
      ].join('\n');

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown'
      });

      console.log('✅ Message de test envoyé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message de test:', error.message);
      return false;
    }
  }

  /**
   * Envoie un résumé quotidien
   * @param {Object} market - Données du marché
   */
  async sendSummary(market) {
    if (!this.initialized) {
      return false;
    }

    try {
      const message = [
        '📊 *Résumé Polymarket*',
        '',
        `*Marché:* ${market.title}`,
        '',
        '*Probabilités actuelles:*'
      ];

      market.options.forEach(option => {
        const percentage = option.probability.toFixed(2);
        message.push(`  • ${option.name}: \`${percentage}%\``);
      });

      message.push('');
      message.push(`🔗 [Voir sur Polymarket](${market.url})`);
      message.push('');
      message.push(`⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`);

      await this.bot.sendMessage(this.chatId, message.join('\n'), {
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      console.log('✅ Résumé envoyé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du résumé:', error.message);
      return false;
    }
  }
}

export default new TelegramService();
