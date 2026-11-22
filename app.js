import { formatNumber, generateTable, resolvePassingPercent, validateParameters } from "./calculator.js";

const form = document.querySelector("#grading-form");
const resultsBody = document.querySelector("#results-body");
const errorMessage = document.querySelector("#error-message");
const rowCount = document.querySelector("#row-count");
const printButton = document.querySelector("#print-button");

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
    penalty: Number(formData.get("penalty")),
    pointStep: optionalNumber("pointStep"),
    rounding: roundingValue === "none" ? null : Number(roundingValue),
  };
}

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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

form.addEventListener("input", calculate);

form.addEventListener("change", calculate);

form.addEventListener("reset", () => {
  requestAnimationFrame(calculate);
});

printButton.addEventListener("click", () => window.print());

calculate();
