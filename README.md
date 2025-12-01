# Polymarket Telegram Alert System

Système de surveillance automatique des marchés Polymarket avec notifications Telegram et interface web minimaliste.

## 📋 Fonctionnalités

- 🔍 Surveillance automatique de l'API Polymarket
- 📱 Alertes Telegram en temps réel
- 🌐 Interface web minimaliste pour visualiser les probabilités
- 📊 API REST pour accéder aux données
- ⏰ Monitoring configurable (intervalle personnalisable)
- 🚨 Seuil d'alerte personnalisable
- 🐳 Support Docker
- ☁️ Déployable sur Vercel

## 🚀 Installation

### Prérequis

- Node.js 18+ ou Docker
- Un bot Telegram (obtenir un token via [@BotFather](https://t.me/botfather))
- Un Chat ID Telegram (obtenir via [@userinfobot](https://t.me/userinfobot))

### Installation locale

1. **Cloner le repository**

```bash
git clone <repository-url>
cd bot-telegram-alerte
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env` et remplir les valeurs:

```bash
cp .env.example .env
```

Éditer `.env`:

```env
# Configuration du Bot Telegram
TELEGRAM_TOKEN=your_telegram_bot_token_here
CHAT_ID=your_chat_id_here

# Configuration du serveur
PORT=3000

# Configuration du monitoring
MONITOR_INTERVAL_MINUTES=5
ALERT_THRESHOLD=65

# Mots-clés pour rechercher le marché Polymarket
MARKET_KEYWORDS=London,temperature
```

4. **Démarrer l'application**

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🐳 Installation avec Docker

### Docker Compose (recommandé)

```bash
# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer le conteneur
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter le conteneur
docker-compose down
```

### Docker simple

```bash
# Construire l'image
docker build -t polymarket-monitor .

# Lancer le conteneur
docker run -d \
  --name polymarket-monitor \
  -p 3000:3000 \
  --env-file .env \
  polymarket-monitor

# Voir les logs
docker logs -f polymarket-monitor
```

## ☁️ Déploiement sur Vercel

1. **Installer Vercel CLI**

```bash
npm install -g vercel
```

2. **Déployer**

```bash
vercel
```

3. **Configurer les variables d'environnement**

Dans le dashboard Vercel, ajouter les variables d'environnement:
- `TELEGRAM_TOKEN`
- `CHAT_ID`
- `ALERT_THRESHOLD`
- `MONITOR_INTERVAL_MINUTES`
- `MARKET_KEYWORDS`

**Note**: Le monitoring automatique ne fonctionnera pas sur Vercel (serverless). Utilisez un cron externe comme [cron-job.org](https://cron-job.org) pour appeler `/api/odds` régulièrement.

## 📝 Utilisation

### Interface Web

Accéder à `http://localhost:3000` pour voir:
- Titre du marché
- Probabilités en temps réel
- Badge 🔥 si une option dépasse le seuil
- Heure de la dernière mise à jour

### API REST

#### GET /api/odds

Retourne les probabilités actuelles du marché.

**Réponse:**

```json
{
  "title": "Maximum temperature in London on January 15, 2025",
  "description": "...",
  "options": [
    {
      "name": "Below 5°C",
      "probability": 45.67,
      "price": 0.4567,
      "aboveThreshold": false
    },
    {
      "name": "5-10°C",
      "probability": 68.23,
      "price": 0.6823,
      "aboveThreshold": true
    }
  ],
  "threshold": 65,
  "url": "https://polymarket.com/event/...",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

#### GET /api/status

Retourne le statut du système.

```json
{
  "status": "online",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "config": {
    "threshold": 65,
    "interval": 5,
    "keywords": ["London", "temperature"]
  }
}
```

#### POST /api/clear-cache

Efface le cache Polymarket.

### Scripts disponibles

```bash
# Démarrer le serveur web + monitoring
npm start

# Mode développement avec rechargement automatique
npm run dev

# Exécuter uniquement le monitoring (sans serveur web)
npm run monitor

# Exécution unique du monitoring
node src/monitor/monitor.js --once

# Tester la configuration
npm test
```

### PM2 (Production)

Pour un déploiement en production avec PM2:

```bash
# Installer PM2
npm install -g pm2

# Démarrer avec PM2
pm2 start ecosystem.config.cjs

# Voir les logs
pm2 logs polymarket-monitor

# Redémarrer
pm2 restart polymarket-monitor

# Arrêter
pm2 stop polymarket-monitor

# Sauvegarder la configuration pour démarrage automatique
pm2 save
pm2 startup
```

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `TELEGRAM_TOKEN` | Token du bot Telegram | - |
| `CHAT_ID` | ID du chat Telegram | - |
| `PORT` | Port du serveur web | 3000 |
| `ALERT_THRESHOLD` | Seuil d'alerte en % | 65 |
| `MONITOR_INTERVAL_MINUTES` | Intervalle de vérification | 5 |
| `MARKET_KEYWORDS` | Mots-clés du marché (séparés par des virgules) | London,temperature |

### Personnalisation des mots-clés

Pour surveiller un autre marché, modifier `MARKET_KEYWORDS`:

```env
# Exemple: marché sur Bitcoin
MARKET_KEYWORDS=Bitcoin,price

# Exemple: marché sur les élections
MARKET_KEYWORDS=Election,2024
```

Le système recherchera un marché dont le titre ou la description contient **tous** les mots-clés spécifiés.

## 📱 Configuration du Bot Telegram

### Obtenir un token de bot

1. Ouvrir [@BotFather](https://t.me/botfather) sur Telegram
2. Envoyer `/newbot`
3. Suivre les instructions
4. Copier le token fourni dans `.env`

### Obtenir votre Chat ID

1. Ouvrir [@userinfobot](https://t.me/userinfobot) sur Telegram
2. Le bot vous enverra votre Chat ID
3. Copier l'ID dans `.env`

### Tester le bot

```bash
npm test
```

## 🏗️ Architecture

```
bot-telegram-alerte/
├── src/
│   ├── api/
│   │   └── routes.js          # Routes API Express
│   ├── bot/
│   │   └── telegram.js        # Service de notification Telegram
│   ├── monitor/
│   │   └── monitor.js         # Script de surveillance
│   ├── services/
│   │   └── polymarket.js      # Service API Polymarket
│   ├── index.js               # Point d'entrée principal
│   └── test.js                # Script de test
├── public/
│   ├── index.html             # Interface web
│   ├── style.css              # Styles minimalistes
│   └── app.js                 # Application frontend
├── .env.example               # Template de configuration
├── package.json               # Dépendances Node.js
├── Dockerfile                 # Configuration Docker
├── docker-compose.yml         # Orchestration Docker
├── vercel.json                # Configuration Vercel
└── ecosystem.config.cjs       # Configuration PM2
```

## 🔍 Fonctionnement

1. **Surveillance**: Le système interroge l'API Polymarket toutes les X minutes
2. **Recherche**: Recherche un marché contenant les mots-clés configurés
3. **Analyse**: Extrait les probabilités via `yesPrice × 100`
4. **Alerte**: Si une probabilité dépasse le seuil, envoie une notification Telegram
5. **Cooldown**: Évite les alertes répétées (30 minutes entre alertes identiques)
6. **Interface**: Affiche les données en temps réel sur l'interface web

## 🎨 Interface Web

L'interface web suit un design ultra-minimaliste:
- Background blanc (#ffffff)
- Typographie Inter
- Mise en page centrée
- Responsive
- Badge 🔥 pour les options au-dessus du seuil
- Rafraîchissement automatique toutes les minutes

## 🐛 Dépannage

### Le bot ne reçoit pas de notifications

1. Vérifier que `TELEGRAM_TOKEN` et `CHAT_ID` sont corrects
2. Tester avec: `npm test`
3. Vérifier les logs: `docker-compose logs -f` ou `pm2 logs`

### Aucun marché trouvé

1. Vérifier les mots-clés dans `MARKET_KEYWORDS`
2. Tester manuellement: `npm test`
3. Consulter la liste des marchés sur [polymarket.com](https://polymarket.com)

### L'interface web ne se charge pas

1. Vérifier que le serveur est démarré: `http://localhost:3000/api/status`
2. Vérifier les logs pour des erreurs
3. Vérifier le port dans `.env`

## 📦 Dépendances

- **express**: Serveur web et API REST
- **node-telegram-bot-api**: Interface avec Telegram
- **node-cron**: Planification des tâches
- **axios**: Client HTTP pour l'API Polymarket
- **dotenv**: Gestion des variables d'environnement

## 📄 Licence

MIT

## 🤝 Support

Pour toute question ou problème, ouvrir une issue sur GitHub.

---

Développé avec ❤️ pour surveiller les marchés Polymarket
