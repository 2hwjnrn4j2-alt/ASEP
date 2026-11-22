export function validateParameters(parameters) {
  const errors = [];
  const {
    totalPoints,
    minGrade,
    maxGrade,
    passingGrade,
    passingPercent,
    penalty,
    pointStep,
  } = parameters;

  for (const [label, value] of [
    ["Le total de points", totalPoints],
    ["La note minimale", minGrade],
    ["La note maximale", maxGrade],
    ["La note de réussite", passingGrade],
  ]) {
    if (!Number.isFinite(value)) errors.push(`${label} doit être un nombre valide.`);
  }
  if (errors.length) return errors;

  if (totalPoints <= 0) errors.push("Le total de points doit être supérieur à 0.");
  if (minGrade >= maxGrade) errors.push("La note minimale doit être inférieure à la note maximale.");
  if (passingGrade <= minGrade || passingGrade >= maxGrade) {
    errors.push("La note de réussite doit être comprise strictement entre les notes minimale et maximale.");
  }

  if (passingPercent !== null && (!Number.isFinite(passingPercent) || passingPercent <= 0 || passingPercent >= 100)) {
    errors.push("Le seuil de réussite doit être compris entre 0 % et 100 %.");
  }
  if (!Number.isFinite(penalty) || penalty < 0 || penalty > totalPoints) {
    errors.push("La pénalité doit être comprise entre 0 et le total de points.");
  }
  if (pointStep != null && (!Number.isFinite(pointStep) || pointStep <= 0 || pointStep > totalPoints)) {
    errors.push("Le pas de points doit être supérieur à 0 et ne pas dépasser le total.");
  }
  return errors;
}

export function resolvePassingPercent({ minGrade, maxGrade, passingGrade, passingPercent }) {
  return passingPercent ?? ((passingGrade - minGrade) / (maxGrade - minGrade)) * 100;
}

export function calculateGrade({
  score,
  totalPoints,
  minGrade,
  maxGrade,
  passingGrade,
  passingPercent,
  penalty = 0,
  rounding = 0.5,
}) {
  const parameters = { totalPoints, minGrade, maxGrade, passingGrade, passingPercent, penalty };
  const errors = validateParameters(parameters);
  if (errors.length) throw new RangeError(errors.join(" "));
  if (!Number.isFinite(score)) throw new RangeError("Le nombre de points obtenus doit être valide.");
  if (![null, 0, 0.1, 0.25, 0.5, 1].includes(rounding)) {
    throw new RangeError("La règle d’arrondi sélectionnée n’est pas valide.");
  }

  const effectiveScore = Math.min(totalPoints, Math.max(0, score - penalty));
  const percentage = (effectiveScore / totalPoints) * 100;
  const threshold = resolvePassingPercent({ minGrade, maxGrade, passingGrade, passingPercent });
  const rawGrade = percentage <= threshold
    ? minGrade + (percentage / threshold) * (passingGrade - minGrade)
    : passingGrade + ((percentage - threshold) / (100 - threshold)) * (maxGrade - passingGrade);
  const roundedGrade = rounding === null || rounding === 0
    ? rawGrade
    : Math.round((rawGrade + Number.EPSILON) / rounding) * rounding;

  return Math.min(maxGrade, Math.max(minGrade, roundedGrade));
}

function automaticStep(totalPoints) {
  const roughStep = totalPoints / 40;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceStep = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceStep * magnitude;
}

export function generateTable(parameters) {
  const errors = validateParameters(parameters);
  if (errors.length) throw new RangeError(errors.join(" "));

  const step = parameters.pointStep ?? automaticStep(parameters.totalPoints);
  const rows = [];
  for (let index = 0; ; index += 1) {
    const score = Math.min(index * step, parameters.totalPoints);
    rows.push({
      score,
      grade: calculateGrade({ ...parameters, score }),
    });
    if (score >= parameters.totalPoints) break;
    if (rows.length >= 500) {
      throw new RangeError("Ce pas produit plus de 500 lignes. Augmentez le pas de points.");
    }
  }
  if (rows.at(-1).score !== parameters.totalPoints) {
    rows.push({
      score: parameters.totalPoints,
      grade: calculateGrade({ ...parameters, score: parameters.totalPoints }),
    });
  }
  return { rows, step };
}

export function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("fr-CH", { maximumFractionDigits }).format(value);
}
