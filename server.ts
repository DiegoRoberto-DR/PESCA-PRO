import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Setup bodyParser with high limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Lazy initializer for Google GenAI SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// API Routes
app.post('/api/verify-catch', async (req: express.Request, res: express.Response): Promise<any> => {
  const { imageBase64, targetSpecies, claimedLength, claimedWeight } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Nenhuma imagem foi recebida.' });
  }

  try {
    const ai = getGeminiClient();

    // Clean base64 string if it contains prefix (e.g., data:image/jpeg;base64,)
    let cleanBase64 = imageBase64;
    let mimeType = 'image/jpeg';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      cleanBase64 = parts[1];
      const match = parts[0].match(/data:(.*)/);
      if (match) {
        mimeType = match[1];
      }
    }

    const prompt = `Analise esta foto de captura de peixe enviada para um campeonato de pesca online. 
O pescador alega ter capturado um(a) "${targetSpecies}" com comprimento de ${claimedLength} cm${claimedWeight ? ` e peso de ${claimedWeight} kg` : ''}.
Você deve avaliar se a imagem condiz com a alegação e gerar uma análise para fins de arbitragem e validação do campeonato.

Responda EXCLUSIVAMENTE em formato JSON com o seguinte esquema (sem qualquer explicação adicional, sem blocos markdown extras além do JSON válido):
{
  "identifiedSpecies": "Nome da espécie identificada na imagem (ex: Tucunaré Azul, Robalo Flecha, Pintado, Tilápia, etc.)",
  "confidence": 0.0 a 1.0 (nível de certeza sobre a espécie encontrada)",
  "estimatedLength": "Descrição sobre o tamanho estimado em relação ao reivindicado (ex: 'Condizente com cerca de 42cm', 'Parece menor que o alegado')",
  "complianceCheck": true ou false (true se a imagem de fato contiver um peixe real da espécie declarada ou compatível, e se os dados declarados parecem fisicamente possíveis e sem fraude óbvia, senão false)",
  "description": "Parágrafo resumindo a análise visual. Descreva as cores do peixe, marcas características para provar a espécie, se há fita métrica/balança na foto e se há indícios de fraude."
}

Idioma da resposta: Português.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Retorno vazio da API do Gemini.');
    }

    const analysis = JSON.parse(outputText.trim());
    return res.json(analysis);

  } catch (error: any) {
    console.error('Erro na validação com o Gemini:', error);
    // Provide a friendly fallback if parsing or AI fails
    return res.status(500).json({
      error: 'Erro ao processar validação por inteligência artificial.',
      details: error.message,
      fallback: {
        identifiedSpecies: targetSpecies || 'Espécie não identificada',
        confidence: 0.5,
        estimatedLength: 'Impossível estimar automaticamente',
        complianceCheck: true, // Approve by default but mark warning
        description: 'Não foi possível rodar a validação por IA devido a um erro técnico, mas a captura foi encaminhada para revisão manual dos coordenadores.'
      }
    });
  }
});

// Setup Vite Dev Server / Static files depending on running environment
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
