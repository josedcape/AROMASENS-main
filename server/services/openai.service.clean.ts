import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
// Importar LRUCache correctamente
import LRUCache from 'lru-cache';

dotenv.config();

// Constantes para emoticones por categoría
const EMOJIS = {
  perfume: ['✨', '💫', '🌸', '💐', '🌹', '🔮'],
  personality: ['😊', '🤔', '💭', '💫', '✨'],
  occasion: ['🎭', '👔', '🎉', '💼', '🌃'],
  greeting: ['👋', '✨', '🌟', '💫'],
  question: ['❓', '🤔', '💭']
};

// Configuración básica
const CONFIG = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 250,
  cacheMaxSize: 100,
  cacheTTL: 1000 * 60 * 60, // 1 hora en milisegundos
  defaultLanguage: 'es' as 'es' | 'en'
};

// Verificar clave API
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: No se ha encontrado OPENAI_API_KEY');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Crear caché para respuestas frecuentes
const responseCache = new LRUCache({
  max: CONFIG.cacheMaxSize,
  ttl: CONFIG.cacheTTL
});

// Selecciona un emoticón aleatorio de una categoría
function getRandomEmoji(category: keyof typeof EMOJIS): string {
  const emojis = EMOJIS[category];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Maneja la selección inicial de idioma
export function handleLanguageSelection(selectedLanguage: string): string {
  if (selectedLanguage.toLowerCase() === 'español') {
    return `¡Hola! ${getRandomEmoji('greeting')} Soy AROMASENS, tu asesor personal de perfumes. Para ayudarte a encontrar la fragancia perfecta, ¿podrías compartirme tu edad?`;
  } else {
    return `Hello! ${getRandomEmoji('greeting')} I'm AROMASENS, your personal fragrance advisor. To help you find the perfect scent, could you share your age with me?`;
  }
}

// Genera un perfil psicológico y recomendación de perfume
export async function generatePerfumeProfile(
  preferences: any, 
  conversationHistory: ChatCompletionMessageParam[] = []
): Promise<any> {
  try {
    // Verificar si la respuesta está en caché
    const cacheKey = `profile:${JSON.stringify(preferences)}:${JSON.stringify(conversationHistory)}`;
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const prompt = `
    Eres AROMASENS, un asesor experto en perfumería de lujo.

    ## INFORMACIÓN DEL CLIENTE
    - Género: ${preferences.gender || 'No especificado'}
    - Edad: ${preferences.age || 'No especificado'}
    - Experiencia: ${preferences.experience || 'No especificado'}
    - Ocasión: ${preferences.occasion || 'No especificado'}
    - Preferencias: ${preferences.preferences || 'No especificado'}
    - Personalidad: ${preferences.personality || 'No especificado'}

    ## INSTRUCCIONES
    1. Analiza el perfil psicológico basado en los datos proporcionados.
    2. Selecciona una fragancia específica (ID entre 1-20) que mejor se adapte.
    3. Sé conciso pero informativo.

    Devuelve ÚNICAMENTE un objeto JSON con:
    {
      "psychologicalProfile": "Análisis psicológico breve",
      "recommendedPerfumeId": número entre 1 y 20,
      "recommendationReason": "Explicación concisa en formato markdown"
    }
    `;

    // Preparar mensajes para la API
    const messages: ChatCompletionMessageParam[] = [
      { 
        role: 'system', 
        content: 'Eres AROMASENS, un asesor de perfumería conciso.' 
      },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    const response = await openai.chat.completions.create({
      model: CONFIG.model,
      messages,
      response_format: { type: 'json_object' },
      temperature: CONFIG.temperature,
      max_tokens: CONFIG.maxTokens
    });
    
    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    
    // Guardar en caché
    responseCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error generando perfil:', error);
    throw new Error('Error al generar perfil: ' + (error as Error).message);
  }
}

// Función para generar respuestas de chat
export async function generateChatResponse(
  prompt: string, 
  language: 'es' | 'en' = CONFIG.defaultLanguage,
  conversationHistory: ChatCompletionMessageParam[] = []
): Promise<string> {
  try {
    // Verificar si la respuesta está en caché
    const cacheKey = `chat:${language}:${prompt}:${JSON.stringify(conversationHistory)}`;
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse as string;
    }

    const systemPrompt = language === 'es' 
      ? 'Eres un asistente amigable de tienda de perfumes. Mantén tus respuestas concisas y en español.'
      : 'You are a friendly perfume store assistant. Keep your responses concise and in English.';

    const response = await openai.chat.completions.create({
      model: CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: prompt }
      ],
      temperature: CONFIG.temperature,
      max_tokens: CONFIG.maxTokens
    });

    const content = response.choices[0].message.content || 
      (language === 'es' 
        ? "Lo siento, no pude generar una respuesta." 
        : "Sorry, I couldn't generate a response.");
    
    // Guardar en caché
    responseCache.set(cacheKey, content);
    
    return content;
  } catch (error) {
    console.error('Error generando respuesta de chat:', error);
    return language === 'es'
      ? `Lo siento ${getRandomEmoji('question')}, estoy teniendo problemas para procesar tu mensaje. ¿Podrías intentarlo de nuevo?`
      : `Sorry ${getRandomEmoji('question')}, I'm having trouble processing your message. Could you try again?`;
  }
}

