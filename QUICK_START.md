# 🚀 Démarrage Rapide

Guide rapide pour démarrer le système en 5 minutes.

## ⚡ Installation Express (3 étapes)

### 1. Cloner et installer

```bash
git clone <repository-url>
cd bot-telegram-alerte
npm install
```

### 2. Configurer

```bash
cp .env.example .env
```

Éditer `.env` et remplir **uniquement ces 2 valeurs obligatoires**:

```env
TELEGRAM_TOKEN=votre_token_ici
CHAT_ID=votre_chat_id_ici
```

**Comment obtenir ces valeurs?**

- **TELEGRAM_TOKEN**: Ouvrir [@BotFather](https://t.me/botfather) → `/newbot` → Copier le token
- **CHAT_ID**: Ouvrir [@userinfobot](https://t.me/userinfobot) → Copier l'ID

### 3. Lancer

```bash
npm start
```

✅ C'est tout! Le système est opérationnel:
- Interface web: `http://localhost:3000`
- API: `http://localhost:3000/api/odds`
- Monitoring: Actif en arrière-plan

## 🐳 Avec Docker (encore plus rapide)

```bash
# 1. Configurer
cp .env.example .env
# Éditer .env avec vos tokens

# 2. Démarrer
docker-compose up -d

# 3. Voir les logs
docker-compose logs -f
```

## 🧪 Tester la configuration

```bash
npm test
```

Ce script vérifie:
- ✅ Configuration correcte
- ✅ Connexion API Polymarket
- ✅ Bot Telegram fonctionnel
- ✅ Détection des seuils

## 📱 Recevoir une alerte de test

Une fois le système démarré, il enverra automatiquement une alerte Telegram si une probabilité dépasse 65%.

Pour tester immédiatement:

```bash
node src/monitor/monitor.js --once
```

## ⚙️ Configuration Avancée (optionnel)

Modifier `.env` pour personnaliser:

```env
# Seuil d'alerte (défaut: 65%)
ALERT_THRESHOLD=70

# Intervalle de surveillance (défaut: 5 minutes)
MONITOR_INTERVAL_MINUTES=10

# Marché à surveiller (défaut: London,temperature)
MARKET_KEYWORDS=Bitcoin,price
```

## 🆘 Problèmes Courants

### ❌ "Marché non trouvé"

**Solution**: Vérifier les mots-clés dans `MARKET_KEYWORDS`

```bash
# Voir tous les marchés disponibles
curl https://api.polymarket.com/events?active=true | jq '.[] | .title'
```

### ❌ "Bot non initialisé"

**Solution**: Vérifier `TELEGRAM_TOKEN` et `CHAT_ID` dans `.env`

```bash
npm test
```

### ❌ Port 3000 déjà utilisé

**Solution**: Changer le port dans `.env`

```env
PORT=8080
```

## 📚 Documentation Complète

Voir [README.md](README.md) pour:
- Architecture détaillée
- API REST complète
- Déploiement en production
- Configuration PM2
- Déploiement Vercel

## 🎯 Exemples d'Utilisation

### Surveiller Bitcoin

```env
MARKET_KEYWORDS=Bitcoin,100000
ALERT_THRESHOLD=75
```

### Surveillance toutes les 2 minutes

```env
MONITOR_INTERVAL_MINUTES=2
```

### Seuil d'alerte plus élevé

```env
ALERT_THRESHOLD=80
```

---

**Besoin d'aide?** Consultez le [README.md](README.md) ou ouvrez une issue.
