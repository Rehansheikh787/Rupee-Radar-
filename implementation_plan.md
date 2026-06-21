# RupeeRadar — Phase-wise Implementation Plan

This implementation plan details the phased approach to building RupeeRadar, an AI-powered personal finance assistant. We will build the system in 8 distinct phases, mapping specialized Agent Skills to each phase to ensure optimal design, coding standard compliance, and robustness.

---

## User Review Required

> [!IMPORTANT]
> The Gemini API Key must be supplied in a local `server/.env` file. We will require the API key to perform AI-powered transaction categorization fallback and AI insight generation.
> In case an API key is not available, the system will gracefully degrade to keyword-based categorization and static local metrics summaries.

> [!WARNING]
> This app is designed to be fully client-session based with no persistent user database (stateless model). Uploaded CSVs are parsed in-memory or stored temporarily on the server and immediately purged. Please confirm if database persistence is desired in the future.

---

## Open Questions

> [!IMPORTANT]
> Do you have a specific CSV export format or bank (e.g., HDFC, SBI, ICICI) statement example we should prioritize first? If not, we will design the parser around a generic, standard CSV format (Date, Description, Credit/Debit, Amount, Balance).

---

## Proposed Changes

We will construct the backend and frontend components across the following 8 phases. Each phase is mapped to a specific set of agent skills.

---

### Phase 1: Workspace Scaffolding & Config
**Assigned Skill:** `@nodejs-best-practices` + `@react-patterns`
*Set up workspace, initialize the React client directory, the Express server directory, and configuration files.*

#### [NEW] [package.json](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/package.json)
- Set up root package.json with workspace configurations to run both frontend and backend concurrently.

#### [NEW] [server/package.json](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/package.json)
- Express dependency definitions (`express`, `cors`, `dotenv`, `multer`, `csv-parser`, `nodemon`).

#### [NEW] [client/package.json](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/package.json)
- React SPA dependency definitions (Vite, React 18, Chart.js / Recharts, Lucide Icons).

---

### Phase 2: Express Backend — Core Data Pipeline
**Assigned Skill:** `@nodejs-backend-patterns` + `@javascript-pro`
*Develop CSV upload middleware, parsing mechanism, data sanitization, and metric computations.*

#### [NEW] [server/src/app.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/src/app.js)
- Express app configuration, Middleware (CORS, JSON, Multer for file upload, error handlers).

#### [NEW] [server/src/services/parserService.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/src/services/parserService.js)
- Read uploaded CSV streams, parse transaction headers, handle messy descriptions, normalize date formats to `YYYY-MM-DD`, and extract credit/debit amounts.

#### [NEW] [server/src/services/metricsService.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/src/services/metricsService.js)
- Compute total income, spend, savings rates, and build category summaries.

---

### Phase 3: Express Backend — AI Categorization & Insights
**Assigned Skill:** `@ai-agents-architect` + `@nodejs-backend-patterns`
*Integrate Google Gemini API to categorize transactions that bypass simple keyword filters, and generate rich user insights.*

#### [NEW] [server/src/utils/categoryMappings.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/src/utils/categoryMappings.js)
- Fast-path keyword-to-category dictionaries (e.g., Swiggy -> Food).

#### [NEW] [server/src/services/categorizationService.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/src/services/categorizationService.js)
- Call Google Gemini API for transaction batches that fall through the keyword mapping, ensuring optimal prompt syntax.

#### [NEW] [server/src/services/insightsService.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/src/services/insightsService.js)
- Combine computed metrics and feed them to the Gemini model to synthesize at least 3-5 personalized financial recommendations.

---

### Phase 4: Express Backend — Recurring Detection Algorithm
**Assigned Skill:** `@andrej-karpathy` + `@nodejs-backend-patterns`
*Implement pure, robust algorithmic detection of repeating subscription payments, rents, SIPs, and EMIs.*

#### [NEW] [server/src/services/recurringService.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/server/src/services/recurringService.js)
- Normalize description keys, compute standard deviation of intervals between transactions of matching amounts/payees, and tag recurring elements.

---

### Phase 5: React Frontend — Styling & Layout
**Assigned Skill:** `@high-end-visual-design` + `@ui-ux-pro-max` + `@baseline-ui`
*Define colors, Typography (Space Grotesk + Inter), layout context, navigation, and global css files.*

#### [NEW] [client/src/styles/global.css](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/src/styles/global.css)
- CSS custom properties, spacing utility definitions, theme colors, CSS reset.

#### [NEW] [client/src/pages/HomePage.jsx](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/src/pages/HomePage.jsx)
- Glassmorphism upload interface page.

---

### Phase 6: React Frontend — Data Integration & Table UI
**Assigned Skill:** `@react-patterns` + `@frontend-design`
*Implement drag-and-drop uploads, fetch actions to talk to Express APIs, and build the main transaction list table.*

#### [NEW] [client/src/components/FileUpload/FileUpload.jsx](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/src/components/FileUpload/FileUpload.jsx)
- File upload component, handling drag-and-drop events and UI state.

#### [NEW] [client/src/components/TransactionTable/TransactionTable.jsx](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/src/components/TransactionTable/TransactionTable.jsx)
- Virtualized or paginated search-enabled table representing date, description, type, amount, category badge.

---

### Phase 7: React Frontend — Dashboard Visualizations
**Assigned Skill:** `@high-end-visual-design` + `@react-patterns`
*Build premium metric cards, interactive category charts (Pie/Donut), and display the parsed insights and recurring tables.*

#### [NEW] [client/src/components/Charts/CategoryPieChart.jsx](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/src/components/Charts/CategoryPieChart.jsx)
- Render responsive donut chart showing category spend allocation.

#### [NEW] [client/src/components/InsightsPanel/InsightsPanel.jsx](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/src/components/InsightsPanel/InsightsPanel.jsx)
- Render AI-generated spending recommendation cards.

---

### Phase 8: Verification & Deployment Config
**Assigned Skill:** `@systematic-debugging` + `@agent-evaluation`
*Write end-to-end integration tests, package the build, configure proxy pathways, and establish Vercel/Render configurations.*

#### [NEW] [client/vite.config.js](file:///d:/My%20Projects/Massai%20Live%20Project%20Course/Masai%20weekly%20Project%20Jun/RupeeRadar/client/vite.config.js)
- Proxy setting routing API requests from client to backend port 3000 in dev.

---

## Verification Plan

### Automated Tests
- Run `npm test` once testing frameworks are set up to verify CSV parsing logic and the recurring payment detection algorithm.

### Manual Verification
- Upload test CSV data to the running app.
- Check categorizations for known merchants (e.g., Netflix -> Subscription, Uber -> Travel, Swiggy -> Food).
- Confirm that calculations for Total Spend, Income, and Savings match spreadsheet expectations.
- Inspect dashboard responsive layout down to mobile viewports.
