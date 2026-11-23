const homeView = document.querySelector("#home-view");
const calculatorView = document.querySelector("#calculator-view");
const searchInput = document.querySelector("#feature-search");
const featureButton = document.querySelector("#open-grading");
const emptyMessage = document.querySelector("#search-empty");

function openCalculator() {
  homeView.hidden = true;
  calculatorView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#grading-title").focus({ preventScroll: true });
}

function returnHome() {
  calculatorView.hidden = true;
  homeView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
}

featureButton.addEventListener("click", openCalculator);
document.querySelector("#back-home").addEventListener("click", returnHome);
document.querySelector("#brand-home").addEventListener("click", (event) => {
  if (!calculatorView.hidden) {
    event.preventDefault();
    returnHome();
  }
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("fr");
  const matches = featureButton.dataset.search.toLocaleLowerCase("fr").includes(query);
  featureButton.hidden = !matches;
  emptyMessage.hidden = matches;
});
