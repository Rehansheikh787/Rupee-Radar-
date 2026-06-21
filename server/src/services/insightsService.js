import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * Call Groq API to generate insights.
 */
async function callGroqInsights(metrics) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    return null;
  }

  const prompt = `
    You are an expert personal finance advisor for Indian users.
    Analyze the following financial metrics calculated from a bank statement and generate 3 to 5 highly personalized, actionable insights.

    Ensure the insights are specific to this data (mentioning exact amounts in Indian Rupees (₹) and percentages).
    Tone: encouraging, professional, and clear. Keep each insight concise (2 sentences maximum).

    Financial Metrics Data:
    ${JSON.stringify(metrics, null, 2)}

    For each insight, specify:
    1. An emoji representing the topic (e.g. 🍕, 🚗, 🏦, ⚠️, 💡)
    2. A concise title (2-4 words)
    3. The text of the insight
    4. A type: "success" (positive saving habit), "warning" (overspending or debt threat), or "info" (neutral observations)

    Return your response ONLY as a JSON array of objects.
    Do not add markdown formatting or explanation outside the JSON array.
    Example:
    [
      {
        "id": 1,
        "emoji": "🍕",
        "title": "Food Budget Alert",
        "text": "Your food spending of ₹18,500 accounts for 21.1% of total expenses. Try limiting dining out to save up to ₹5,000 next month.",
        "type": "warning"
      }
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
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    let parsed = JSON.parse(text);
    // Extract nested array if any
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
    console.error('❌ Groq API insights generation failed:', error.message);
    return null;
  }
}

/**
 * Generates static rule-based insights when Gemini/Groq APIs are unavailable.
 */
function generateStaticInsights(metrics) {
  const insights = [];
  let id = 1;

  // Insight 1: Savings summary
  if (metrics.savingsRate > 20) {
    insights.push({
      id: id++,
      emoji: '🥳',
      title: 'Healthy Savings Rate',
      text: `Great job! You saved ${metrics.savingsRate}% of your income (₹${metrics.netSavings.toLocaleString('en-IN')}) this month. Keep this up!`,
      type: 'success'
    });
  } else if (metrics.savingsRate > 0) {
    insights.push({
      id: id++,
      emoji: '📈',
      title: 'Modest Savings',
      text: `You saved ${metrics.savingsRate}% of your income (₹${metrics.netSavings.toLocaleString('en-IN')}). Try setting a goal of 20% savings.`,
      type: 'info'
    });
  } else {
    insights.push({
      id: id++,
      emoji: '⚠️',
      title: 'Negative Savings',
      text: `You spent ₹${Math.abs(metrics.netSavings).toLocaleString('en-IN')} more than you earned. Review your top spending categories to reduce overheads.`,
      type: 'warning'
    });
  }

  // Insight 2: Top categories summary
  if (metrics.categoryBreakdown && metrics.categoryBreakdown.length > 0) {
    const topCat = metrics.categoryBreakdown[0];
    insights.push({
      id: id++,
      emoji: '📊',
      title: `Top Category: ${topCat.category}`,
      text: `Your biggest expense category is ${topCat.category}, consuming ₹${topCat.totalAmount.toLocaleString('en-IN')} (${topCat.percentage}% of your total spends).`,
      type: 'info'
    });
  }

  // Insight 3: Biggest transaction
  if (metrics.biggestTransaction) {
    insights.push({
      id: id++,
      emoji: '💸',
      title: 'Largest Transaction',
      text: `Your largest single expense was ₹${metrics.biggestTransaction.amount.toLocaleString('en-IN')} on ${metrics.biggestTransaction.date} for "${metrics.biggestTransaction.description}".`,
      type: 'info'
    });
  }

  return insights;
}

/**
 * Generates personalized, natural-language insights using calculated financial metrics.
 * Uses Groq or Google Gemini API, with a clean static fallback.
 */
export async function generateSpendingInsights(metrics) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const hasGroq = groqApiKey && groqApiKey !== 'YOUR_GROQ_API_KEY_HERE';

  const geminiModel = getGeminiModel();

  if (!hasGroq && !geminiModel) {
    console.warn('⚠️ No AI API keys set. Using static rules engine for insights.');
    return generateStaticInsights(metrics);
  }

  try {
    let parsed = null;

    if (hasGroq) {
      console.log('💡 Calling Groq API for insights generation...');
      parsed = await callGroqInsights(metrics);
    }

    if (!parsed && geminiModel) {
      console.log('💡 Calling Gemini API for insights generation...');
      const prompt = `
        You are an expert personal finance advisor for Indian users.
        Analyze the following financial metrics calculated from a bank statement and generate 3 to 5 highly personalized, actionable insights.

        Ensure the insights are specific to this data (mentioning exact amounts in Indian Rupees (₹) and percentages).
        Tone: encouraging, professional, and clear. Keep each insight concise (2 sentences maximum).

        Financial Metrics Data:
        ${JSON.stringify(metrics, null, 2)}

        For each insight, specify:
        1. An emoji representing the topic (e.g. 🍕, 🚗, 🏦, ⚠️, 💡)
        2. A concise title (2-4 words)
        3. The text of the insight
        4. A type: "success" (positive saving habit), "warning" (overspending or debt threat), or "info" (neutral observations)

        Return your response ONLY as a JSON array of objects.
      `;

      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();
      parsed = JSON.parse(text);
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, index) => ({
        id: index + 1,
        emoji: item.emoji || '💡',
        title: item.title || 'Insight',
        text: item.text,
        type: item.type || 'info'
      }));
    }

    return generateStaticInsights(metrics);

  } catch (error) {
    console.error('❌ Error during AI insights generation:', error.message);
    return generateStaticInsights(metrics);
  }
}
