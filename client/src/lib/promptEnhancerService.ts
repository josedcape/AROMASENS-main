
import { apiRequest } from "./queryClient";

/**
 * Servicio para mejorar prompts de usuario con IA
 */
export async function enhancePrompt(prompt: string, language: 'es' | 'en' = 'es'): Promise<string> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/chat/enhance-prompt",
      { prompt, language }
    );
    
    const data = await response.json();
    return data.enhancedPrompt || prompt;
  } catch (error) {
    console.error("Error al mejorar el prompt:", error);
    return prompt; // En caso de error, devolver el prompt original
  }
}
