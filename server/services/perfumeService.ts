import { storage } from "../storage";
import { 
  type Perfume, type ChatPreferences, type ChatResponse,
  type InsertChatSession, type InsertRecommendation
} from "@shared/schema";
import { generatePerfumeProfile, generateChatResponse } from "./ai.service";
// Eliminada la importación de generateRecommendationResponse que no existe

// Constantes para mejorar mantenibilidad
const LANGUAGE_OPTIONS = {
  es: {
    completion: "¡Gracias por tus respuestas! Basándome en tu perfil y preferencias, ya tengo una recomendación perfecta para ti.",
    steps: {
      1: "Pregunta sobre su experiencia con perfumes y sus favoritos.",
      2: "Pregunta sobre las ocasiones para las que quiere el perfume.",
      3: "Pregunta sobre sus notas o tipos de fragancias preferidas.",
      4: "Pregunta sobre sus rasgos de personalidad para crear un perfil psicológico.",
      5: "Agradece sus respuestas y hazle saber que le proporcionarás una recomendación."
    }
  },
  en: {
    completion: "Thank you for your answers! Based on your profile and preferences, I now have the perfect recommendation for you.",
    steps: {
      1: "Ask about their experience with perfumes and their favorites.",
      2: "Ask about the occasions for which they want the perfume.",
      3: "Ask about their preferred notes or types of fragrances.",
      4: "Ask about their personality traits to create a psychological profile.",
      5: "Thank them for their answers and let them know you'll provide a recommendation."
    }
  }
};

const QUICK_RESPONSES = {
  0: ["Florales", "Frutales", "Amaderadas", "Orientales/especiadas", "Cítricas", "Dulces"],
  1: ["18-25 años", "26-35 años", "36-45 años", "46-55 años", "56+ años"],
  2: ["Principiante", "Uso ocasional", "Entusiasta", "Coleccionista", "Experto"],
  3: ["Uso diario", "Eventos formales", "Citas románticas", "Reuniones sociales", "Trabajo"],
  4: ["Introvertido/a", "Extrovertido/a", "Romántico/a", "Aventurero/a", "Tranquilo/a", "Sofisticado/a"]
};

// Función auxiliar para manejo de errores
const handleError = (operation: string, error: unknown): never => {
  console.error(`Error ${operation}:`, error);
  throw new Error(`Failed to ${operation}`);
};

// Almacenamiento de conversaciones en memoria para persistencia
const conversationStore: Record<string, string[]> = {};

/**
 * Obtiene perfumes por género
 */
export async function getPerfumesByGender(gender: string): Promise<Perfume[]> {
  try {
    return await storage.getPerfumes(gender);
  } catch (error) {
    return handleError("get perfumes by gender", error);
  }
}

/**
 * Inicia una sesión de chat
 */
export async function startChatSession(
  gender: string, 
  model: string = 'openai', 
  language: 'es' | 'en' = 'es'
): Promise<ChatResponse> {
  try {
    // Crear un ID de sesión único
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Inicializar la conversación vacía
    conversationStore[sessionId] = [];

    // Generar el mensaje inicial usando el nuevo sistema de chat
    const initialMessage = await generateChatResponse("Hola, quiero un perfume", []);

    // Guardar el mensaje inicial en el historial
    conversationStore[sessionId].push("Hola, quiero un perfume");
    conversationStore[sessionId].push(initialMessage);

    return {
      sessionId,
      message: initialMessage,
      step: 0,
    };
  } catch (error) {
    return handleError("start chat session", error);
  }
}

/**
 * Procesa un mensaje del usuario y genera la siguiente respuesta
 */
export async function processUserMessage(
  message: string,
  gender: string,
  step: number,
  model: string = 'openai',
  language: 'es' | 'en' = 'es',
  sessionId?: string
): Promise<ChatResponse> {
  try {
    // Verificar si tenemos un historial de conversación para esta sesión
    const conversationHistory = sessionId && conversationStore[sessionId] ? 
      [...conversationStore[sessionId]] : [];

    // Añadir el mensaje actual del usuario al historial
    conversationHistory.push(message);

    // Usar el nuevo sistema de generación de respuestas con seguimiento de conversación
    const aiResponse = await generateChatResponse(message, conversationHistory);

    // Añadir la respuesta del asistente al historial
    conversationHistory.push(aiResponse);

    // Actualizar el historial en el almacén
    if (sessionId) {
      conversationStore[sessionId] = conversationHistory;
    }

    // Determinar si la conversación está completa analizando la respuesta
    const isComplete = aiResponse.includes("¡Gracias por tus respuestas!") || 
                      aiResponse.includes("Thank you for your answers") ||
                      step >= 5;

    // Obtener respuestas rápidas para el paso actual si existen y no estamos en el paso final
    const quickResponses = !isComplete ? QUICK_RESPONSES[(step + 1) as keyof typeof QUICK_RESPONSES] : undefined;

    return {
      message: aiResponse,
      quickResponses,
      step: isComplete ? step : step + 1,
      isComplete,
      sessionId
    };
  } catch (error) {
    return handleError("process user message", error);
  }
}

/**
 * Extrae las preferencias del usuario del historial de conversación
 */
async function extractPreferencesFromConversation(sessionId: string): Promise<ChatPreferences> {
  try {
    const conversationHistory = conversationStore[sessionId] || [];

    // Usar el modelo para extraer las preferencias del usuario
    const prompt = `
    Analiza esta conversación entre un usuario y un asistente de perfumería:

    ${conversationHistory.join("\n\n")}

    Extrae la siguiente información del usuario (si está disponible):
    - gender: género para el que busca perfume (masculino/femenino/unisex)
    - age: edad aproximada (número)
    - experience: nivel de experiencia con perfumes (principiante/intermedio/experto)
    - occasion: ocasión para la que busca el perfume
    - preferences: preferencias olfativas o de personalidad
    - personality: rasgos de personalidad mencionados

    Responde SOLO en formato JSON con los campos que hayas podido identificar:
    `;

    // Esta función sería similar a extractUserProfile en el código anterior
    // Aquí simplificamos asumiendo que tenemos una función que hace esto
    const preferences = await generatePerfumeProfile({ prompt } as any, conversationHistory);

    return {
      gender: preferences.gender || 'unisex',
      age: preferences.age || 30,
      experience: preferences.experience || 'intermedio',
      occasion: preferences.occasion || 'casual',
      preferences: preferences.preferences || '',
      personality: preferences.personality || ''
    };
  } catch (error) {
    console.error('Error extrayendo preferencias:', error);
    return {
      gender: 'unisex',
      age: 30,
      experience: 'intermedio',
      occasion: 'casual',
      preferences: '',
      personality: ''
    };
  }
}

/**
 * Genera una recomendación de perfume basada en las preferencias del usuario
 */
export async function generateRecommendation(
  gender: string,
  sessionId: string,
  model: string = 'openai',
  language: 'es' | 'en' = 'es'
): Promise<ChatResponse> {
  try {
    // Obtener perfumes disponibles
    const perfumes = await storage.getPerfumes(gender);
    if (!perfumes.length) {
      throw new Error(`No perfumes found for gender: ${gender}`);
    }

    // Extraer preferencias del historial de conversación
    const preferences = await extractPreferencesFromConversation(sessionId);

    // Generar perfil de perfume basado en preferencias
    const perfumeProfile = await generatePerfumeProfile(preferences, conversationStore[sessionId]);

    // Asegurar que el perfume recomendado esté disponible
    const availablePerfumeIds = perfumes.map(p => p.id);
    let recommendedPerfumeId = perfumeProfile.recommendedPerfumeId;
    if (!availablePerfumeIds.includes(recommendedPerfumeId)) {
      recommendedPerfumeId = availablePerfumeIds[0];
    }

    // Obtener datos del perfume recomendado
    const recommendedPerfume = await storage.getPerfume(recommendedPerfumeId);
    if (!recommendedPerfume) {
      throw new Error(`Recommended perfume not found: ${recommendedPerfumeId}`);
    }

    // Crear sesión de chat y guardar recomendación en la base de datos
    const chatSession = await storage.createChatSession({
      user_id: null,
      gender,
      preferences
    } as InsertChatSession);

    await storage.createRecommendation({
      chat_session_id: chatSession.id,
      perfume_id: recommendedPerfume.id,
      reason: perfumeProfile.recommendationReason
    } as InsertRecommendation);

    // Generar un mensaje de recomendación personalizado basado en el perfil y preferencias
    const recommendationMessage = language === 'es'
      ? `Basándome en tu perfil único, he seleccionado especialmente para ti "${recommendedPerfume.name}" de AROMASENS. ${perfumeProfile.recommendationReason || "Este perfume captura perfectamente tu esencia."}`
      : `Based on your unique profile, I've specially selected "${recommendedPerfume.name}" by AROMASENS for you. ${perfumeProfile.recommendationReason || "This perfume perfectly captures your essence."}`;

    // Devolver respuesta con la recomendación
    return {
      sessionId: chatSession.id.toString(),
      message: recommendationMessage,
      isComplete: true,
      recommendation: {
        perfumeId: recommendedPerfume.id,
        brand: recommendedPerfume.brand,
        name: recommendedPerfume.name,
        description: `${perfumeProfile.recommendationReason} ${recommendedPerfume.description || ''}`,
        imageUrl: recommendedPerfume.image_url,
        notes: recommendedPerfume.notes,
        occasions: recommendedPerfume.occasions ? recommendedPerfume.occasions.join(', ') : '',
        psychologicalProfile: perfumeProfile.psychologicalProfile
      }
    };
  } catch (error) {
    return handleError("generate recommendation", error);
  }
}

/**
 * Limpia los recursos de una sesión cuando ya no es necesaria
 */
export function cleanupSession(sessionId: string): void {
  if (conversationStore[sessionId]) {
    delete conversationStore[sessionId];
  }
}