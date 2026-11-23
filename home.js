const homeView = document.querySelector("#home-view");
const calculatorView = document.querySelector("#calculator-view");
const searchInput = document.querySelector("#feature-search");
const homeFeatureButton = document.querySelector("#open-grading");
const navFeatureButton = document.querySelector("#open-grading-nav");
const emptyMessage = document.querySelector("#search-empty");

function openCalculator() {
  homeView.hidden = true;
  calculatorView.hidden = false;
  document.body.classList.add("calculator-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#grading-title").focus({ preventScroll: true });
}

function returnHome() {
  calculatorView.hidden = true;
  homeView.hidden = false;
  document.body.classList.remove("calculator-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
}

homeFeatureButton.addEventListener("click", openCalculator);
navFeatureButton.addEventListener("click", openCalculator);
document.querySelector("#back-home").addEventListener("click", returnHome);
document.querySelector("#brand-home").addEventListener("click", (event) => {
  if (!calculatorView.hidden) {
    event.preventDefault();
    returnHome();
  }
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("fr");
  const matches = homeFeatureButton.dataset.search.toLocaleLowerCase("fr").includes(query);
  homeFeatureButton.hidden = !matches;
  navFeatureButton.hidden = !matches;
  emptyMessage.hidden = matches || !query || calculatorView.hidden;
});
