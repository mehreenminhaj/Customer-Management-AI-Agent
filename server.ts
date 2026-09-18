import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client securely on server
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

/**
 * AI Classification & Auto-Response Endpoint
 * Uses gemini-3.8-flash for high-accuracy categorization, sentiment analysis,
 * extraction of key issues, and contextual response generation.
 */
app.post('/api/classify-and-respond', async (req, res) => {
  try {
    const { customerName, customerEmail, channel, subject, content, tone = 'professional', companyName = 'Our Support Team' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are an expert customer operations AI agent for ${companyName}.
Your duties are:
1. Classify incoming customer messages into standard categories: 'Technical Support', 'Billing & Refunds', 'Feature Request', 'Sales Inquiry', 'Account Access', or 'General Feedback'.
2. Determine customer sentiment: 'Positive', 'Neutral', 'Negative', or 'Urgent'.
3. Assign an operational priority: 'Critical', 'High', 'Medium', or 'Low' (Critical for production outages/severe blockers, High for billing disputes or hot enterprise sales).
4. Extract a clear 1-2 sentence executive summary.
5. Identify 2-4 key bullet issues/topics.
6. Propose a concrete internal action for the support team.
7. Craft a helpful, complete, empathic, professional auto-response tailored to the tone requested ('${tone}'). Address the customer by name (${customerName || 'Customer'}) and sign off appropriately.`;

    const prompt = `Classify this customer message and draft an auto-response:
Customer: ${customerName || 'Anonymous'} (${customerEmail || 'No email provided'})
Channel: ${channel || 'Email'}
Subject: ${subject || '(No subject)'}
Message Content:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                'Technical Support',
                'Billing & Refunds',
                'Feature Request',
                'Sales Inquiry',
                'Account Access',
                'General Feedback',
              ],
            },
            sentiment: {
              type: Type.STRING,
              enum: ['Positive', 'Neutral', 'Negative', 'Urgent'],
            },
            priority: {
              type: Type.STRING,
              enum: ['Critical', 'High', 'Medium', 'Low'],
            },
            summary: {
              type: Type.STRING,
              description: 'Concise 1-2 sentence summary of the customer situation',
            },
            keyIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key issues or topics identified in the message',
            },
            suggestedAction: {
              type: Type.STRING,
              description: 'Internal recommended action for team or workflow',
            },
            autoResponse: {
              type: Type.STRING,
              description: 'Polished draft or final auto-response message ready to send',
            },
          },
          required: [
            'category',
            'sentiment',
            'priority',
            'summary',
            'keyIssues',
            'suggestedAction',
            'autoResponse',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/classify-and-respond:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process customer message with AI',
    });
  }
});

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Customer Message AI Agent server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
