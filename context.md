# RupeeRadar — Project Context

## Overview

**RupeeRadar** is an AI-powered personal finance assistant that analyzes bank statement data to help users understand where their money is going. It converts raw, messy financial transaction data into meaningful, categorized insights presented through a simple dashboard or downloadable report.

---

## Problem Statement

Working professionals make hundreds of monthly transactions across UPI, cards, bank transfers, subscriptions, EMIs, rent, shopping, food delivery, travel, and investments. Bank statements contain all this data but are difficult to understand because transaction descriptions are messy, inconsistent, and hard to categorize manually.

RupeeRadar solves this by automating the extraction, cleaning, categorization, and analysis of bank statement data.

---

## Key Questions the App Should Answer

- What are my biggest spending categories?
- How much did I spend this month?
- Which transactions are recurring subscriptions or EMIs?
- What was my biggest transaction?
- What are the top insights from my spending behavior?

---

## Core Requirements

| # | Requirement | Details |
|---|-------------|---------|
| 1 | **Data Input** | Accept bank statement data as input (CSV, PDF, or other formats) |
| 2 | **Transaction Cleaning** | Extract and clean transactions into a structured format |
| 3 | **Categorization** | Classify transactions into groups: `Food`, `Travel`, `Shopping`, `Bills`, `EMI`, `Subscriptions`, `Salary`, `Rent`, `Investments`, `Other` |
| 4 | **Recurring Detection** | Identify recurring transactions such as subscriptions, EMIs, rent, SIPs, or insurance payments |
| 5 | **Financial Metrics** | Calculate total income, total spend, savings, top categories, and biggest transactions |
| 6 | **Spending Insights** | Generate clear, human-readable insights using actual transaction amounts |
| 7 | **UI / Dashboard** | Present results through a simple user interface, dashboard, or downloadable report |

---

## Expected Deliverables

- ✅ Cleaned transaction data
- ✅ Categorized expenses
- ✅ Recurring payment detection
- ✅ Spend summary dashboard
- ✅ At least **3 personalized financial insights**
- ✅ A final report or visual summary that can be shared

---

## Expense Categories

The following categories should be supported for transaction classification:

| Category | Examples |
|----------|----------|
| Food | Swiggy, Zomato, restaurants, groceries |
| Travel | Uber, Ola, flights, trains, fuel |
| Shopping | Amazon, Flipkart, Myntra, retail stores |
| Bills | Electricity, water, internet, mobile recharge |
| EMI | Loan EMIs, credit card EMIs |
| Subscriptions | Netflix, Spotify, YouTube Premium, gym |
| Salary | Monthly salary credits |
| Rent | House rent, office rent |
| Investments | Mutual funds, SIPs, stocks, FD |
| Other | Uncategorized / miscellaneous |

---

## Evaluation Criteria

1. **Accuracy** — Transaction cleaning and categorization quality
2. **Insight Quality** — Usefulness and clarity of financial insights
3. **Robustness** — Ability to handle real-world messy transaction descriptions
4. **User Experience** — Simplicity and usefulness of the interface
5. **Completeness** — End-to-end workflow coverage
6. **Privacy** — Privacy-conscious handling of sensitive financial data

---

## Constraints

- Prioritize a **working end-to-end prototype** over perfect support for every bank format
- Technology stack and implementation approach are open (participant's choice)
- The final deliverable should be a **deployed or locally runnable application**

---

## Technical Context

- **Project Name:** RupeeRadar
- **Type:** AI Challenge / Hackathon Project (Masai Weekly Project — June 2026)
- **Status:** Initial setup — no code written yet
- **Root Directory:** `RupeeRadar/`

---

## Architecture Notes (To Be Decided)

> These are open decisions to be made as the project progresses:

- **Frontend Framework:** _(e.g., React + Vite, Next.js, vanilla HTML/JS)_
- **Backend/API:** _(e.g., Node.js, FastAPI, Express)_
- **AI/ML Layer:** _(e.g., OpenAI API, Gemini, local NLP for categorization)_
- **Data Processing:** _(e.g., Python pandas, JS-based CSV parsing)_
- **Database:** _(e.g., SQLite, localStorage, Supabase — or none if stateless)_
- **Deployment Target:** _(e.g., Vercel, Render, local only)_
