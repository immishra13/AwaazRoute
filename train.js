// AwaazRoute — trainer.
// Trains a TF-IDF + multinomial logistic regression classifier on the
// synthetic samples in training-data.js and writes model.json, which the
// static web app loads for live predictions. Same idea as Ankur's
// Financial Complaint Classifier (TF-IDF + Logistic Regression), rebuilt
// here in plain JavaScript so it runs anywhere, including GitHub Pages.
//
// Run: node train.js
// Then: node test.js

const fs = require("fs");
const path = require("path");
const { tokenize } = require("./text");
const { CATEGORIES } = require("./categories");
const TRAINING_DATA = require("./training-data");

const CLASS_IDS = CATEGORIES.map((c) => c.id);
const CLASS_INDEX = Object.fromEntries(CLASS_IDS.map((id, i) => [id, i]));

// ---- 1. Tokenise and build vocabulary ----
const docs = TRAINING_DATA.map((d) => ({
  tokens: tokenize(d.text),
  label: CLASS_INDEX[d.category],
}));
const N = docs.length;

const df = new Map();
for (const d of docs) {
  for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1);
}
const vocabulary = [...df.keys()].sort();
const vocabIndex = new Map(vocabulary.map((t, i) => [t, i]));
const V = vocabulary.length;
const idf = vocabulary.map((t) => Math.log((N + 1) / (df.get(t) + 1)) + 1);

// TF-IDF vector for one document (dense array).
function tfidf(tokens) {
  const vec = new Array(V).fill(0);
  const counts = new Map();
  for (const t of tokens) {
    const i = vocabIndex.get(t);
    if (i !== undefined) counts.set(i, (counts.get(i) || 0) + 1);
  }
  const len = tokens.length || 1;
  for (const [i, c] of counts) vec[i] = (c / len) * idf[i];
  return vec;
}

const X = docs.map((d) => tfidf(d.tokens));
const K = CLASS_IDS.length;

// ---- 2. Multinomial logistic regression (full-batch gradient descent) ----
const W = Array.from({ length: V }, () => new Array(K).fill(0));
const b = new Array(K).fill(0);
const LR = 0.5;
const EPOCHS = 1200;
const L2 = 0.002;

function softmax(logits) {
  const m = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - m));
  const s = exps.reduce((a, c) => a + c, 0);
  return exps.map((e) => e / s);
}

for (let epoch = 0; epoch < EPOCHS; epoch++) {
  const gW = Array.from({ length: V }, () => new Array(K).fill(0));
  const gb = new Array(K).fill(0);
  for (let n = 0; n < N; n++) {
    const logits = new Array(K).fill(0);
    for (let k = 0; k < K; k++) {
      let s = b[k];
      for (let j = 0; j < V; j++) s += X[n][j] * W[j][k];
      logits[k] = s;
    }
    const p = softmax(logits);
    for (let k = 0; k < K; k++) {
      const err = p[k] - (docs[n].label === k ? 1 : 0);
      gb[k] += err / N;
      for (let j = 0; j < V; j++) gW[j][k] += (err * X[n][j]) / N;
    }
  }
  for (let j = 0; j < V; j++) {
    for (let k = 0; k < K; k++) {
      W[j][k] -= LR * (gW[j][k] + L2 * W[j][k]);
    }
  }
  for (let k = 0; k < K; k++) b[k] -= LR * gb[k];
}

// ---- 3. Training accuracy ----
let correct = 0;
for (let n = 0; n < N; n++) {
  const logits = new Array(K).fill(0);
  for (let k = 0; k < K; k++) {
    let s = b[k];
    for (let j = 0; j < V; j++) s += X[n][j] * W[j][k];
    logits[k] = s;
  }
  const pred = logits.indexOf(Math.max(...logits));
  if (pred === docs[n].label) correct++;
}

// ---- 4. Save model ----
const model = {
  version: 1,
  trainedOn: new Date().toISOString().slice(0, 10),
  samples: N,
  classes: CLASS_IDS,
  vocabulary,
  idf,
  weights: W,
  bias: b,
  note: "TF-IDF + multinomial logistic regression, trained on synthetic demo samples only. Not a production model.",
};
fs.writeFileSync(path.join(__dirname, "model.json"), JSON.stringify(model));

console.log(`Samples: ${N} | Vocabulary: ${V} words | Classes: ${K}`);
console.log(`Training accuracy: ${correct}/${N} = ${(100 * correct / N).toFixed(1)}%`);
console.log(`model.json written (${(fs.statSync(path.join(__dirname, "model.json")).size / 1024).toFixed(1)} KB)`);
