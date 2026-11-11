// AwaazRoute — classifier (inference).
// Loads model.json (written by train.js) and predicts the complaint
// category for a piece of text. Works in the browser and in Node
// (test.js uses the same functions, so the live app and the tests
// can never drift apart).

function softmax(logits) {
  const m = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - m));
  const s = exps.reduce((a, c) => a + c, 0);
  return exps.map((e) => e / s);
}

// TF-IDF vector for tokens, using the trained vocabulary + idf.
function vectorize(tokens, model) {
  const V = model.vocabulary.length;
  const vec = new Array(V).fill(0);
  const index = new Map(model.vocabulary.map((t, i) => [t, i]));
  const counts = new Map();
  for (const t of tokens) {
    const i = index.get(t);
    if (i !== undefined) counts.set(i, (counts.get(i) || 0) + 1);
  }
  const len = tokens.length || 1;
  for (const [i, c] of counts) vec[i] = (c / len) * model.idf[i];
  return vec;
}

// Predict from already-tokenised input. Returns the winning category,
// its confidence, all class scores, and the words that most pushed
// the decision (evidence, like the original classifier shows).
function predictTokens(tokens, model) {
  const vec = vectorize(tokens, model);
  const K = model.classes.length;
  const logits = new Array(K).fill(0);
  for (let k = 0; k < K; k++) {
    let s = model.bias[k];
    for (let j = 0; j < vec.length; j++) s += vec[j] * model.weights[j][k];
    logits[k] = s;
  }
  const probs = softmax(logits);
  let best = 0;
  for (let k = 1; k < K; k++) if (probs[k] > probs[best]) best = k;

  // Evidence: tokens whose TF-IDF x weight most supported the winner.
  const evidence = [];
  for (let j = 0; j < vec.length; j++) {
    if (vec[j] > 0) {
      evidence.push({ word: model.vocabulary[j], score: vec[j] * model.weights[j][best] });
    }
  }
  evidence.sort((a, b) => b.score - a.score);

  return {
    category: model.classes[best],
    confidence: probs[best],
    scores: Object.fromEntries(model.classes.map((c, k) => [c, +probs[k].toFixed(3)])),
    evidence: evidence.slice(0, 5).map((e) => e.word),
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { softmax, vectorize, predictTokens };
}

// Browser: fetch the model once, then predict plain text.
if (typeof window !== "undefined") {
  window.AwaazClassifier = {
    model: null,
    async load() {
      const res = await fetch("model.json");
      if (!res.ok) throw new Error("model.json load nahi hua (HTTP " + res.status + ")");
      this.model = await res.json();
      return this.model;
    },
    predict(text) {
      if (!this.model) throw new Error("Model abhi load nahi hua");
      return predictTokens(tokenize(text), this.model);
    },
  };
}
