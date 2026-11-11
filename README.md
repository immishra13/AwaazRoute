# 🎙️ AwaazRoute — Voice-First Complaint Classification & Routing

**Bolo apni shikayat — Hindi ya Hinglish me. App samjhega, sahi team ko bhejega, aur bolke batayega.**

👉 **Live demo: https://immishra13.github.io/AwaazRoute/**

Many people in India can explain a problem clearly by speaking, but struggle to type it out in English on a form — a failed UPI payment, a wrong bill, a service complaint, or a question that belongs to a specific government department. Typed, English-first intake systems exclude exactly these users.

AwaazRoute lets a user simply **speak** the complaint in Hindi or code-mixed Hinglish. The app transcribes the speech, classifies the complaint, suggests the team or department it belongs to, and **reads the result back in speech** — so the user can confirm it without reading or typing anything.

## Try it

1. Open the [live demo](https://immishra13.github.io/AwaazRoute/).
2. Tap **Bolo** and speak (Chrome / Edge — mic permission needed), or type a complaint, or tap a sample chip.
3. See the category, confidence, suggested team and priority — and tap **Suno** to hear it back.

Example inputs that work:

| Try saying / typing | It should route to |
| --- | --- |
| `UPI payment fail ho gaya par paise kat gaye` | Bank Accounts and Services |
| `mera credit card ka bill galat aaya hai` | Credit Card Services |
| `mera CIBIL score achanak kam ho gaya` | Credit Reporting |
| `recovery agent ghar aakar dhamki de raha hai` | Debt Collection |
| `mera home loan EMI badh gaya hai` | Loans |
| `मुझे अपने इलाके की सड़क के लिए RTI डालनी है` | Government Services / RTI |

## How it works

```
Speak / type
   → Speech-to-text (browser Web Speech API in the demo)
   → TF-IDF + Logistic Regression classifier (model.json)
   → Category + confidence + team/department + priority
   → Speech read-back (browser Speech Synthesis)
```

- **Classification:** TF-IDF + multinomial logistic regression — the same approach as my [Financial Complaint Classifier](https://github.com/immishra13/-Financial-Complaint-Classifier) (TF-IDF + Logistic Regression, 5 complaint classes, evidence + priority + routing). Rebuilt here in plain JavaScript so it runs entirely in the browser, with no server.
- **Routing + human review:** every category maps to a team or department, with a rule-based priority (High / Medium / Low). Below **80% confidence** the complaint is flagged for a human reviewer instead of auto-routing — the same safeguard as my [RTI Black Hole](https://github.com/immishra13/RTI-black-hole) project, which flags queries below 80% confidence for a Routing Officer.
- **Voice:** the free GitHub Pages demo uses the browser's built-in Web Speech API so it runs with no API keys and no server. The production design uses **Gnani AI — Prisma v2.5 (speech-to-text), Evon v3.3 (reasoning/classification), Timbre v2.5 (text-to-speech)** — see `app.js` for the swap points.
- **Privacy:** nothing you say or type is stored anywhere. The page is fully static; speech recognition is handled by your browser.

## Categories

| Category | Routed to |
| --- | --- |
| Bank Accounts and Services | Bank Account Support Team |
| Credit Card Services | Credit Card Support Team |
| Credit Reporting | Credit Bureau Disputes Team |
| Debt Collection | Collections Resolution Team |
| Loans | Loans Support Team |
| Government Services / RTI | Concerned Govt. Department (RTI Cell) |

## Project structure

| File | What it is |
| --- | --- |
| `index.html` | The app page |
| `styles.css` | Plain CSS, no framework |
| `app.js` | Mic, text input, result display, speech read-back |
| `classifier.js` | TF-IDF + logistic regression inference (browser + Node) |
| `text.js` | Tokeniser + stopwords (English / Hinglish / Hindi) |
| `categories.js` | Categories, routing targets, priority rules |
| `training-data.js` | 144 synthetic sample complaints (English, Hinglish, Hindi) |
| `train.js` | Trains the model and writes `model.json` |
| `test.js` | 14 fresh-input checks + a nonsense-input check |
| `model.json` | Trained weights (vocabulary, IDF, coefficients) |

## Run locally

```bash
# Static site — any local server works:
python3 -m http.server 8000
# then open http://localhost:8000
```

> `file://` directly kholne se `model.json` load nahi hoga — local server ya live link use karo.

## Retrain

```bash
node train.js   # trains on training-data.js, writes model.json
node test.js    # 14 fresh inputs + junk check; must print TEST OK
```

Add your own samples to `training-data.js` (same `{ text, category }` shape), retrain, and the app picks up the new model automatically.

## Honest limits

- The demo classifier is trained on **144 synthetic sample complaints** written for this demo. It is a real, working classifier — but its accuracy is **not** production accuracy. Real deployment would need a large, real, labelled dataset and proper evaluation.
- Test results on this repo (14 fresh inputs, none in training data): **14/14 correct**, and a nonsense input correctly gets low confidence and is flagged for human review. Run `node test.js` yourself to verify.
- The demo does **not** call Gnani APIs — it uses the browser's Web Speech API. Gnani Prisma / Evon / Timbre are the intended production voice layer.
- This app suggests a destination — it does **not** file, submit, or decide anything on the user's behalf.

## Credits

Built by [Ankur Mishra](https://github.com/immishra13) — CSE (AI & ML), VIVA Institute of Technology, Mumbai.

Grows out of two of my projects:

- [Financial Complaint Classifier](https://github.com/immishra13/-Financial-Complaint-Classifier) — NLP complaint classification (TF-IDF + Logistic Regression)
- [RTI Black Hole](https://github.com/immishra13/RTI-black-hole) — AI/NLP RTI routing with confidence scoring and human-in-the-loop review

## License

MIT — use it, fork it, improve it.
