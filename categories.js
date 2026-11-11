// AwaazRoute — complaint categories, routing targets and priority rules.
// Shared by the trainer (Node) and the web app (browser).
// The five financial categories come from Ankur's Financial Complaint
// Classifier; the sixth reuses the department-routing idea from his
// RTI Black Hole project.

const CATEGORIES = [
  {
    id: "bank_accounts",
    label: "Bank Accounts and Services",
    team: "Bank Account Support Team",
    blurb: "Savings/current account, UPI, debit card, KYC, charges",
  },
  {
    id: "credit_card",
    label: "Credit Card Services",
    team: "Credit Card Support Team",
    blurb: "Card bill, limit, charges, lost card, EMI, rewards",
  },
  {
    id: "credit_reporting",
    label: "Credit Reporting",
    team: "Credit Bureau Disputes Team",
    blurb: "CIBIL score, credit report errors, wrong loan entries",
  },
  {
    id: "debt_collection",
    label: "Debt Collection",
    team: "Collections Resolution Team",
    blurb: "Recovery calls, harassment, settlement, threats",
  },
  {
    id: "loans",
    label: "Loans",
    team: "Loans Support Team",
    blurb: "Home/personal/education loan, EMI, foreclosure, NOC",
  },
  {
    id: "government",
    label: "Government Services / RTI",
    team: "Concerned Govt. Department (RTI Cell)",
    blurb: "RTI, certificates, municipal services, scheme info",
  },
];

// Same safeguard as RTI Black Hole: below 80% confidence the complaint
// is flagged for a human reviewer instead of auto-routing.
const HUMAN_REVIEW_THRESHOLD = 0.8;

const URGENT_WORDS = [
  "fraud", "dhamki", "threat", "threatening", "blocked", "block",
  "urgent", "turant", "kho", "gaya", "lost", "stolen", "harassment",
  "pareshan", "goons", "court", "dhamki", "beizzati", "vasuli",
  "धमकी", "फ्रॉड", "ब्लॉक", "तुरंत", "खो",
];

const INFO_WORDS = [
  "status", "kab", "milegi", "process", "kaise", "kya", "check",
  "update", "kab", "kitne", "status",
];

// Priority: High for urgent words, Low for pure information-seeking
// questions, Medium for everything else.
function priorityFor(text) {
  const t = String(text || "").toLowerCase();
  if (URGENT_WORDS.some((w) => t.includes(w))) return "High";
  if (INFO_WORDS.some((w) => t.includes(w))) return "Low";
  return "Medium";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CATEGORIES,
    HUMAN_REVIEW_THRESHOLD,
    URGENT_WORDS,
    INFO_WORDS,
    priorityFor,
  };
}
