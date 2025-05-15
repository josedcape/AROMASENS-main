import { generateChatResponse as openAIGenerateChatResponse, handleLanguageSelection, generatePerfumeProfile as openAIGeneratePerfumeProfile } from './openai.service.clean';
import * as anthropicService from './anthropic.service';
import * as geminiService from './gemini.service';
import { ChatCompletionMessageParam } from 'openai/resources';

export type AIModel = 'openai' | 'anthropic' | 'gemini';

// Genera una respuesta de chat según el modelo elegido
export async function generateChatResponse(
  prompt: string, 
  model: string = 'openai',
  language: 'es' | 'en' = 'es',
  conversationHistory: ChatCompletionMessageParam[] = []
): Promise<string> {
  try {
    console.log(`Generando respuesta de chat con el modelo ${model}`);

    switch (model) {
      case 'openai':
        return await openAIGenerateChatResponse(prompt, language, conversationHistory);
      case 'anthropic':
        return await anthropicService.generateChatResponse(prompt);
      case 'gemini':
        return await geminiService.generateChatResponse(prompt);
      default:
        // Por defecto usamos OpenAI
        console.log("Usando modelo de respaldo: openai");
        return await openAIGenerateChatResponse(prompt, language, conversationHistory);
    }
  } catch (error) {
    console.error(`Error con el modelo ${model}:`, error);
    return language === 'es'
      ? "Lo siento, estoy teniendo problemas para procesar tu mensaje. ¿Podrías intentarlo de nuevo?"
      : "Sorry, I'm having trouble processing your message. Could you try again?";
  }
}

// Genera un perfil psicológico y recomendación de perfume
export async function generatePerfumeProfile(
  preferences: any,
  model: string = 'openai',
  conversationHistory: ChatCompletionMessageParam[] = []
): Promise<any> {
  try {
    console.log(`Generando perfil con el modelo ${model}`);

    switch (model) {
      case 'openai':
        return await openAIGeneratePerfumeProfile(preferences, conversationHistory);
      case 'anthropic':
        return await anthropicService.generatePerfumeProfile(preferences);
      case 'gemini':
        return await geminiService.generatePerfumeProfile(preferences);
      default:
        // Por defecto usamos OpenAI
        console.log("Usando modelo de respaldo: openai");
        return await openAIGeneratePerfumeProfile(preferences, conversationHistory);
    }
  } catch (error) {
    console.error(`Error con el modelo ${model}:`, error);
    throw new Error(`Error al generar perfil: ${(error as Error).message}`);
  }
}

// Exportamos también la función de selección de idioma
export { handleLanguageSelection };


// Iniciar chat
export async function startChatService(gender: string, model: string, language: string = 'es'): Promise<any> {
  try {
    const serviceToUse = getAIServiceByModel(model);

    const welcomeMessage = language === 'es' 
      ? `¡Hola! Para ayudarte a encontrar tu perfume ideal, ¿podrías decirme cuál es tu rango de edad?`
      : `Hello! To help you find your ideal perfume, could you tell me what your age range is?`;

    // Sugerencias de respuesta rápida para la edad
    const quickResponses = language === 'es'
      ? ["18-25 años", "26-35 años", "36-45 años", "46+ años"]
      : ["18-25 years", "26-35 years", "36-45 years", "46+ years"];

    return {
      message: welcomeMessage,
      quickResponses: quickResponses,
      step: 0 // Explícitamente comenzamos en el paso 0 (pregunta de edad)
    };
  } catch (error) {
    console.error("Error starting chat:", error);
    throw new Error(`Failed to start chat: ${error.message}`);
  }
}

export async function sendMessageService(message: string, gender: string, step: number, model: string, language: string = 'es'): Promise<any> {
  try {
    const serviceToUse = getAIServiceByModel(model);

    // Lógica básica para simular un flujo de conversación
    let response = '';
    let quickResponses: string[] = [];
    let isComplete = false;

    // Verificar que el mensaje de edad no esté vacío
    if (step === 0) {  // Pregunta sobre edad
      // Si el mensaje está vacío o no contiene información de edad válida
      if (!message || message.trim() === '') {
        // Repetir la pregunta sobre la edad
        response = language === 'es'
          ? 'Es importante que conozca tu rango de edad para ofrecerte las mejores recomendaciones. ¿Podrías decirme en qué rango de edad te encuentras?'
          : 'It\'s important that I know your age range to offer you the best recommendations. Could you tell me what age range you are in?';

        quickResponses = language === 'es'
          ? ["18-25 años", "26-35 años", "36-45 años", "46+ años"]
          : ["18-25 years", "26-35 years", "36-45 years", "46+ years"];

        // No avanzamos al siguiente paso
        return { message: response, quickResponses, isComplete: false, step: 0 };
      }

      // Si tenemos información de edad, continuamos al siguiente paso
      response = language === 'es'
        ? '¿Tienes alguna preferencia en cuanto a tipo de fragancia? Por ejemplo, ¿cítrica, floral, amaderada o especiada?'
        : 'Do you have any preference regarding fragrance type? For example, citrusy, floral, woody, or spicy?';

      quickResponses = language === 'es'
        ? ['Cítrica', 'Floral', 'Amaderada', 'Especiada', 'No tengo preferencia']
        : ['Citrusy', 'Floral', 'Woody', 'Spicy', 'No preference'];
return { message: response, quickResponses, isComplete: false, step: 1 };
    }

    if (step === 1) {  // Pregunta sobre tipo de fragancia
      response = language === 'es'
        ? '¿Qué tipo de intensidad prefieres? (Suave, Moderada, Fuerte)'
        : 'What kind of intensity do you prefer? (Light, Moderate, Strong)';

      quickResponses = language === 'es'
        ? ['Suave', 'Moderada', 'Fuerte']
        : ['Light', 'Moderate', 'Strong'];

      return { message: response, quickResponses, isComplete: false, step: 2 };
    }

    if (step === 2) {  // Pregunta sobre la intensidad
      response = language === 'es'
        ? '¿Hay alguna nota en particular que te guste o disguste en un perfume?'
        : 'Is there any note in particular that you like or dislike in a perfume?';

      quickResponses = language === 'es'
        ? ['Me gusta la nota de vainilla', 'No me gusta la nota de rosas', 'Sin preferencia']
        : ['I like vanilla notes', 'I dislike rose notes', 'No preference'];

      return { message: response, quickResponses, isComplete: false, step: 3 };
    }

    if (step === 3) {
      response = language === 'es'
        ? '¡Perfecto! Estoy generando algunas recomendaciones basadas en tus preferencias...'
        : 'Perfect! I am generating some recommendations based on your preferences...';
      isComplete = true;

      return { message: response, quickResponses: [], isComplete, step: 4 };
    }


    return { message: '...', quickResponses: [], isComplete: false };

  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

function getAIServiceByModel(model: string) {
  switch (model) {
    case 'openai':
      return openAIGenerateChatResponse;
    case 'anthropic':
      return anthropicService.generateChatResponse;
    case 'gemini':
      return geminiService.generateChatResponse;
    default:
      return openAIGenerateChatResponse; // OpenAI como fallback
  }
}
