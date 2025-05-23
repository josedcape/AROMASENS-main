
/**
 * Servicio para enviar datos a webhooks externos
 */

// URL del webhook de Make
const MAKE_WEBHOOK_URL = "https://hook.us1.make.com/apcwekw3rgkm0uq5mmx1pmqf9o6j2okq";

/**
 * Envía la información del chat a un webhook externo
 * @param userData Datos del usuario y sus respuestas
 * @returns Promise con el resultado de la operación
 */
export async function sendUserDataToWebhook(userData: any): Promise<Response> {
  try {
    console.log("Enviando datos al webhook de AROMASENS:", userData);
    
    // Extraer la última respuesta del asistente si existe
    let lastAssistantMessage = "";
    if (userData.lastAssistantMessage) {
      lastAssistantMessage = userData.lastAssistantMessage;
    }
    
    // Añadimos información adicional
    const dataToSend = {
      ...userData,
      lastAssistantMessage,
      source: "aromasens-perfume-advisor",
      timestamp: new Date().toISOString(),
      appVersion: "1.1.0",
      service: "AROMASENS Perfume Advisor",
      conversationComplete: true
    };
    
    // Mostrar mensaje de registro detallado
    console.log(`Enviando datos de conversación a AROMASENS (${dataToSend.timestamp})`);
    
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'aromasens-advisor',
        'X-Request-Time': new Date().toISOString()
      },
      body: JSON.stringify(dataToSend),
    });
    
    if (!response.ok) {
      console.error('Error al enviar datos al webhook de AROMASENS:', response.status, response.statusText);
    } else {
      console.log('✅ Datos enviados correctamente al webhook de AROMASENS');
    }
    
    return response;
  } catch (error) {
    console.error('Error al enviar datos al webhook:', error);
    throw error;
  }
}

/**
 * Envía una notificación de feedback al webhook
 * @param feedbackData Datos de feedback del usuario
 * @returns Promise con el resultado de la operación
 */
export async function sendFeedbackToWebhook(feedbackData: any): Promise<Response> {
  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'feedback',
        ...feedbackData
      }),
    });
    
    return response;
  } catch (error) {
    console.error('Error al enviar feedback al webhook:', error);
    throw error;
  }
}

