# 📡 RupeeRadar — AI-Powered Personal Finance Assistant

RupeeRadar is a full-stack, privacy-conscious personal finance assistant that cleans, categorizes, and analyzes bank statement transactions. Using local keyword engines combined with **Groq Llama 3.1 AI**, it automatically extracts insights, identifies recurring payments (subscriptions, EMIs, rent, SIPs), and presents the results in a premium, glassmorphism-styled dashboard.

---

## 🚀 Key Features

*   **Smart CSV Parser:** Handles messy, bank-specific header disclaimers and auto-detects date formats, transaction amounts, and withdrawal/deposit distributions.
*   **Dual-Layer Categorization:** Employs a fast local keyword dictionary mapping (Swiggy, Amazon, Netflix, Zomato, Airtel, etc.) with a **Groq Llama 3.1 AI** fallback for complex, unrecognized transactions.
*   **Recurring Payment Detection:** Automatically matches repeating payees and calculates cycles and frequencies (e.g. monthly subscriptions, EMIs, housing rent, SIPs).
*   **Actionable AI Insights:** Synthesizes overall spending summaries and generates 3-5 personalized financial recommendations with custom emojis.
*   **Interactive Dashboard:** Interactive donut charts (Chart.js), search-enabled paginated transaction list tables, and summary cards.
*   **Printable PDF Reports:** Custom `@media print` CSS variables that instantly formats the dark mode layout into a ink-friendly, high-contrast white PDF report.
*   **Privacy First:** Fully stateless session-based architecture. Files uploaded are parsed in-memory, processed, and immediately deleted from the server (zero persistent databases).

---

## 🛠️ Technology Stack

*   **Frontend:** React 18, Vite, Chart.js, Vanilla CSS variables.
*   **Backend:** Node.js, Express.js, Multer (file parsing).
*   **AI Integration:** Groq API SDK (native `fetch` to Llama 3.1 8B model).

---

## 📋 Getting Started

### 1. Setup Environment Variables
Create a `.env` file inside the `server/` directory and populate your API keys:

```env
# server/.env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE_MB=5

# Groq API Configuration
GROQ_API_KEY=your_actual_groq_api_key
```

### 2. Install Dependencies
Run the install script from the **root directory** of the project:

```bash
npm run install:all
```

### 3. Run Development Servers
Start both the React client and Express backend concurrently:

```bash
npm run dev
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser to view the application!

### 4. Run CLI Tests
To verify the parsing and AI integration pipelines directly from the terminal, run:

```bash
cd server
npm test               # Core pipeline integration tests
npm run test:sample    # Full analysis pipeline on sample CSV data
```

---

## 📂 Project Structure

```
RupeeRadar/
├── client/                 # React SPA (Vite + Chart.js)
│   ├── src/
│   │   ├── components/     # FileUpload, TransactionTable, CategoryPieChart
│   │   ├── pages/          # HomePage, DashboardPage, ReportPage
│   │   └── styles/         # Global design variables and typography
├── server/                 # Express API Backend
│   ├── src/
│   │   ├── controllers/    # Upload and analysis controllers
│   │   ├── services/       # Parser, Metrics, AI Categorization, Recurring Detection
│   │   └── utils/          # Keyword mappings
│   └── tests/              # Verification suites & mock files
├── sample_bank_statement.csv # Prepared sample statement for testing upload
└── README.md
```
