import dotenv from 'dotenv';
import polymarket from './services/polymarket.js';
import telegram from './bot/telegram.js';

dotenv.config();

/**
 * Script de test pour vérifier le fonctionnement du système
 */
async function test() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   TEST DU SYSTÈME POLYMARKET MONITOR          ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');

  // Test 1: Configuration
  console.log('📋 Test 1: Vérification de la configuration');
  console.log('   TELEGRAM_TOKEN:', process.env.TELEGRAM_TOKEN ? '✅ Défini' : '❌ Manquant');
  console.log('   CHAT_ID:', process.env.CHAT_ID ? '✅ Défini' : '❌ Manquant');
  console.log('   PORT:', process.env.PORT || 3000);
  console.log('   ALERT_THRESHOLD:', process.env.ALERT_THRESHOLD || 65);
  console.log('   MONITOR_INTERVAL_MINUTES:', process.env.MONITOR_INTERVAL_MINUTES || 5);
  console.log('');

  // Test 2: API Polymarket
  console.log('📋 Test 2: Récupération des données Polymarket');
  try {
    const keywords = (process.env.MARKET_KEYWORDS || 'London,temperature').split(',');
    console.log('   Mots-clés recherchés:', keywords.join(', '));

    const market = await polymarket.findMarket(keywords);

    if (market) {
      console.log('   ✅ Marché trouvé:', market.title);
      console.log('   URL:', market.url);
      console.log('');
      console.log('   Options:');
      market.options.forEach(option => {
        console.log(`      ${option.name}: ${option.probability.toFixed(2)}%`);
      });
    } else {
      console.log('   ❌ Aucun marché trouvé');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }
  console.log('');

  // Test 3: Bot Telegram
  console.log('📋 Test 3: Test du bot Telegram');
  const botInitialized = telegram.init();

  if (botInitialized) {
    console.log('   ✅ Bot initialisé');

    // Demander si l'utilisateur veut envoyer un message de test
    console.log('');
    console.log('   Voulez-vous envoyer un message de test? (y/n)');

    // Pour l'instant, on saute cette partie en mode automatique
    console.log('   ⏸️  Test manuel désactivé en mode automatique');
  } else {
    console.log('   ❌ Bot non initialisé (vérifier TELEGRAM_TOKEN et CHAT_ID)');
  }
  console.log('');

  // Test 4: Vérification des seuils
  console.log('📋 Test 4: Vérification des seuils d\'alerte');
  try {
    const keywords = (process.env.MARKET_KEYWORDS || 'London,temperature').split(',');
    const threshold = parseFloat(process.env.ALERT_THRESHOLD) || 65;
    const market = await polymarket.findMarket(keywords);

    if (market) {
      const alerts = polymarket.checkThreshold(market, threshold);

      if (alerts.length > 0) {
        console.log(`   🚨 ${alerts.length} alerte(s) détectée(s) (seuil: ${threshold}%)`);
        alerts.forEach(alert => {
          console.log(`      ${alert.name}: ${alert.probability.toFixed(2)}%`);
        });
      } else {
        console.log(`   ✅ Aucune alerte (seuil: ${threshold}%)`);
      }
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }
  console.log('');

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   FIN DES TESTS                               ║');
  console.log('╚════════════════════════════════════════════════╝');
}

// Exécuter les tests
test().catch(console.error);
