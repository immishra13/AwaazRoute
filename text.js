// AwaazRoute — shared text helpers.
// Used by the trainer (Node) and the web app (browser), so the
// tokenisation is identical in training and in live predictions.

const STOPWORDS = new Set([
  // English
  "the", "a", "an", "is", "are", "was", "were", "am", "been", "be",
  "my", "i", "me", "we", "our", "your", "you", "he", "she", "it", "its",
  "his", "her", "their", "this", "that", "there", "here", "who", "whom",
  "what", "when", "where", "which", "how", "why", "can", "could", "would",
  "should", "do", "does", "did", "of", "to", "for", "in", "on", "at", "by",
  "with", "from", "not", "no", "yes", "and", "or", "but", "if", "then",
  "so", "as", "an", "has", "have", "had", "will", "want", "need", "about",
  "after", "before", "still", "even", "also", "just", "only", "very",
  "much", "more", "please", "sir", "madam", "hello", "hi",
  // Hinglish (Roman)
  "hai", "hain", "ka", "ki", "ke", "ko", "se", "me", "mein", "mera", "meri",
  "mere", "mujhe", "mujhko", "nahi", "nhi", "kya", "kab", "kahan", "kaise",
  "kar", "karo", "karna", "karte", "karta", "raha", "rahi", "rahe", "ho",
  "gaya", "gayi", "gaye", "hoga", "hogi", "tha", "thi", "the", "main",
  "apna", "apni", "apne", "tum", "tumhara", "tumhari", "aap", "aapka",
  "aur", "ye", "wo", "woh", "yeh", "jo", "jab", "ab", "bhi", "hi", "toh",
  "phir", "pe", "par", "tak", "liye", "wala", "wali", "wale", "ek", "do",
  // Hindi (Devanagari)
  "है", "हैं", "का", "की", "के", "को", "से", "में", "मेरा", "मेरी", "मेरे",
  "मुझे", "नहीं", "क्या", "कब", "कहाँ", "कैसे", "कर", "करना", "रहा", "रही",
  "रहे", "हो", "गया", "गयी", "गए", "होगा", "था", "थी", "मैं", "अपना",
  "अपनी", "तुम", "आप", "और", "यह", "वह", "जो", "अब", "भी", "तो", "पर",
  "तक", "लिए", "वाला", "वाली", "एक", "हूं", "हूँ", "था", "है",
]);

// Split text into word tokens (Unicode letters + numbers), drop
// stopwords and single characters. Lowercases Latin script;
// Devanagari is unaffected by lowercasing.
function tokenize(text) {
  if (!text) return [];
  const raw = String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  return raw.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { tokenize, STOPWORDS };
}
