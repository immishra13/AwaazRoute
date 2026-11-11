// AwaazRoute — quick test.
// Loads the trained model.json and checks predictions on fresh inputs
// (none of these sentences are in the training data, except where noted).
// Run: node test.js
// Exits non-zero if any expected-category check fails.

const fs = require("fs");
const path = require("path");
const { tokenize } = require("./text");
const { CATEGORIES, HUMAN_REVIEW_THRESHOLD, priorityFor } = require("./categories");
const { predictTokens } = require("./classifier");

const model = JSON.parse(fs.readFileSync(path.join(__dirname, "model.json"), "utf8"));
const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const TEST_CASES = [
  // English
  { text: "My UPI payment failed and the money got deducted", expected: "bank_accounts" },
  { text: "I never made these charges on my credit card bill", expected: "credit_card" },
  { text: "There is a loan in my CIBIL report that I never took", expected: "credit_reporting" },
  { text: "A recovery agent keeps calling my office and threatening me", expected: "debt_collection" },
  { text: "I want to close my home loan early but the bank charges a penalty", expected: "loans" },
  { text: "I need to file an RTI about the water supply in my area", expected: "government" },
  // Hinglish (Roman)
  { text: "mera account block ho gaya hai paise nahi nikal rahe", expected: "bank_accounts" },
  { text: "credit card ka bill galat aaya hai maine kharcha hi nahi kiya", expected: "credit_card" },
  { text: "mera CIBIL score achanak kam ho gaya bina wajah ke", expected: "credit_reporting" },
  { text: "recovery agent ghar aakar dhamki de raha hai", expected: "debt_collection" },
  { text: "mera loan EMI badh gaya bank ne pehle bataya nahi", expected: "loans" },
  { text: "ration card me naam galat hai kis office me theek hoga", expected: "government" },
  // Hindi (Devanagari)
  { text: "मेरा क्रेडिट कार्ड खो गया है तुरंत ब्लॉक करना है", expected: "credit_card" },
  { text: "मुझे अपने इलाके की सड़क के लिए RTI डालनी है", expected: "government" },
];

let passed = 0;
for (const t of TEST_CASES) {
  const r = predictTokens(tokenize(t.text), model);
  const ok = r.category === t.expected;
  if (ok) passed++;
  const review = r.confidence < HUMAN_REVIEW_THRESHOLD ? " [HUMAN REVIEW]" : "";
  console.log(
    `${ok ? "PASS" : "FAIL"} | ${r.confidence.toFixed(2)} | ${byId[r.category].label} | priority: ${priorityFor(t.text)}${review}\n     "${t.text}"${ok ? "" : `  (expected: ${byId[t.expected].label})`}`
  );
}

// Edge case: nonsense input should NOT get a confident answer.
const junk = predictTokens(tokenize("asdf qwer zzzz blorp"), model);
console.log(
  `\nJUNK CHECK | confidence ${junk.confidence.toFixed(2)} | human review flagged: ${junk.confidence < HUMAN_REVIEW_THRESHOLD} (should be true)`
);

console.log(`\n${passed}/${TEST_CASES.length} category checks passed.`);
if (passed !== TEST_CASES.length || junk.confidence >= HUMAN_REVIEW_THRESHOLD) {
  console.log("TEST FAILED — model needs more training data or tuning.");
  process.exit(1);
}
console.log("TEST OK");
