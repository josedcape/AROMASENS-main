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





