import { apiRequest } from "./queryClient";
import { ChatStep, type ChatState, type ApiResponse } from "./types";
import { AIModel } from "./aiService";

export async function startChat(gender: string, model: AIModel = 'openai', language: 'es' | 'en' = 'es'): Promise<ApiResponse> {
  const response = await apiRequest("POST", "/api/chat/start", { gender, model, language });
  return await response.json();
}

export async function sendMessage(
  message: string, 
  gender: string, 
  step: ChatStep,
  model: AIModel = 'openai',
  language: 'es' | 'en' = 'es',
  sessionId?: string
): Promise<ApiResponse> {
  const response = await apiRequest(
    "POST", 
    "/api/chat/message", 
    { message, gender, step, model, language, sessionId }
  );
  return await response.json();
}

export async function getRecommendation(chatState: ChatState, model: AIModel = 'openai', language: 'es' | 'en' = 'es'): Promise<ApiResponse> {
  const { userResponses } = chatState;

  try {
    const response = await apiRequest(
      "POST", 
      "/api/chat/recommendation", 
      { 
        gender: userResponses.gender,
        age: userResponses.age,
        experience: userResponses.experience,
        occasion: userResponses.occasion,
        preferences: userResponses.preferences,
        model,
        language
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error al obtener recomendación:", error);

    // Crear una recomendación de respaldo en caso de error
    return {
      recommendation: {
        id: "fallback-perfume-1",
        name: "Aroma Sensual",
        brand: "AROMASENS",
        gender: userResponses.gender || "unisex",
        description: "Una fragancia cautivadora con notas cítricas y amaderadas que evoca sensaciones de frescura y elegancia.",
        imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop",
        price: 89.99,
        notes: ["Cítrico", "Amaderado", "Floral", "Especiado"],
        occasions: ["Casual", "Formal"],
        intensity: "Media",
        longevity: "8-10 horas",
        season: "Primavera/Verano"
      },
      message: language === 'en' 
        ? "Based on your preferences, I recommend Aroma Sensual. This fragrance combines citrus and woody notes for a fresh and elegant experience."
        : "Basado en tus preferencias, te recomiendo Aroma Sensual. Esta fragancia combina notas cítricas y amaderadas para una experiencia fresca y elegante."
    };
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ChatStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface ChatPreferences {
  preferences: string; // Primero: preferencias de fragancias
  age: string;         // Segundo: edad
  experience: string;  // Tercero: experiencia con perfumes
  occasion: string;    // Cuarto: ocasiones de uso
}