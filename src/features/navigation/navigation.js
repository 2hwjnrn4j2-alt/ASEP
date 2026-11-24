// Navigation entre les vues, recherche des outils et gestion du focus.
export function initializeNavigation() {
  const views = [...document.querySelectorAll("main > section[id]")];
  const searchInput = document.querySelector("#feature-search");
  const featureButtons = [...document.querySelectorAll(".feature-navigation [data-view]")];
  const emptyMessage = document.querySelector("#search-empty");
  const footerNote = document.querySelector("#footer-note");

  const viewPaths = {
    "home-view": "#accueil",
    "calculator-view": "#bareme",
    "news-view": "#nouveautés",
  };
  const pathViews = Object.fromEntries(Object.entries(viewPaths).map(([viewId, path]) => [path, viewId]));

  function showView(viewId, { moveFocus = true, updateHistory = true } = {}) {
    if (!views.some((view) => view.id === viewId)) viewId = "home-view";

    for (const view of views) view.hidden = view.id !== viewId;
    document.body.classList.toggle("calculator-active", viewId === "calculator-view");
    if (footerNote) footerNote.hidden = viewId !== "calculator-view";

    if (updateHistory) {
      const nextHash = viewPaths[viewId];
      if (window.location.hash !== nextHash) {
        window.history.pushState({ viewId }, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (moveFocus) document.querySelector(`#${viewId} h1`)?.focus({ preventScroll: true });
  }

  function restoreViewFromLocation() {
    showView(pathViews[window.location.hash] || "home-view", { updateHistory: false });
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view]");
    if (trigger) showView(trigger.dataset.view);
  });

  document.querySelector("#brand-home")?.addEventListener("click", (event) => {
    event.preventDefault();
    showView("home-view", {
      moveFocus: true,
    });
  });

  window.addEventListener("popstate", restoreViewFromLocation);

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase("fr");
    let matchCount = 0;
    for (const button of featureButtons) {
      const matches = !query || button.dataset.search.toLocaleLowerCase("fr").includes(query);
      button.hidden = !matches;
      if (matches) matchCount += 1;
    }
    if (emptyMessage) emptyMessage.hidden = !query || matchCount > 0 || !document.querySelector("#home-view").hidden;
  });

  restoreViewFromLocation();
}
