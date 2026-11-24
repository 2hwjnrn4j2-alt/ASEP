// ==========================================================
// IMPORTS DU CALCULATEUR
// ==========================================================

import { formatNumber, generateTable, resolvePassingPercent, validateParameters } from "./calculator.js";

// ==========================================================
// ÉLÉMENTS DE L’INTERFACE
// ==========================================================

const form = document.querySelector("#grading-form");
const resultsBody = document.querySelector("#results-body");
const errorMessage = document.querySelector("#error-message");
const rowCount = document.querySelector("#row-count");
const printButton = document.querySelector("#print-button");

// ==========================================================
// INFORMATIONS SUR L’ÉVALUATION
// ==========================================================

function createEvaluationDetails() {
  const section = document.createElement("section");
  section.className = "evaluation-details";
  section.setAttribute("aria-labelledby", "evaluation-details-title");
  section.innerHTML = `
    <div class="evaluation-details-heading">
      <p class="eyebrow">AVANT DE COMMENCER</p>
      <h2 id="evaluation-details-title">Informations de l’évaluation</h2>
    </div>
    <div class="field-grid">
      <label class="field field-wide" for="evaluation-title">
        <span>Titre de l’évaluation</span>
        <input id="evaluation-title" name="evaluationTitle" type="text" placeholder="Ex. Évaluation de mathématiques">
      </label>
      <label class="field" for="evaluation-date">
        <span>Date</span>
        <input id="evaluation-date" name="evaluationDate" type="date">
      </label>
      <label class="field" for="evaluation-class">
        <span>Nom de la classe</span>
        <input id="evaluation-class" name="evaluationClass" type="text" placeholder="Ex. 5P">
      </label>
    </div>`;
  form.prepend(section);

  const printHeading = document.createElement("header");
  printHeading.className = "print-evaluation-heading";
  printHeading.innerHTML = `
    <h1 id="print-evaluation-title"></h1>
    <p id="print-evaluation-meta"></p>`;
  document.querySelector(".results").prepend(printHeading);

  const style = document.createElement("style");
  style.textContent = `
    .evaluation-details { margin-bottom: 25px; padding-bottom: 22px; border-bottom: 1px solid #edf1ee; }
    .evaluation-details-heading { margin-bottom: 17px; }
    .evaluation-details-heading .eyebrow { margin-bottom: 7px; }
    .evaluation-details input[type="date"] { width: 100%; min-width: 0; max-width: 100%; }
    .print-evaluation-heading { display: none; }
    @media print {
      .print-evaluation-heading { display: block; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid #aaa; }
      .print-evaluation-heading h1 { margin: 0 0 7px; font-size: 22px; letter-spacing: 0; }
      .print-evaluation-heading p { display: flex; gap: 24px; margin: 0; color: #333; font-size: 11px; }
      .print-evaluation-heading p:empty { display: none; }
    }
    @media (max-width: 760px) { .evaluation-details { margin-bottom: 22px; padding-bottom: 19px; } }
    @media (max-width: 480px) { .evaluation-details .field:not(.field-wide) { grid-column: 1 / -1; } }`;
  document.head.append(style);

  const titleInput = section.querySelector("#evaluation-title");
  const dateInput = section.querySelector("#evaluation-date");
  const classInput = section.querySelector("#evaluation-class");
  const printTitle = printHeading.querySelector("#print-evaluation-title");
  const printMeta = printHeading.querySelector("#print-evaluation-meta");

  function updatePrintHeading() {
    printTitle.textContent = titleInput.value.trim() || "Barème de notes";
    const details = [];
    if (dateInput.value) {
      const [year, month, day] = dateInput.value.split("-").map(Number);
      details.push(`Date : ${new Intl.DateTimeFormat("fr-CH").format(new Date(year, month - 1, day))}`);
    }
    if (classInput.value.trim()) details.push(`Classe : ${classInput.value.trim()}`);
    printMeta.replaceChildren(...details.map((detail) => {
      const span = document.createElement("span");
      span.textContent = detail;
      return span;
    }));
  }

  section.addEventListener("input", updatePrintHeading);
  updatePrintHeading();
}

createEvaluationDetails();

// ==========================================================
// LECTURE DU FORMULAIRE
// ==========================================================

function readParameters() {
  const formData = new FormData(form);
  const optionalNumber = (name) => {
    const value = formData.get(name);
    return value === "" ? null : Number(value);
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

// ==========================================================
// AFFICHAGE DES ERREURS
// ==========================================================

function showErrors(errors) {
  errorMessage.replaceChildren();
  const list = document.createElement("ul");
  for (const error of errors) {
    const item = document.createElement("li");
    item.textContent = error;
    list.append(item);
  }
  errorMessage.append(list);
  errorMessage.hidden = errors.length === 0;
  if (errors.length) {
    resultsBody.replaceChildren();
    rowCount.textContent = "";
  }
}

// ==========================================================
// AFFICHAGE DU TABLEAU
// ==========================================================

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
  rowCount.textContent = `${rows.length} ${rows.length > 1 ? "lignes" : "ligne"} · pas de ${formatNumber(rows.length > 1 ? rows[1].score - rows[0].score : parameters.totalPoints)} pt`;
}

// ==========================================================
// CALCUL DU BARÈME
// ==========================================================

function calculate() {
  const parameters = readParameters();
  const passingPercentInput = document.querySelector("#passing-percent");
  const hasValidGrades = Number.isFinite(parameters.minGrade)
    && Number.isFinite(parameters.maxGrade)
    && Number.isFinite(parameters.passingGrade)
    && parameters.minGrade < parameters.passingGrade
    && parameters.passingGrade < parameters.maxGrade;
  passingPercentInput.placeholder = hasValidGrades
    ? `Auto · ${formatNumber(resolvePassingPercent({ ...parameters, passingPercent: null }))}`
    : "Auto";
  const errors = validateParameters(parameters);
  if (errors.length) {
    showErrors(errors);
    return;
  }
  try {
    const { rows } = generateTable(parameters);
    showErrors([]);
    renderTable(parameters, rows);
  } catch (error) {
    showErrors([error.message]);
  }
}

// ==========================================================
// ÉVÉNEMENTS DU FORMULAIRE
// ==========================================================

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});
form.addEventListener("input", calculate);
form.addEventListener("change", calculate);
form.addEventListener("reset", () => {
  requestAnimationFrame(() => {
    document.querySelector("#evaluation-title").dispatchEvent(new Event("input", { bubbles: true }));
    calculate();
  });
});

// ==========================================================
// IMPRESSION ET NOM DU FICHIER PDF
// ==========================================================

const originalDocumentTitle = document.title;

function setExportFilename() {
  const dateValue = document.querySelector("#evaluation-date").value;
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  const datePart = `${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${date.getFullYear()}`;
  const title = document.querySelector("#evaluation-title").value
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  document.title = title ? `${datePart}_Barème_${title}` : `${datePart}_Barème`;
}

printButton.addEventListener("click", () => {
  setExportFilename();
  window.print();
});
window.addEventListener("beforeprint", setExportFilename);
window.addEventListener("afterprint", () => {
  document.title = originalDocumentTitle;
});

// ==========================================================
// CALCUL INITIAL
// ==========================================================

calculate();
