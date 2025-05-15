import { useState, useEffect, useRef, FormEvent } from "react";
import { useLocation } from "wouter";
import { useChatContext } from "@/context/ChatContext";
import { useAISettings } from "@/context/AISettingsContext";
import { ChatStep } from "@/lib/types";
import { startChat, sendMessage, getRecommendation, sleep } from "@/lib/chatHelpers";
import { Send, Bot, User, Sparkles, ArrowUpRight, Clipboard } from "lucide-react";
import logoImg from "@/assets/aromasens-logo.png";
import SpeechRecognitionButton from "@/components/SpeechRecognitionButton";
import TextToSpeechControls from "@/components/TextToSpeechControls";
import { getMessages } from "@/lib/aiService";
import { sendUserDataToWebhook } from "@/lib/webhookService";

export default function ChatInterface() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useChatContext();
  const { settings, setLanguage, ttsSettings, speakText } = useAISettings();
  const [userInput, setUserInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Obtener los mensajes según el idioma seleccionado
  const messages = getMessages(settings.language);

  // Función para desplazarse manualmente al principio de la conversación
  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Scroll to bottom whenever messages change or when el input recibe focus
  useEffect(() => {
    if (messagesEndRef.current) {
      // Usamos requestAnimationFrame para un scroll más confiable
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }

    // Leer en voz alta el último mensaje del asistente si TTS está activado
    if (ttsSettings.enabled && state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Limpiar el texto para TTS (eliminar markdown y otros símbolos)
        const cleanText = lastMessage.content
          .replace(/\*\*(.*?)\*\*/g, '$1') // Eliminar negrita
          .replace(/\*(.*?)\*/g, '$1')     // Eliminar cursiva
          .replace(/`(.*?)`/g, '$1')       // Eliminar formato de código
          .replace(/- /g, ', ');           // Convertir viñetas en comas

        // Usar el servicio de TTS
        speakText(cleanText);
      }
    }
  }, [state.messages, ttsSettings.enabled, speakText]);

  // Ya no redirigimos automáticamente, el usuario decidirá cuándo ir a la página de recomendaciones
  useEffect(() => {
    if (state.isConversationComplete && state.sessionId) {
      console.log("Conversación completa, esperando acción del usuario...", state.sessionId);
      // No hacemos redirección automática, el usuario usará los botones
    }
  }, [state.isConversationComplete, state.sessionId]);

  // Initialize chat when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      if (state.selectedGender && state.messages.length === 0) {
        try {
          dispatch({ type: "SET_TYPING", payload: true });

          // Si no se ha seleccionado idioma, mostrar mensaje de selección de idioma
          if (!state.selectedLanguage) {
            await sleep(500);
            dispatch({
              type: "ADD_MESSAGE",
              payload: { 
                role: "assistant", 
                content: "👋 ¡Hola! Hello! ¿En qué idioma prefieres comunicarte? / In which language would you prefer to communicate?" 
              },
            });

            // Ofrecer opciones rápidas para seleccionar idioma
            dispatch({ 
              type: "SET_QUICK_RESPONSES", 
              payload: ["Español", "English"] 
            });

            dispatch({ type: "SET_TYPING", payload: false });
            return;
          }

          // Si ya se seleccionó el idioma, iniciar el chat normal
          const response = await startChat(state.selectedGender, settings.model, state.selectedLanguage);

          await sleep(1000); // Simulate typing delay

          dispatch({
            type: "ADD_MESSAGE",
            payload: { role: "assistant", content: response.message },
          });

          if (response.quickResponses) {
            dispatch({ type: "SET_QUICK_RESPONSES", payload: response.quickResponses });
          }

          dispatch({ type: "SET_TYPING", payload: false });
        } catch (error) {
          console.error("Failed to initialize chat:", error);
          dispatch({ type: "SET_TYPING", payload: false });

          // Mensaje de error en ambos idiomas
          dispatch({
            type: "ADD_MESSAGE",
            payload: { 
              role: "assistant", 
              content: "Lo siento, hubo un problema al iniciar la conversación. Por favor, inténtalo de nuevo. / Sorry, there was a problem starting the conversation. Please try again." 
            },
          });
        }
      }
    };

    initializeChat();
  }, [state.selectedGender, state.messages.length, state.selectedLanguage, dispatch, settings.model]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || !userInput.trim()) return;

    setIsProcessing(true);

    // Agregar mensaje del usuario
    dispatch({
      type: "ADD_MESSAGE",
      payload: { role: "user", content: userInput },
    });

    // Caso especial para selección de idioma
    if (!state.selectedLanguage && state.messages.length === 1) {
      // Detectar idioma basado en la respuesta del usuario
      const detectedLanguage: 'es' | 'en' = 
        userInput.toLowerCase().includes('english') || 
        userInput.toLowerCase().includes('inglés') ? 'en' : 'es';

      // Establecer el idioma seleccionado
      dispatch({ type: "SET_LANGUAGE", payload: detectedLanguage });

      // Actualizar los ajustes de IA con el nuevo idioma
      setLanguage(detectedLanguage);

      // Clear input and set typing indicator
      setUserInput("");
      dispatch({ type: "SET_TYPING", payload: true });

      // Responder acorde al idioma seleccionado
      await sleep(1000);

      const welcomeMessage = detectedLanguage === 'en' 
        ? "Thank you! I'll communicate with you in English from now on. Let's continue with your perfume selection."
        : "¡Gracias! Me comunicaré contigo en español a partir de ahora. Continuemos con tu selección de perfume.";

      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: welcomeMessage },
      });

      try {
        // Iniciar el chat normal después de la selección de idioma
        await sleep(500);
        const response = await startChat(state.selectedGender, settings.model, detectedLanguage);

        await sleep(1000);

        dispatch({
          type: "ADD_MESSAGE",
          payload: { role: "assistant", content: response.message },
        });

        if (response.quickResponses) {
          dispatch({ type: "SET_QUICK_RESPONSES", payload: response.quickResponses });
        }
      } catch (error) {
        console.error("Error al iniciar el chat después de seleccionar idioma:", error);

        // Mensaje de error según el idioma seleccionado
        const errorMessage = detectedLanguage === 'en'
          ? "I'm having trouble connecting to our recommendation system. Let's continue anyway with some basic questions."
          : "Estoy teniendo problemas para conectarme a nuestro sistema de recomendaciones. Continuemos de todos modos con algunas preguntas básicas.";

        dispatch({
          type: "ADD_MESSAGE",
          payload: { role: "assistant", content: errorMessage },
        });

        // Proporcionar algunas respuestas rápidas genéricas
        dispatch({ 
          type: "SET_QUICK_RESPONSES", 
          payload: detectedLanguage === 'en' 
            ? ["I'm in my 20s", "I'm in my 30s", "I'm in my 40s or older"] 
            : ["Tengo entre 20 y 30 años", "Tengo entre 30 y 40 años", "Tengo 40 años o más"] 
        });
      }

      dispatch({ type: "SET_TYPING", payload: false });
      setIsProcessing(false);
      return;
    }

    // Proceso normal para mensajes después de selección de idioma
    // Store user response based on current step
    const responseKey = Object.keys(state.userResponses)[state.currentStep + 1]; // +1 because gender is already set
    dispatch({
      type: "SET_USER_RESPONSE",
      payload: { key: responseKey, value: userInput },
    });

    // Clear input and set typing indicator
    setUserInput("");
    dispatch({ type: "SET_TYPING", payload: true });

    await sleep(500); // Small delay before sending to API

    try {
      // Get response from API
      const response = await sendMessage(
        userInput,
        state.selectedGender,
        state.currentStep,
        settings.model,
        state.selectedLanguage
      );

      // Move to next step
      dispatch({ type: "SET_STEP", payload: (state.currentStep + 1) as ChatStep });

      // Add assistant message after a short delay
      await sleep(1000); // Simulate typing delay

      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: response.message },
      });

      // Set quick responses if provided
      if (response.quickResponses) {
        dispatch({ type: "SET_QUICK_RESPONSES", payload: response.quickResponses });
      } else {
        // Limpiar respuestas rápidas si no hay nuevas
        dispatch({ type: "SET_QUICK_RESPONSES", payload: [] });
      }

      // Check if chat is complete
      if (response.isComplete || state.currentStep >= ChatStep.COMPLETE) {
        // Generate recommendation
        await sleep(1000);

        // Mensaje de generación de recomendación
        const generatingMessage = state.selectedLanguage === 'en' 
          ? "I'm analyzing your profile and generating your personalized perfume recommendation now..." 
          : "Estoy analizando tu perfil y generando tu recomendación personalizada de perfume ahora mismo...";

        dispatch({ 
          type: "ADD_MESSAGE", 
          payload: { role: "assistant", content: generatingMessage } 
        });

        try {
          // Intentar obtener la recomendación
          const recommendation = await getRecommendation(state, settings.model, state.selectedLanguage);

          // Crear un resumen completo de la información del usuario
          const userSummary = state.selectedLanguage === 'en'
            ? `**Summary of your preferences**:\n- Gender: ${state.selectedGender === 'masculino' ? 'Male' : 'Female'}\n- Age group: ${state.userResponses.age || 'Not specified'}\n- Experience with fragrances: ${state.userResponses.experience || 'Not specified'}\n- Occasions: ${state.userResponses.occasion || 'Not specified'}\n- Preferences: ${state.userResponses.preferences || 'Not specified'}`
            : `**Resumen de tus preferencias**:\n- Género: ${state.selectedGender === 'masculino' ? 'Masculino' : 'Femenino'}\n- Grupo de edad: ${state.userResponses.age || 'No especificado'}\n- Experiencia con fragancias: ${state.userResponses.experience || 'No especificada'}\n- Ocasiones: ${state.userResponses.occasion || 'No especificadas'}\n- Preferencias: ${state.userResponses.preferences || 'No especificadas'}`;

          // Mensaje de éxito con el resumen antes de redirigir
          const successMessage = state.selectedLanguage === 'en'
            ? `Perfect! Based on your responses, I've found your ideal fragrance.\n\n${userSummary}\n\nYou can now view your personalized recommendation or share this information.`
            : `¡Perfecto! Basado en tus respuestas, he encontrado tu fragancia ideal.\n\n${userSummary}\n\nAhora puedes ver tu recomendación personalizada o compartir esta información.`;

          dispatch({ 
            type: "ADD_MESSAGE", 
            payload: { role: "assistant", content: successMessage } 
          });

          // Guardar la recomendación y marcar la conversación como completa
          if (recommendation.recommendation) {
            dispatch({ 
              type: "SET_RECOMMENDATION", 
              payload: recommendation.recommendation 
            });
          }

          // Guardar el ID de sesión si existe
          if (recommendation.sessionId) {
            dispatch({ 
              type: "SET_SESSION_ID", 
              payload: recommendation.sessionId 
            });
          }

          // Marcar la conversación como completa para mostrar los botones
          dispatch({ 
            type: "SET_CONVERSATION_COMPLETE", 
            payload: true 
          });
        } catch (error) {
          console.error("Error al generar recomendación:", error);

          // Mensaje de error
          const errorMessage = state.selectedLanguage === 'en'
            ? "I apologize, but I'm having trouble generating your recommendation. Let me try again..."
            : "Lo siento, estoy teniendo problemas para generar tu recomendación. Déjame intentarlo de nuevo...";

          dispatch({ 
            type: "ADD_MESSAGE", 
            payload: { role: "assistant", content: errorMessage } 
          });

          // Intentar con una recomendación de respaldo
          await sleep(1500);

          // Crear una recomendación de respaldo
          const fallbackRecommendation = {
            perfumeId: 1,
            brand: "AROMASENS",
            name: "Aroma Sensual",
            description: state.selectedLanguage === 'en'
              ? "A captivating fragrance with citrus and woody notes that evokes sensations of freshness and elegance."
              : "Una fragancia cautivadora con notas cítricas y amaderadas que evoca sensaciones de frescura y elegancia.",
            imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop",
            notes: ["Cítrico", "Amaderado", "Floral", "Especiado"],
            occasions: "Casual, Formal"
          };

          // Mensaje de éxito con la recomendación de respaldo
          const fallbackSuccessMessage = state.selectedLanguage === 'en'
            ? "I've found a perfect match for you! Let me show you..."
            : "¡He encontrado una combinación perfecta para ti! Déjame mostrarte...";

          dispatch({ 
            type: "ADD_MESSAGE", 
            payload: { role: "assistant", content: fallbackSuccessMessage } 
          });

          // Guardar la recomendación de respaldo
          dispatch({ 
            type: "SET_RECOMMENDATION", 
            payload: fallbackRecommendation 
          });

          // Crear un ID de sesión temporal
          const tempSessionId = `temp-${Date.now()}`;
          dispatch({ 
            type: "SET_SESSION_ID", 
            payload: tempSessionId 
          });

          // Marcar la conversación como completa para activar la redirección automática
          dispatch({ 
            type: "SET_CONVERSATION_COMPLETE", 
            payload: true 
          });
        }
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);

      // Mensaje de error según el idioma
      const errorMessage = state.selectedLanguage === 'en'
        ? "I apologize, but I'm having trouble processing your message. Let me try a different approach..."
        : "Lo siento, estoy teniendo problemas para procesar tu mensaje. Déjame intentar un enfoque diferente...";

      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: errorMessage },
      });

      // Proporcionar algunas respuestas genéricas para continuar la conversación
      const genericResponses = state.selectedLanguage === 'en'
        ? ["I prefer fresh scents", "I like sweet fragrances", "I enjoy woody notes"]
        : ["Prefiero aromas frescos", "Me gustan las fragancias dulces", "Disfruto de notas amaderadas"];

      dispatch({ type: "SET_QUICK_RESPONSES", payload: genericResponses });

      // Avanzar al siguiente paso de todos modos para no quedarse atascado
      dispatch({ type: "SET_STEP", payload: (state.currentStep + 1) as ChatStep });
    }

    dispatch({ type: "SET_TYPING", payload: false });
    setIsProcessing(false);
  };

  const handleQuickResponse = (response: string) => {
    // Si es selección de idioma y no hay idioma seleccionado
    if (!state.selectedLanguage && state.messages.length === 1 && 
        (response === "Español" || response === "English")) {
      const detectedLanguage: 'es' | 'en' = response === "English" ? 'en' : 'es';

      // Establecer el idioma directamente aquí
      dispatch({ type: "SET_LANGUAGE", payload: detectedLanguage });

      // Actualizar los ajustes de IA
      setLanguage(detectedLanguage);

      // Enviar el mensaje seleccionado
      setUserInput(response);
      handleSendMessage();
      return;
    }

    // Caso normal para otras respuestas rápidas
    setUserInput(response);
    handleSendMessage();
  };

  return (
    <div className="container mx-auto px-4 h-full flex flex-col pt-6 pb-10">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 logo-container overflow-hidden">
            <img 
              src={logoImg} 
              alt="AROMASENS Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl text-gradient font-bold mb-2">
          {messages.perfumeAssistant}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px bg-accent/30 w-12"></div>
          <h3 className="font-serif text-xl text-primary animate-pulse-subtle">
            {state.selectedGender === "femenino" ? messages.feminine : messages.masculine}
          </h3>
          <div className="h-px bg-accent/30 w-12"></div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <div className="glass-effect py-2 px-4 rounded-full inline-flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="text-foreground text-sm">
              {messages.idealPerfume}
            </p>
          </div>

          {/* Controles de síntesis de voz */}
          <TextToSpeechControls gender={state.selectedGender} />
        </div>
      </div>

      <div className="futuristic-card flex-grow flex flex-col max-w-3xl mx-auto w-full bg-card/90 backdrop-blur-md">
        {/* Chat Progress Indicator */}
        <div className="w-full px-4 py-3 border-b border-border/50">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-foreground/70">{messages.loading}</span>
            <span className="text-xs text-accent">
              {Math.min(state.currentStep + 1, 4)}/4
            </span>
          </div>
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${Math.min((state.currentStep + 1) / 4 * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-foreground/50 mt-1">
            <span>{messages.age}</span>
            <span>{messages.experience}</span>
            <span>{messages.occasion}</span>
            <span>{messages.preferences}</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="chat-container overflow-y-auto overflow-x-hidden flex-grow p-4 md:p-6 scrollbar-hide"
        >
          <div className="flex flex-col space-y-4 w-full">
            {state.messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex items-start ${
                  message.role === "user" ? "justify-end" : ""
                } animate-in fade-in-0 duration-300 ease-in-out w-full`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20 flex-shrink-0 mr-3">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div
                  className={`${
                    message.role === "user"
                      ? "bg-orange-200 border border-orange-300 text-black"
                      : "glass-effect bg-orange-100 text-black border border-orange-200"
                  } rounded-2xl py-3 px-4 max-w-[85%] shadow-md`}
                >
                  {message.role === "user" ? (
                    <div className="mb-1 text-xs font-semibold text-orange-600 uppercase tracking-wide">Usuario</div>
                  ) : (
                    <div className="mb-1 text-xs font-semibold text-primary uppercase tracking-wide">Asistente</div>
                  )}
                  <div className="markdown-content leading-relaxed">
                    {message.content.split('\n').map((paragraph, i) => {
                      // Procesamiento básico de Markdown
                      // Formato de negrita
                      let formattedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      // Formato de cursiva
                      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
                      // Formato de código
                      formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-orange-50 px-1 rounded text-orange-800">$1</code>');
                      // Formato de listas
                      if (formattedText.trim().startsWith('- ')) {
                        formattedText = `<span class="flex"><span class="mr-2">•</span><span>${formattedText.substring(2)}</span></span>`;
                      }

                      return (
                        <p 
                          key={i} 
                          className={`${i > 0 ? 'mt-2' : ''}`}
                          dangerouslySetInnerHTML={{ __html: formattedText }}
                        />
                      );
                    })}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-accent/10 backdrop-blur-sm flex items-center justify-center border border-accent/20 flex-shrink-0 ml-3">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {state.isTyping && (
              <div className="chat-message flex items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20 flex-shrink-0 mr-3">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="glass-effect bg-orange-100 border border-orange-200 rounded-2xl py-3 px-6 shadow-md">
                  <div className="mb-1 text-xs font-semibold text-primary uppercase tracking-wide">Asistente</div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mensaje de redirección cuando está completo */}
          {state.isConversationComplete && (
            <div className="text-center mt-4 flex flex-col items-center space-y-4">
              <div className="text-sm text-orange-600 animate-pulse bg-orange-100/80 py-2 px-4 rounded-full mx-auto max-w-xs backdrop-blur-sm border border-orange-200">
                {state.selectedLanguage === 'en' 
                  ? "Your personalized recommendation is ready!" 
                  : "¡Tu recomendación personalizada está lista!"}
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                {/* Botón para enviar información a Make */}
                <button 
                  onClick={async () => {
                    try {
                      if (state.messages.length > 0) {
                        // Obtener el último mensaje del asistente
                        const lastAssistantMessage = [...state.messages]
                          .reverse()
                          .find(msg => msg.role === 'assistant');

                        if (lastAssistantMessage) {
                          // Preparar datos para enviar a Make
                          const userData = {
                            sessionId: state.sessionId,
                            gender: state.selectedGender,
                            userResponses: state.userResponses,
                            lastAssistantMessage: lastAssistantMessage.content,
                            timestamp: new Date().toISOString()
                          };

                          // Enviar los datos
                          const response = await sendUserDataToWebhook(userData);

                          if (response.ok) {
                            // Mostrar mensaje de éxito usando alert
                            alert(state.selectedLanguage === 'en' 
                              ? "Information sent successfully!"
                              : "¡Información enviada con éxito!");
                          } else {
                            console.error("Error al enviar datos:", await response.text());
                            alert(state.selectedLanguage === 'en'
                              ? "Error sending information. Please try again."
                              : "Error al enviar la información. Por favor, inténtalo de nuevo.");
                          }
                        }
                      }
                    } catch (error) {
                      console.error("Error al enviar información:", error);
                      alert(state.selectedLanguage === 'en'
                        ? "An unexpected error occurred. Please try again."
                        : "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
                    }
                  }}
                  className="py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-full text-sm transition-colors duration-200 flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  {state.selectedLanguage === 'en' 
                    ? "Send Information" 
                    : "Enviar Información"}
                </button>

                {/* Botón para ver recomendaciones */}
                <button 
                  onClick={() => {
                    try {
                      if (state.sessionId) {
                        // Usar directamente window.location para una redirección segura
                        window.location.href = `/recommendation/${state.sessionId}`;
                      } else if (state.recommendation) {
                        // Si hay una recomendación pero no sessionId, usar state
                        window.history.pushState(
                          { recommendation: state.recommendation }, 
                          "", 
                          "/recommendation"
                        );
                        window.location.href = "/recommendation";
                      } else {
                        // Sin recomendación ni sessionId, redirigir directamente
                        window.location.href = "/recommendation";
                      }
                    } catch (error) {
                      console.error("Error de navegación:", error);
                      // Navegación de respaldo absolutamente segura
                      window.location.href = "/recommendation";
                    }
                  }}
                  className="py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white rounded-full text-sm transition-colors duration-200 flex items-center gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {state.selectedLanguage === 'en' 
                    ? "See Your Recommendation" 
                    : "Ver Tu Recomendación"}
                </button>

                {/* Botón para abrir en nueva ventana */}
                <button 
                  onClick={() => {
                    window.open("/recommendation", '_blank');
                  }}
                  className="py-3 px-6 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-full text-sm transition-colors duration-200 flex items-center gap-2 shadow-md"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {state.selectedLanguage === 'en' 
                    ? "Open in New Window" 
                    : "Abrir en Nueva Ventana"}
                </button>
              </div>

              {/* Botón para copiar chat al portapapeles */}
              <button 
                onClick={() => {
                  // Crear un texto formateado con todo el chat
                  const chatText = state.messages.map(msg => {
                    const role = msg.role === 'assistant' 
                      ? (state.selectedLanguage === 'en' ? '👨‍💼 Assistant:' : '👨‍💼 Asistente:')
                      : (state.selectedLanguage === 'en' ? '👤 You:' : '👤 Tú:');
                    return `${role}\n${msg.content}\n`;
                  }).join('\n');

                  // Copiar al portapapeles
                  navigator.clipboard.writeText(chatText)
                    .then(() => {
                      alert(state.selectedLanguage === 'en' 
                        ? "Chat copied to clipboard!"
                        : "¡Chat copiado al portapapeles!");
                    })
                    .catch(err => {
                      console.error('Error al copiar:', err);
                      alert(state.selectedLanguage === 'en'
                        ? "Could not copy chat. Please try again."
                        : "No se pudo copiar el chat. Por favor, inténtalo de nuevo.");
                    });
                }}
                className="mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full text-sm transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Clipboard className="w-4 h-4" />
                {state.selectedLanguage === 'en' 
                  ? "Copy Chat to Clipboard" 
                  : "Copiar Chat al Portapapeles"}
              </button>
            </div>
          )}

          {/* Botón para subir cuando hay muchos mensajes */}
          {state.messages.length > 5 && (
            <button
              onClick={scrollToTop}
              className="absolute top-4 right-4 bg-accent/20 hover:bg-accent/40 text-accent rounded-full p-2 transition-all duration-300 shadow-md"
              aria-label="Scroll to top"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border/50 bg-card/30 sticky bottom-0 z-20">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <SpeechRecognitionButton 
              onResult={(text) => setUserInput(text)}
              className="flex"
            />

            <div className="relative flex-grow">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => {
                  // Mejor manejo del enfoque y scroll
                  setTimeout(() => {
                    if (messagesEndRef.current) {
                      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
                    }
                  }, 100);
                }}
                className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-l-full py-3 px-5 pr-12 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all duration-300"
                placeholder={messages.typeMessage}
                disabled={state.isTyping || isProcessing || state.isConversationComplete}
                style={{ fontSize: '16px' }} /* Evitar zoom en iOS */
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center btn-animated disabled:opacity-50"
                disabled={state.isTyping || isProcessing || !userInput.trim() || state.isConversationComplete}
              >
                <Send className={`w-5 h-5 ${userInput.trim() ? 'text-accent' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <button
              type="submit"
              className={`bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white py-3 px-6 rounded-r-full transition-all duration-300 disabled:opacity-50 btn-animated ${
                !userInput.trim() || state.isTyping || isProcessing || state.isConversationComplete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={state.isTyping || isProcessing || !userInput.trim() || state.isConversationComplete}
            >
              {messages.sendMessage}
            </button>
          </form>

          {/* Quick Responses */}
          {state.quickResponses && state.quickResponses.length > 0 && !state.isTyping && !state.isConversationComplete && (
            <div className="flex flex-wrap gap-2 mt-4 mb-2 pb-2">
              {state.quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="py-2 px-4 bg-accent/10 backdrop-blur-sm hover:bg-accent/20 text-accent rounded-full text-sm transition-all duration-300 border border-accent/20 hover-glow"
                  style={{ animationDelay: `${index * 100}ms`, fontSize: '14px' }}
                  disabled={isProcessing || state.isTyping || state.isConversationComplete}
                >
                  {response}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


