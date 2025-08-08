import { google } from 'googleapis';

const SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // <-- Replace this
const SHEET_NAME = 'Sheet1'; // <-- Your sheet tab name

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // or restrict to your frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
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

    // Required fields validation
    if (!businessName || !contactPerson || !email || !whatsapp) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // Authenticate with Google API
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare row to append
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
