import { google } from 'googleapis';

let SERVICE_ACCOUNT;
try {
  SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
} catch (err) {
  console.error('Failed to parse SERVICE_ACCOUNT_JSON:', err);
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow your frontend domain if you want stricter
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'Invalid SERVICE_ACCOUNT_JSON' });
  }

  if (!SPREADSHEET_ID) {
    return res.status(500).json({ error: 'SPREADSHEET_ID not set' });
  }

  try {
    const {
      businessName,
      contactPerson,
      email,
      whatsapp,
      industry = '',
      businessSize = '',
      country = '',
      challenge = '',
      launchFormat = '',
      vipPriority = 'No',
    } = req.body;

    if (!businessName || !contactPerson || !email || !whatsapp) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        businessName,
        contactPerson,
        email,
        whatsapp,
        industry,
        businessSize,
        country,
        challenge,
        launchFormat,
        vipPriority,
        new Date().toISOString(),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:K`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Google Sheets append error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
