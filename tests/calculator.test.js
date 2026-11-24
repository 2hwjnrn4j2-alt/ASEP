// Tests unitaires du domaine de calcul du barème.
import test from "node:test";
import assert from "node:assert/strict";
import { calculateGrade, generateTable, resolvePassingPercent, validateParameters } from "../src/features/grading/calculator.js";

const defaults = {
  totalPoints: 20,
  minGrade: 1,
  maxGrade: 6,
  passingGrade: 4,
  passingPercent: 60,
  pointStep: 5,
  rounding: null,
};

test("la note minimale, la réussite et la note maximale sont reliées au bon seuil", () => {
  assert.equal(calculateGrade({ ...defaults, score: 0 }), 1);
  assert.equal(calculateGrade({ ...defaults, score: 12 }), 4);
  assert.equal(calculateGrade({ ...defaults, score: 20 }), 6);
});

test("le seuil par défaut se déduit des notes", () => {
  assert.equal(resolvePassingPercent({ minGrade: 1, maxGrade: 6, passingGrade: 4, passingPercent: null }), 60);
});

test("les paramètres invalides sont expliqués", () => {
  assert.ok(validateParameters({ ...defaults, totalPoints: 0 }).some((message) => message.includes("supérieur à 0")));
  assert.throws(() => calculateGrade({ ...defaults, score: 5, rounding: 0.3 }), RangeError);
});

test("le tableau inclut toujours le total exact même si le pas ne tombe pas dessus", () => {
  const { rows } = generateTable({ ...defaults, totalPoints: 10, pointStep: 3 });
  assert.deepEqual(rows.map(({ score }) => score), [0, 3, 6, 9, 10]);
});

test("les points sont bornés au total et la taille du tableau reste limitée", () => {
  assert.equal(calculateGrade({ ...defaults, score: 25 }), 6);
  assert.throws(() => generateTable({ ...defaults, totalPoints: 1000, pointStep: 0.1 }), /500 lignes/);
});
