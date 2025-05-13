
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
    console.log("Enviando datos al webhook:", userData);
    
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      console.error('Error al enviar datos al webhook:', response.status, response.statusText);
    } else {
      console.log('Datos enviados correctamente al webhook');
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

