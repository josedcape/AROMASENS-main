import Anthropic from '@anthropic-ai/sdk';
import { ChatPreferences } from '@shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Verificar que existe la clave API
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️ No se ha encontrado ANTHROPIC_API_KEY en las variables de entorno');
}

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = 'claude-3-7-sonnet-20250219';

// Genera un perfil psicológico y recomendación de perfume
export async function generatePerfumeProfile(preferences: ChatPreferences, conversationHistory?: string[]): Promise<any> {
  try {
    // Construir mensajes con la historia de la conversación para mantener contexto
    const messages = [];

    if (conversationHistory && conversationHistory.length > 0) {
      for (let i = 0; i < conversationHistory.length; i += 2) {
        if (i < conversationHistory.length) {
          messages.push({ role: 'user', content: conversationHistory[i] });
        }
        if (i + 1 < conversationHistory.length) {
          messages.push({ role: 'assistant', content: conversationHistory[i + 1] });
        }
      }
    }

    const prompt = `
    ## INFORMACIÓN DEL CLIENTE
    - Género: ${preferences.gender}
    - Edad: ${preferences.age}
    - Nivel de experiencia con fragancias: ${preferences.experience}
    - Contexto de uso principal: ${preferences.occasion}
    - Preferencias olfativas y personalidad: ${preferences.preferences}

    ## INSTRUCCIONES
    1. Realiza un análisis psicológico profundo basado en los datos proporcionados.
    2. Identifica rasgos de personalidad dominantes, motivaciones subyacentes y necesidades emocionales.
    3. Selecciona una fragancia específica (ID entre 1-20) que armonice perfectamente con el perfil psicológico.
    4. Explica la recomendación utilizando terminología profesional de perfumería y psicología.
    5. Incluye referencias a notas olfativas, familias de fragancias y efectos psicológicos específicos.

    ## FORMATO DE RESPUESTA
    Utiliza markdown avanzado en recommendationReason para crear una experiencia visualmente atractiva:
    - Encabezados jerárquicos (##, ###)
    - Listas con viñetas o numeradas
    - Texto en negrita para conceptos clave
    - Emojis estratégicamente colocados para mejorar la experiencia visual
    - Secciones bien definidas con espaciado adecuado

    Devuelve ÚNICAMENTE un objeto JSON con la siguiente estructura exacta:
    {
      "psychologicalProfile": "Análisis psicológico detallado y profesional",
      "recommendedPerfumeId": número entre 1 y 20,
      "recommendationReason": "Explicación elaborada en formato markdown con emojis estratégicos"
    }
    `;

    // Añadir el nuevo prompt al final de los mensajes
    messages.push({ role: 'user', content: prompt });

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: "Eres AROMASENS, un asesor experto en perfumería de lujo con formación avanzada en psicología olfativa y comportamiento humano. Tu objetivo es analizar meticulosamente el perfil psicológico del cliente y recomendar la fragancia que mejor refleje su esencia personal. Respondes siempre en formato JSON cuando se te solicita.",
      messages: messages
    });

    // Extraer el contenido JSON del mensaje
    const resultText = message.content[0].text;
    const result = JSON.parse(resultText);
    return result;
  } catch (error) {
    console.error('Error en Anthropic service:', error);
    throw new Error(`Error al generar el perfil con Anthropic: ${error.message}`);
  }
}

export async function generateChatResponse(
  prompt: string, 
  conversationHistory: any[] = []
): Promise<string> {
  try {
    if (!anthropic) {
      throw new Error("Anthropic client not initialized");
    }

    // Extraer instrucciones del sistema si existen
    const systemMessage = conversationHistory.find(msg => msg.role === 'system')?.content || 
      "Eres un especialista de la boutique de perfumería de lujo AROMASENS. Tu objetivo es entender el perfil psicológico y personalidad del cliente para recomendar perfumes inventados exclusivos.";

    // Construir mensajes para la API de Anthropic
    const messages = conversationHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

    // Añadir el mensaje actual
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      system: systemMessage,
      messages: messages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error("Error with Anthropic:", error);
    throw new Error(`Anthropic API error: ${error.message}`);
  }
}

// Función auxiliar para guardar el historial de conversación
export function updateConversationHistory(history: string[], userMessage: string, aiResponse: string): string[] {
  const updatedHistory = [...history];
  updatedHistory.push(userMessage);
  updatedHistory.push(aiResponse);

  // Opcional: limitar el tamaño del historial para evitar tokens excesivos
  const maxHistoryPairs = 10; // Mantener las últimas 10 interacciones
  if (updatedHistory.length > maxHistoryPairs * 2) {
    return updatedHistory.slice(-maxHistoryPairs * 2);
  }

  return updatedHistory;
}