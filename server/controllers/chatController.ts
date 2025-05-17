import { Request, Response } from "express";
import { 
  sendMessageSchema, 
  chatPreferencesSchema,
  startChatSchema
} from "@shared/schema";
import { startChatSession, processUserMessage, generateRecommendation } from "../services/perfumeService";
import { AIModel } from "../services/ai.service";
import OpenAI from "openai";

export async function handleStartChat(req: Request, res: Response) {
  try {
    const { gender, model = 'openai', language = 'es' } = req.body;

    // Validamos el género con el esquema
    const validatedData = startChatSchema.parse({ gender });

    // Validamos el modelo de IA
    const validModel = validateAIModel(model);

    // Validamos el idioma
    const validLanguage = validateLanguage(language);

    // Iniciamos la sesión con el modelo e idioma seleccionados
    const response = await startChatSession(validatedData.gender, validModel, validLanguage);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(400).json({ message: error.message || "Failed to start chat" });
  }
}

export async function handleSendMessage(req: Request, res: Response) {
  try {
    const { message, gender, step, model = 'openai', language = 'es', sessionId } = req.body;

    // Validar datos básicos
    if (!message || !gender || step === undefined) {
      return res.status(400).json({ message: "Message, gender and step are required" });
    }

    // Procesar el mensaje con manejo de errores mejorado
    try {
      const response = await processUserMessage(
        message,
        gender,
        step,
        model as AIModel,
        language as 'es' | 'en',
        sessionId
      );

      return res.status(200).json(response);
    } catch (processError) {
      console.error("Error processing user message:", processError);

      // Proporcionar una respuesta de respaldo en caso de error
      const fallbackResponse = {
        message: language === 'en' 
          ? "I'm sorry, I'm having trouble processing your message. Let's continue with the next question."
          : "Lo siento, estoy teniendo problemas para procesar tu mensaje. Continuemos con la siguiente pregunta.",
        quickResponses: [],
        step: step + 1,
        isComplete: false,
        sessionId
      };

      return res.status(200).json(fallbackResponse);
    }
  } catch (error) {
    console.error("Error in handleSendMessage:", error);
    return res.status(500).json({ message: "Failed to process user message" });
  }
}

export async function handleGetRecommendation(req: Request, res: Response) {
  try {
    const { gender, age, experience, occasion, preferences, model = 'openai', language = 'es' } = req.body;

    // Validar el modelo de IA
    const validatedModel = validateAIModel(model);

    // Verificar si estamos en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log("Generando recomendación de prueba en modo desarrollo");

      // Crear una recomendación de prueba
      const mockRecommendation = {
        recommendation: {
          id: "mock-perfume-1",
          name: "Aroma Sensual",
          brand: "AROMASENS",
          gender: gender || "unisex",
          description: "Una fragancia cautivadora con notas cítricas y amaderadas que evoca sensaciones de frescura y elegancia.",
          imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop",
          price: 89.99,
          notes: ["Cítrico", "Amaderado", "Floral", "Especiado"],
          occasions: ["Casual", "Formal"],

export async function handleEnhancePrompt(req: Request, res: Response) {
  try {
    const { prompt, language = 'es' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Validar el idioma
    const validLanguage = language === 'es' || language === 'en' ? language : 'es';
    
    // Usar OpenAI para mejorar el prompt
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: validLanguage === 'es' 
              ? "Eres un asistente especializado en mejorar preguntas para un chatbot de perfumería AROMASENS. Tu tarea es reformular y enriquecer el prompt del usuario para que sea más claro, específico y aporte información relevante para la recomendación de perfumes."
              : "You are an assistant specialized in improving questions for an AROMASENS perfumery chatbot. Your task is to reformulate and enrich the user's prompt to make it clearer, more specific, and provide relevant information for perfume recommendations."
          },
          {
            role: "user",
            content: validLanguage === 'es'
              ? `Mejora este mensaje para un asistente de perfumería, añadiendo detalles relevantes sin cambiar la intención original: "${prompt}"`
              : `Enhance this message for a perfumery assistant, adding relevant details without changing the original intent: "${prompt}"`
          }
        ]
      });

      if (response.choices[0].message.content) {
        return res.status(200).json({ 
          enhancedPrompt: response.choices[0].message.content 
        });
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (aiError) {
      console.error("Error enhancing prompt with AI:", aiError);
      // En caso de error, devolver el prompt original
      return res.status(200).json({ enhancedPrompt: prompt });
    }
  } catch (error) {
    console.error("Error in handleEnhancePrompt:", error);
    return res.status(500).json({ 
      message: "Failed to enhance prompt",
      enhancedPrompt: req.body.prompt // Devolver el prompt original como fallback
    });
  }
}

          intensity: "Media",
          longevity: "8-10 horas",
          season: "Primavera/Verano"
        },
        message: language === 'en' 
          ? "Based on your preferences, I recommend Aroma Sensual. This fragrance combines citrus and woody notes for a fresh and elegant experience."
          : "Basado en tus preferencias, te recomiendo Aroma Sensual. Esta fragancia combina notas cítricas y amaderadas para una experiencia fresca y elegante."
      };

      return res.status(200).json(mockRecommendation);
    }

    // Si no estamos en modo desarrollo, continuar con el proceso normal
    const recommendation = await getPerfumeRecommendation(
      {
        gender,
        age,
        experience,
        occasion,
        preferences
      },
      validatedModel,
      language
    );

    res.status(200).json(recommendation);
  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(400).json({ message: error.message || "Failed to generate recommendation" });
  }
}

// Función auxiliar para validar el modelo de IA
function validateAIModel(model: string): AIModel {
  const validModels: AIModel[] = ['openai', 'anthropic', 'gemini'];

  if (!validModels.includes(model as AIModel)) {
    console.warn(`Modelo de IA inválido: ${model}, usando openai por defecto`);
    return 'openai';
  }

  return model as AIModel;
}

// Función auxiliar para validar el idioma
function validateLanguage(language: string): 'es' | 'en' {
  if (language !== 'es' && language !== 'en') {
    console.warn(`Idioma inválido: ${language}, usando español por defecto`);
    return 'es';
  }

  return language as 'es' | 'en';
}