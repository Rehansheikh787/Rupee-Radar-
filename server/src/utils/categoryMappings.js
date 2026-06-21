/**
 * Dictionary of keyword-to-category mappings for instant local classification.
 * Matches lowercase transaction descriptions against these substrings.
 */
export const categoryKeywords = {
  Groceries: [
    'blinkit', 'zepto', 'bigbasket', 'instamart', 'grocery', 'supermarket', 'mart',
    'dairy', 'milk', 'vegetables', 'fresh'
  ],
  'Food & Dining': [
    'swiggy', 'zomato', 'ubereats', 'foodpanda', 'dominos', 'pizza', 'burger', 
    'starbucks', 'cafe', 'restaurant', 'canteen', 'dhaba', 'bakery', 'sweets',
    'eatery', 'eat'
  ],
  Transportation: [
    'uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'easemytrip', 'yatra', 'goibibo',
    'redbus', 'metro', 'railway', 'flight', 'airline', 'petrol', 'hpcl', 'bpcl', 
    'iocl', 'fuel', 'shell', 'toll', 'fastag', 'cab', 'taxi', 'train', 'bus', 'travel', 'auto'
  ],
  'Utilities & Bills': [
    'electricity', 'bescom', 'bsnl', 'airtel', 'jio', 'vi ', 'vodafone', 'idea',
    'broadband', 'water bill', 'tneb', 'uppcl', 'mahadiscom', 'recharge', 'dth', 'tata play',
    'internet', 'bill', 'gas', 'water'
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'decathlon', 
    'zara', 'h&m', 'retail', 'clothing', 'electronics', 'appliances', 'mall', 'shop'
  ],
  'Entertainment & Leisure': [
    'netflix', 'spotify', 'youtube premium', 'prime video', 'disney', 'hotstar',
    'gym', 'membership', 'canva', 'github', 'openai', 'chatgpt', 'adobe', 'bookmyshow',
    'ticket', 'movie', 'event', 'concert', 'gaming', 'play'
  ],
  'Housing & Rent': [
    'rent', 'house rent', 'pg rent', 'maintenance', 'society', 'landlord', 'flat'
  ],
  'Health & Medical': [
    'pharmacy', 'hospital', 'medical', 'doctor', 'clinic', 'medicine', 'apollo',
    'pharmeasy', 'lab', 'dentist', 'health', 'chemist'
  ],
  'Transfer / Credit Card Payment': [
    'transfer', 'self', 'transfer to', 'credit card', 'card payment', 'paytm',
    'phonepe', 'gpay', 'wallet', 'upi transfer'
  ],
  Salary: [
    'salary', 'payroll', 'stipend', 'wages', 'salary credit', 'acme corp'
  ],
  Investments: [
    'mutual fund', 'sip', 'zerodha', 'groww', 'upstox', 'coin', 'kuvera', 'angelone',
    'fixed deposit', 'recurring deposit', 'investment', 'nps', 'ppf', 'stocks'
  ],
  EMI: [
    'emi', 'loan', 'hdfc loan', 'sbi loan', 'icici loan', 'bajaj', 'dhani', 'cred_pay'
  ]
};

/**
 * Attempts to categorize a description based on local keyword rules.
 * Returns the matched category, or null if no keywords match.
 */
export function getLocalCategory(description) {
  if (!description) return null;
  const descLower = description.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (descLower.includes(keyword)) {
        return category;
      }
    }
  }

  return null;
}
