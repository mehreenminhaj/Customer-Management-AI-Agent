import { CustomerMessage } from '../types';

export const DEFAULT_SHEET_HEADERS = [
  'Timestamp',
  'Message ID',
  'Customer Name',
  'Customer Email',
  'Channel',
  'Subject',
  'Original Message',
  'Category',
  'Sentiment',
  'Priority',
  'AI Summary',
  'AI Auto-Response',
  'Response Status',
  'Suggested Action'
];

/**
 * Creates a brand new Google Spreadsheet for logging Customer Messages
 */
export async function createCustomerSupportSpreadsheet(accessToken: string, title = 'Customer Messages AI Log'): Promise<{ id: string; url: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Customer Messages',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl;

  // Initialize header row with formatting
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return { id: spreadsheetId, url: spreadsheetUrl };
}

/**
 * Adds the headers to the spreadsheet and formats them
 */
export async function initializeSheetHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
  // Append headers
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Customer Messages!A1:N1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [DEFAULT_SHEET_HEADERS],
      }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.json();
    console.warn('Could not write header values directly, continuing:', err);
  }
}

/**
 * Appends a classified customer message row to the active spreadsheet
 */
export async function appendMessageToSheet(
  accessToken: string,
  spreadsheetId: string,
  message: CustomerMessage
): Promise<{ updatedRows: number }> {
  const row = [
    new Date(message.receivedAt).toLocaleString(),
    message.id,
    message.customerName,
    message.customerEmail,
    message.channel,
    message.subject || '(No Subject)',
    message.content,
    message.category || 'Unclassified',
    message.sentiment || 'Neutral',
    message.priority || 'Medium',
    message.summary || '',
    message.autoResponse || '',
    message.responseStatus || 'draft',
    message.suggestedAction || ''
  ];

  const range = 'Customer Messages!A:N';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to sync row to Google Sheets');
  }

  const resData = await response.json();
  return { updatedRows: resData.updates?.updatedRows || 1 };
}

/**
 * Verifies spreadsheet access and fetches sheet metadata
 */
export async function verifySpreadsheetAccess(accessToken: string, spreadsheetId: string): Promise<{ title: string; sheetNames: string[] }> {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Could not access spreadsheet. Check ID and permissions.');
  }

  const data = await response.json();
  return {
    title: data.properties?.title || 'Spreadsheet',
    sheetNames: (data.sheets || []).map((s: any) => s.properties?.title || ''),
  };
}

/**
 * Reads recent synced rows from the spreadsheet
 */
export async function readRecentSyncedRows(accessToken: string, spreadsheetId: string, limit = 15): Promise<string[][]> {
  const range = 'Customer Messages!A1:N' + (limit + 1);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.values || [];
}
