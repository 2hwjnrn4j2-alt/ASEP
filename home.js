// ==========================================================
// NAVIGATION DE L’APPLICATION
// ==========================================================

const homeView = document.querySelector("#home-view");
const calculatorView = document.querySelector("#calculator-view");
const searchInput = document.querySelector("#feature-search");
const homeFeatureButton = document.querySelector("#open-grading");
const emptyMessage = document.querySelector("#search-empty");
const calculatorFooterNote = document.querySelector("footer span:nth-child(2)");

// ==========================================================
// CONFIGURATION DE LA BARRE DE RECHERCHE
// ==========================================================

document.querySelector('.global-navigation label[for="feature-search"]')?.remove();
searchInput.placeholder = "Rechercher";

document.querySelector("#open-grading-nav")?.remove();

// ==========================================================
// STYLE DE LA PAGE NOUVEAUTÉS
// ==========================================================

const pageStyle = document.createElement("style");
pageStyle.textContent = `
  .back-home { border-color: #b94f73; background: #b94f73; color: #fff; }
  .back-home:hover { border-color: #963b5d; background: #963b5d; }
  #news-view { color: #111; }
  #news-view .eyebrow, #news-view .news-heading p,
  #news-view .news-card p, #news-view .news-card ul { color: #333; }
  #news-view .news-card { border-color: #222; background: #fff; box-shadow: none; }
  #news-view .news-version { background: #111; color: #fff; }
  #news-view .news-date { color: #555; }
`;
document.head.append(pageStyle);

// ==========================================================
// CRÉATION DE LA PAGE NOUVEAUTÉS
// ==========================================================

const newsView = document.createElement("div");
newsView.id = "news-view";
newsView.hidden = true;
newsView.innerHTML = `
  <div class="news-view">
    <button id="back-home-news" class="back-home" type="button"><span aria-hidden="true">←</span> Retour à l’accueil</button>
    <section class="intro news-heading" aria-labelledby="news-title">
      <div>
        <p class="eyebrow">ACTUALITÉS ASEP</p>
        <h1 id="news-title">Nouveautés</h1>
        <p>Les améliorations, nouvelles fonctionnalités et corrections apportées à chaque mise à jour.</p>
      </div>
    </section>
    <div class="news-list" aria-live="polite">
      <article class="news-card">
        <div class="news-card-header"><span class="news-version">Version 0.4.0</span><time class="news-date" datetime="2026-11-24">24 novembre 2026</time></div>
        <h2>Nouveau journal des mises à jour</h2>
        <p>ASEP accueille un onglet « Nouveautés » permettant de retrouver facilement les changements apportés au site.</p>
        <ul><li>Accès depuis la page d’accueil.</li><li>Présentation des versions.</li><li>Historique des nouveautés et améliorations.</li></ul>
      </article>
      <article class="news-card">
        <div class="news-card-header"><span class="news-version">Version 0.3.0</span><time class="news-date" datetime="2026-11-23">23 novembre 2026</time></div>
        <h2>Barèmes personnalisés et prêts à imprimer</h2>
        <p>Le générateur de barème prend désormais en charge davantage d’informations.</p>
        <ul><li>Ajout du titre, de la date et du nom de la classe.</li><li>Titre personnalisé lors de l’impression ou de l’export PDF.</li><li>Affichage plus adapté sur les appareils mobiles.</li></ul>
      </article>
    </div>
  </div>`;
document.querySelector("main").append(newsView);

// ==========================================================
// CARTE D’ACCÈS À LA PAGE NOUVEAUTÉS
// ==========================================================

const newsFeatureButton = document.createElement("button");
newsFeatureButton.id = "open-news";
newsFeatureButton.className = "feature-link news-home-link";
newsFeatureButton.type = "button";
newsFeatureButton.dataset.search = "nouveautés nouveautés actualités mises à jour versions changelog blog";
newsFeatureButton.innerHTML = '<span class="feature-icon" aria-hidden="true">✦</span><span><strong>Nouveautés</strong><small>Découvrir les dernières mises à jour du site</small></span><span class="feature-arrow" aria-hidden="true">→</span>';
document.querySelector(".feature-navigation").append(newsFeatureButton);

// ==========================================================
// GESTION DU NOTE DE PIED DE PAGE
// ==========================================================

function showCalculatorFooterNote() {
  if (calculatorFooterNote) calculatorFooterNote.hidden = false;
}

function hideCalculatorFooterNote() {
  if (calculatorFooterNote) calculatorFooterNote.hidden = true;
}

hideCalculatorFooterNote();

// ==========================================================
// OUVERTURE DES DIFFÉRENTES VUES
// ==========================================================

function openCalculator() {
  homeView.hidden = true;
  newsView.hidden = true;
  calculatorView.hidden = false;
  document.body.classList.add("calculator-active");
  showCalculatorFooterNote();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#grading-title").focus({ preventScroll: true });
}

function openNews() {
  homeView.hidden = true;
  calculatorView.hidden = true;
  newsView.hidden = false;
  document.body.classList.remove("calculator-active");
  hideCalculatorFooterNote();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#news-title").focus({ preventScroll: true });
}

function returnHome() {
  calculatorView.hidden = true;
  newsView.hidden = true;
  homeView.hidden = false;
  document.body.classList.remove("calculator-active");
  hideCalculatorFooterNote();
  window.scrollTo({ top: 0, behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
}

// ==========================================================
// ÉVÉNEMENTS DE NAVIGATION
// ==========================================================

homeFeatureButton.addEventListener("click", openCalculator);
newsFeatureButton.addEventListener("click", openNews);
document.querySelector("#back-home").addEventListener("click", returnHome);
newsView.querySelector("#back-home-news").addEventListener("click", returnHome);
document.querySelector("#brand-home").addEventListener("click", (event) => {
  if (!calculatorView.hidden || !newsView.hidden) {
    event.preventDefault();
    returnHome();
  }
});

// ==========================================================
// RECHERCHE DES FONCTIONNALITÉS
// ==========================================================

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("fr");
  const gradingMatches = !query || homeFeatureButton.dataset.search.toLocaleLowerCase("fr").includes(query);
  const newsMatches = !query || newsFeatureButton.dataset.search.toLocaleLowerCase("fr").includes(query);
  homeFeatureButton.hidden = !gradingMatches;
  newsFeatureButton.hidden = !newsMatches;
  const visibleMatch = gradingMatches || newsMatches;
  emptyMessage.hidden = visibleMatch || !query || (!calculatorView.hidden && !newsView.hidden);
});

// ==========================================================
// VERSION AFFICHÉE
// ==========================================================

const footerVersion = document.querySelector("footer span");
if (footerVersion) footerVersion.textContent = "ASEP v0.4.0";
