// ==========================================================
// NAVIGATION DE L’APPLICATION
// ==========================================================

const homeView = document.querySelector("#home-view");
const calculatorView = document.querySelector("#calculator-view");
const searchInput = document.querySelector("#feature-search");
const homeFeatureButton = document.querySelector("#open-grading");
const emptyMessage = document.querySelector("#search-empty");

// ==========================================================
// CONFIGURATION DE LA BARRE DE RECHERCHE
// ==========================================================

document.querySelector('.global-navigation label[for="feature-search"]')?.remove();
searchInput.placeholder = "Rechercher";

document.querySelector("#open-grading-nav")?.remove();

// ==========================================================
// OUVERTURE DU BARÈME
// ==========================================================

function openCalculator() {
  homeView.hidden = true;
  calculatorView.hidden = false;
  document.body.classList.add("calculator-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#grading-title").focus({ preventScroll: true });
}

// ==========================================================
// RETOUR À L’ACCUEIL
// ==========================================================

function returnHome() {
  calculatorView.hidden = true;
  homeView.hidden = false;
  document.body.classList.remove("calculator-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
}

// ==========================================================
// ÉVÉNEMENTS DE NAVIGATION
// ==========================================================

homeFeatureButton.addEventListener("click", openCalculator);
document.querySelector("#back-home").addEventListener("click", returnHome);
document.querySelector("#brand-home").addEventListener("click", (event) => {
  if (!calculatorView.hidden) {
    event.preventDefault();
    returnHome();
  }
});

// ==========================================================
// RECHERCHE DES FONCTIONNALITÉS
// ==========================================================

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("fr");
  const matches = homeFeatureButton.dataset.search.toLocaleLowerCase("fr").includes(query);
  homeFeatureButton.hidden = !matches;
  emptyMessage.hidden = matches || !query || calculatorView.hidden;
});
