import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLocalCategory } from '../utils/categoryMappings.js';

// Initialize Gemini API client lazily if key exists
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
};

/**
 * Call Groq API to categorize transactions.
 */
async function callGroqCategorization(batch) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    return null;
  }

  const promptData = batch.map(tx => ({
    id: tx.id,
    desc: tx.description,
    amount: tx.amount,
    type: tx.type
  }));

  const prompt = `
    You are a financial analyst. Categorize the following transactions from an Indian bank statement.
    Select EXACTLY ONE category for each transaction from the list below:
    [Food, Travel, Shopping, Bills, EMI, Subscriptions, Salary, Rent, Investments, Other]

    Transactions:
    ${JSON.stringify(promptData, null, 2)}

    Return your response ONLY as a JSON array of objects, containing "id" and "category".
    Do not add markdown formatting or explanation outside the JSON array.
    Example:
    [
      {"id": "txn_3", "category": "Food"},
      {"id": "txn_5", "category": "Bills"}
    ]
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Some models wrap JSON in quotes or a key, so we parse it carefully
    let parsed = JSON.parse(text);
    // If the object returned has a nested array (e.g. { "transactions": [...] }), extract it
    if (!Array.isArray(parsed) && typeof parsed === 'object') {
      const keys = Object.keys(parsed);
      for (const k of keys) {
        if (Array.isArray(parsed[k])) {
          parsed = parsed[k];
          break;
        }
      }
    }
    return parsed;
  } catch (error) {
    console.error('❌ Groq API categorization failed:', error.message);
    return null;
  }
}

/**
 * Categorizes an array of transactions.
 * Uses local keyword matches first, then batches remaining items to Groq or Gemini API.
 */
export async function categorizeTransactions(transactions) {
  if (!transactions || transactions.length === 0) return [];

  const categorized = [];
  const uncategorizedItems = [];

  // Step 1: Try local keyword matching first
  transactions.forEach(tx => {
    const localCat = getLocalCategory(tx.description);
    if (localCat) {
      categorized.push({ ...tx, category: localCat });
    } else {
      uncategorizedItems.push(tx);
    }
  });

  // If everything was matched locally, return immediately
  if (uncategorizedItems.length === 0) {
    return categorized;
  }

  // Step 2: Check for Groq API
  const groqApiKey = process.env.GROQ_API_KEY;
  const hasGroq = groqApiKey && groqApiKey !== 'YOUR_GROQ_API_KEY_HERE';

  const geminiModel = getGeminiModel();

  if (!hasGroq && !geminiModel) {
    console.warn('⚠️ No AI API keys set. Falling back to "Other" for uncategorized transactions.');
    uncategorizedItems.forEach(tx => {
      categorized.push({ ...tx, category: 'Other' });
    });
    return categorized;
  }

  try {
    const batchSize = 30;
    const aiCategorizedResults = {};

    for (let i = 0; i < uncategorizedItems.length; i += batchSize) {
      const batch = uncategorizedItems.slice(i, i + batchSize);
      let parsed = null;

      if (hasGroq) {
        console.log('💡 Calling Groq API for transaction categorization batch...');
        parsed = await callGroqCategorization(batch);
      } 
      
      if (!parsed && geminiModel) {
        console.log('💡 Calling Gemini API for transaction categorization batch...');
        const promptData = batch.map(tx => ({
          id: tx.id,
          desc: tx.description,
          amount: tx.amount,
          type: tx.type
        }));

        const prompt = `
          You are a financial analyst. Categorize the following transactions from an Indian bank statement.
          Select EXACTLY ONE category for each transaction from the list below:
          [Food, Travel, Shopping, Bills, EMI, Subscriptions, Salary, Rent, Investments, Other]

          Transactions:
          ${JSON.stringify(promptData, null, 2)}

          Return your response ONLY as a JSON array of objects, containing "id" and "category".
        `;

        const result = await geminiModel.generateContent(prompt);
        const text = result.response.text();
        parsed = JSON.parse(text);
      }

      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item.id && item.category) {
            aiCategorizedResults[item.id] = item.category;
          }
        });
      }
    }

    // Step 3: Combine matches
    uncategorizedItems.forEach(tx => {
      const aiCategory = aiCategorizedResults[tx.id];
      categorized.push({
        ...tx,
        category: aiCategory || 'Other'
      });
    });

  } catch (error) {
    console.error('❌ Error during AI transaction categorization:', error.message);
    uncategorizedItems.forEach(tx => {
      categorized.push({ ...tx, category: 'Other' });
    });
  }

  // Preserve original order
  const orderMap = new Map(transactions.map((t, idx) => [t.id, idx]));
  return categorized.sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id));
}
