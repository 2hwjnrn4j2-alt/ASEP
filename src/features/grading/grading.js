// Interface du barème : lecture du formulaire, erreurs, résultats et impression.
import { formatNumber, generateTable, resolvePassingPercent, validateParameters } from "./calculator.js";

export function initializeGrading() {
  const form = document.querySelector("#grading-form");
  if (!form) return;
  const resultsBody = document.querySelector("#results-body");
  const errorMessage = document.querySelector("#error-message");
  const rowCount = document.querySelector("#row-count");
  const passingPercentInput = document.querySelector("#passing-percent");
  const printButton = document.querySelector("#print-button");

  // Convertit les valeurs du formulaire en paramètres métier.
  function readParameters() {
    const formData = new FormData(form);
    const optionalNumber = (name) => {
      const value = formData.get(name);
      return value === "" || value === null ? null : Number(value);
    };
    const roundingValue = formData.get("rounding");
    return {
      totalPoints: Number(formData.get("totalPoints")),
      minGrade: Number(formData.get("minGrade")),
      maxGrade: Number(formData.get("maxGrade")),
      passingGrade: Number(formData.get("passingGrade")),
      passingPercent: optionalNumber("passingPercent"),
      pointStep: optionalNumber("pointStep"),
      rounding: roundingValue === "none" ? null : Number(roundingValue),
    };
  }

  // Affiche les erreurs sans injecter de texte HTML fourni par l’utilisateur.
  function showErrors(errors) {
    errorMessage.replaceChildren();
    if (errors.length) {
      const list = document.createElement("ul");
      for (const error of errors) {
        const item = document.createElement("li");
        item.textContent = error;
        list.append(item);
      }
      errorMessage.append(list);
      resultsBody.replaceChildren();
      rowCount.textContent = "";
    }
    errorMessage.hidden = errors.length === 0;
  }

  // Rend le tableau de notes et son résumé.
  function renderTable(parameters, rows) {
    const fragment = document.createDocumentFragment();
    for (const row of rows) {
      const tr = document.createElement("tr");
      if (row.grade >= parameters.passingGrade) tr.classList.add("is-passing");
      const pointsCell = document.createElement("td");
      pointsCell.textContent = formatNumber(row.score);
      const gradeCell = document.createElement("td");
      gradeCell.className = "grade-cell";
      gradeCell.textContent = formatNumber(row.grade, 2);
      tr.append(pointsCell, gradeCell);
      fragment.append(tr);
    }
    resultsBody.replaceChildren(fragment);
    const displayedStep = rows.length > 1 ? rows[1].score - rows[0].score : parameters.totalPoints;
    rowCount.textContent = `${rows.length} ${rows.length > 1 ? "lignes" : "ligne"} · pas de ${formatNumber(displayedStep)} pt`;
  }

  // Calcule et met à jour le tableau à chaque changement pertinent.
  function calculate() {
    const parameters = readParameters();
    const gradesAreValid = Number.isFinite(parameters.minGrade) && Number.isFinite(parameters.maxGrade)
      && Number.isFinite(parameters.passingGrade) && parameters.minGrade < parameters.passingGrade
      && parameters.passingGrade < parameters.maxGrade;
    passingPercentInput.placeholder = gradesAreValid
      ? `Auto · ${formatNumber(resolvePassingPercent({ ...parameters, passingPercent: null }))}`
      : "Auto";
    const errors = validateParameters(parameters);
    if (errors.length) return showErrors(errors);
    try {
      const { rows } = generateTable(parameters);
      showErrors([]);
      renderTable(parameters, rows);
    } catch (error) {
      showErrors([error.message]);
    }
  }

  // Synchronise les métadonnées affichées sur le document imprimé.
  function updatePrintHeading() {
    const title = document.querySelector("#evaluation-title").value.trim() || "Barème de notes";
    document.querySelector("#print-evaluation-title").textContent = title;
    const dateValue = document.querySelector("#evaluation-date").value;
    const className = document.querySelector("#evaluation-class").value.trim();
    const details = [];
    if (dateValue) {
      const [year, month, day] = dateValue.split("-").map(Number);
      details.push(`Date : ${new Intl.DateTimeFormat("fr-CH").format(new Date(year, month - 1, day))}`);
    }
    if (className) details.push(`Classe : ${className}`);
    const meta = document.querySelector("#print-evaluation-meta");
    meta.replaceChildren(...details.map((detail) => {
      const item = document.createElement("span");
      item.textContent = detail;
      return item;
    }));
  }

  // Donne un nom explicite au fichier proposé par la boîte d’impression.
  const originalDocumentTitle = document.title;
  function setExportFilename() {
    const dateValue = document.querySelector("#evaluation-date").value;
    const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
    const datePart = `${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${date.getFullYear()}`;
    const title = document.querySelector("#evaluation-title").value.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
    document.title = title ? `${datePart}_Bareme_${title}` : `${datePart}_Bareme`;
  }

  form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  form.addEventListener("input", () => { updatePrintHeading(); calculate(); });
  form.addEventListener("change", () => { updatePrintHeading(); calculate(); });
  form.addEventListener("reset", () => requestAnimationFrame(() => { updatePrintHeading(); calculate(); }));
  printButton.addEventListener("click", () => { setExportFilename(); window.print(); });
  window.addEventListener("beforeprint", setExportFilename);
  window.addEventListener("afterprint", () => { document.title = originalDocumentTitle; });

  updatePrintHeading();
  calculate();
}
