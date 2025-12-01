/**
 * Application frontend Polymarket Monitor
 */

// Configuration
const API_URL = '/api/odds';
const REFRESH_INTERVAL = 60000; // 1 minute

// État
let refreshTimer = null;

/**
 * Récupère les données depuis l'API
 */
async function fetchData() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    throw error;
  }
}

/**
 * Affiche les données du marché
 */
function displayMarket(data) {
  const main = document.getElementById('main-content');

  const html = `
    <h2 class="market-title">${escapeHtml(data.title)}</h2>
    <a href="${escapeHtml(data.url)}" target="_blank" rel="noopener" class="market-link">
      Voir sur Polymarket →
    </a>

    <div class="options">
      ${data.options.map(option => `
        <div class="option ${option.aboveThreshold ? 'alert' : ''}">
          <span class="option-name">${escapeHtml(option.name)}</span>
          <span class="option-probability">${option.probability.toFixed(2)}%</span>
          ${option.aboveThreshold ? '<span class="badge">🔥</span>' : ''}
        </div>
      `).join('')}
    </div>
  `;

  main.innerHTML = html;

  // Mettre à jour le timestamp
  updateTimestamp(data.timestamp);
}

/**
 * Affiche une erreur
 */
function displayError(message) {
  const main = document.getElementById('main-content');

  const html = `
    <div class="error">
      <div class="error-title">Erreur</div>
      <div class="error-message">${escapeHtml(message)}</div>
    </div>
  `;

  main.innerHTML = html;
}

/**
 * Met à jour le timestamp de dernière mise à jour
 */
function updateTimestamp(timestamp) {
  const element = document.getElementById('last-update');
  const date = new Date(timestamp);

  const formatted = date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  element.textContent = formatted;
}

/**
 * Échappe le HTML pour éviter les injections XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Charge et affiche les données
 */
async function loadData() {
  try {
    const data = await fetchData();
    displayMarket(data);
  } catch (error) {
    displayError('Impossible de charger les données. Veuillez réessayer plus tard.');
  }
}

/**
 * Démarre le rafraîchissement automatique
 */
function startAutoRefresh() {
  // Arrêter le timer existant s'il y en a un
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // Démarrer un nouveau timer
  refreshTimer = setInterval(loadData, REFRESH_INTERVAL);
}

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
  // Charger les données initiales
  loadData();

  // Démarrer le rafraîchissement automatique
  startAutoRefresh();

  // Rafraîchir quand la page redevient visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadData();
    }
  });
});
