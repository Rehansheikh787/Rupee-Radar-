import fs from 'fs';

/**
 * Normalizes date strings of various formats into YYYY-MM-DD
 * Supports: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD-MMM-YYYY (e.g., 15-Jun-2026)
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const cleanStr = dateStr.trim().replace(/\s+/g, ' ');

  // Try standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return cleanStr;
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  let match = cleanStr.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (match) {
    const [_, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try DD-MMM-YYYY (e.g., 15-Jun-2026 or 15-Jun-26)
  match = cleanStr.match(/^(\d{1,2})[/\-]([A-Za-z]{3})[/\-](\d{2,4})$/);
  if (match) {
    const [_, day, monthStr, yearStr] = match;
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const month = months[monthStr.toLowerCase()];
    let year = yearStr;
    if (year.length === 2) {
      year = '20' + year; // assume 20xx for 2-digit years
    }
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }

  // Try DD/MM/YY
  match = cleanStr.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2})$/);
  if (match) {
    const [_, day, month, year] = match;
    return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Fallback to JS Date parsing
  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

/**
 * Normalizes amount values into floats.
 * Handles commas, currency symbols, and parenthesized negative values.
 */
export function parseAmount(amountStr) {
  if (amountStr === null || amountStr === undefined) return 0;
  
  let cleanStr = amountStr.toString().trim()
    .replace(/[₹$,\s]/g, '') // remove currency symbols and commas
    .replace(/\((.*)\)/, '-$1'); // convert (100) to -100

  // Check if string contains Dr/Cr suffixes
  let isDebit = false;
  if (/dr$/i.test(cleanStr)) {
    isDebit = true;
    cleanStr = cleanStr.replace(/dr$/i, '');
  } else if (/cr$/i.test(cleanStr)) {
    cleanStr = cleanStr.replace(/cr$/i, '');
  }

  let value = parseFloat(cleanStr);
  if (isNaN(value)) return 0;

  if (isDebit && value > 0) {
    value = -value;
  }
  return value;
}

/**
 * Robust CSV Line Parser that handles quoted cells correctly.
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses raw bank statement CSV file into structured transaction list.
 * Automatically identifies header row, filters non-transaction rows, 
 * and normalizes values.
 */
export function parseBankStatementCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  let headerIndex = -1;
  let headers = [];

  // 1. Identify the header row
  for (let i = 0; i < lines.length; i++) {
    const parsedLine = parseCSVLine(lines[i]).map(h => h.toLowerCase());
    
    // Check if line contains date AND (description/narration/particulars)
    const hasDate = parsedLine.some(h => h.includes('date'));
    const hasDesc = parsedLine.some(h => h.includes('desc') || h.includes('narration') || h.includes('particular') || h.includes('remark'));
    const hasAmount = parsedLine.some(h => h.includes('amount') || h.includes('withdrawal') || h.includes('deposit') || h.includes('debit') || h.includes('credit'));

    if (hasDate && hasDesc && hasAmount) {
      headerIndex = i;
      headers = parseCSVLine(lines[i]);
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('Could not identify a valid transaction table header in the CSV file. Please check column headers (e.g. Date, Description, Amount).');
  }

  // 2. Map header fields
  const dateColIdx = headers.findIndex(h => h.toLowerCase().includes('date'));
  const descColIdx = headers.findIndex(h => h.toLowerCase().includes('desc') || h.toLowerCase().includes('narration') || h.toLowerCase().includes('particular') || h.toLowerCase().includes('remark'));
  
  // Amount column index mappings
  const amountColIdx = headers.findIndex(h => h.toLowerCase() === 'amount' || h.toLowerCase() === 'txn amount');
  const debitColIdx = headers.findIndex(h => h.toLowerCase().includes('withdrawal') || h.toLowerCase().includes('debit') || h.toLowerCase() === 'dr');
  const creditColIdx = headers.findIndex(h => h.toLowerCase().includes('deposit') || h.toLowerCase().includes('credit') || h.toLowerCase() === 'cr');
  
  const balanceColIdx = headers.findIndex(h => h.toLowerCase().includes('balance'));

  const transactions = [];
  let idCounter = 1;

  // 3. Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const rawCols = parseCSVLine(lines[i]);
    
    // Skip rows that don't match structural header width or have empty columns
    if (rawCols.length < Math.max(dateColIdx, descColIdx) + 1) continue;

    const rawDate = rawCols[dateColIdx];
    const rawDesc = rawCols[descColIdx];
    
    if (!rawDate || !rawDesc) continue;

    const normalizedDate = normalizeDate(rawDate);
    // If we can't extract a valid date, this is probably a footer/summary row
    if (!normalizedDate) continue;

    // Determine amount and type
    let amount = 0;
    let type = 'debit';

    if (amountColIdx !== -1) {
      amount = parseAmount(rawCols[amountColIdx]);
      type = amount >= 0 ? 'credit' : 'debit';
      // Store absolute values for clean displaying, type handles direction
      amount = Math.abs(amount);
    } else {
      // Split debit / credit columns
      const debitVal = debitColIdx !== -1 ? parseAmount(rawCols[debitColIdx]) : 0;
      const creditVal = creditColIdx !== -1 ? parseAmount(rawCols[creditColIdx]) : 0;

      if (creditVal > 0) {
        amount = creditVal;
        type = 'credit';
      } else if (debitVal > 0) {
        amount = debitVal;
        type = 'debit';
      } else {
        // Edge case: check if negative in debit column or positive in credit
        amount = 0;
      }
    }

    // Extract balance if available
    let balance = null;
    if (balanceColIdx !== -1 && rawCols[balanceColIdx]) {
      balance = Math.abs(parseAmount(rawCols[balanceColIdx]));
    }

    // Clean description: remove double spaces, slash blocks, leading/trailing spaces
    const cleanedDesc = rawDesc
      .replace(/[\/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    transactions.push({
      id: `txn_${idCounter++}`,
      date: normalizedDate,
      description: cleanedDesc,
      rawDescription: rawDesc,
      amount,
      type,
      balance
    });
  }

  // Sort transactions by date ascending
  return transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
}
