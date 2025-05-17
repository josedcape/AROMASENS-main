import { useState, useEffect, useRef, FormEvent } from "react";
import { useAISettings } from "@/context/AISettingsContext";
import { Bot, X, Volume2, Sparkles, Send, ArrowLeft, ChevronDown, MessageSquare, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useChatContext } from "@/context/ChatContext";

interface PerfumeInfo {
  id: string;
  name: string;
  brand: string;
  description: string;
  notes: string[];
  occasions: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Datos de perfumes AROMASENS
const perfumesData: PerfumeInfo[] = [
  {
    id: "fruto-silvestre",
    name: "Fruto Silvestre",
    brand: "AROMASENS",
    description: "Una explosión de frutas frescas como la frambuesa, la fresa y el arándano, combinada con un toque ligero de menta. Ideal para un día lleno de energía y frescura.",
    notes: ["Frambuesa", "Fresa", "Arándano", "Menta", "Almizcle"],
    occasions: "Uso diario, ambientes casuales, primavera/verano"
  },
  {
    id: "bosque-de-lunas",
    name: "Bosque de Lunas",
    brand: "AROMASENS",
    description: "Perfume que evoca la tranquilidad de un paseo nocturno por el bosque. Una mezcla armoniosa de madera de cedro y sándalo, con un toque suave de lavanda y musk.",
    notes: ["Cedro", "Sándalo", "Lavanda", "Musk", "Pachulí"],
    occasions: "Eventos nocturnos, ocasiones formales, otoño/invierno"
  },
  {
    id: "citrico-oriental",
    name: "Cítrico Oriental",
    brand: "AROMASENS",
    description: "Fusión entre la frescura de los cítricos como el limón y la naranja, con un corazón de especias orientales como el jengibre y el cardamomo. Elegante y audaz, para quienes buscan algo único.",
    notes: ["Limón", "Naranja", "Jengibre", "Cardamomo", "Ámbar"],
    occasions: "Eventos especiales, ocasiones de negocios, todo el año"
  },
  {
    id: "jardin-dulce",
    name: "Jardín Dulce",
    brand: "AROMASENS",
    description: "Un bouquet floral de jazmín, rosa y lirio del valle, acentuado por la suavidad de la vainilla y un toque frutal de manzana verde. Un perfume que te envuelve en un abrazo floral.",
    notes: ["Jazmín", "Rosa", "Lirio del valle", "Manzana verde", "Vainilla"],
    occasions: "Eventos románticos, celebraciones, primavera"
  },
  {
    id: "selva-mistica",
    name: "Selva Mística",
    brand: "AROMASENS",
    description: "Perfume amaderado con notas de vetiver, madera de roble y toques de incienso que evocan la esencia de un lugar misterioso y fascinante. Para los que buscan una fragancia profunda y enigmática.",
    notes: ["Vetiver", "Roble", "Incienso", "Almizcle"],
    occasions: "Eventos formales, noches especiales, otoño/invierno"
  },
  {
    id: "brisa-tropical",
    name: "Brisa Tropical",
    brand: "AROMASENS",
    description: "Frescura en su máxima expresión, combinando notas frutales de piña, mango y coco con la suavidad de las flores de hibisco. Un perfume ideal para días calurosos y veraniegos.",
    notes: ["Piña", "Mango", "Coco", "Hibisco", "Flor de tiaré"],
    occasions: "Playa, actividades al aire libre, verano"
  },
  {
    id: "euforia-de-noche",
    name: "Euforia de Noche",
    brand: "AROMASENS",
    description: "Un perfume intenso que mezcla la calidez de la vainilla, el ámbar y el chocolate con un toque de frutas rojas. Es una fragancia que cautiva y perdura, perfecta para las noches especiales.",
    notes: ["Vainilla", "Ámbar", "Chocolate", "Frutos rojos", "Musk"],
    occasions: "Salidas nocturnas, eventos románticos, invierno"
  },
  {
    id: "cielo-de-sandia",
    name: "Cielo de Sandía",
    brand: "AROMASENS",
    description: "Frutal y refrescante, con el jugoso aroma de la sandía, combinada con notas de melón y pepino para un toque verde y limpio. Perfecto para los amantes de las fragancias frescas y ligeras.",
    notes: ["Sandía", "Melón", "Pepino", "Menta"],
    occasions: "Uso diario, actividades deportivas, verano"
  },
  {
    id: "amor-de-lirio",
    name: "Amor de Lirio",
    brand: "AROMASENS",
    description: "La fragancia del lirio blanco y las orquídeas se fusionan con una base amaderada de sándalo y cedro. Un perfume delicado y sofisticado, ideal para ocasiones especiales.",
    notes: ["Lirio blanco", "Orquídea", "Sándalo", "Cedro"],
    occasions: "Bodas, ceremonias, primavera"
  },
  {
    id: "horizon-musk",
    name: "Horizon Musk",
    brand: "AROMASENS",
    description: "Un perfume unisex que combina la calidez del almizcle con la frescura de las frutas cítricas y la suavidad de la madera de roble. Ideal para un estilo de vida activo y moderno.",
    notes: ["Almizcle", "Naranja", "Roble", "Bergamota", "Lavanda"],
    occasions: "Uso diario, ambiente de trabajo, todo el año"
  }
];

const greetings = [
  "¡Bienvenido a AROMASENS! Soy tu asesor personal de fragancias.",
  "Saludos, estoy aquí para ayudarte a descubrir el perfume perfecto para ti.",
  "Hola, soy el experto en fragancias de AROMASENS. ¿Quieres conocer nuestros productos exclusivos?"
];

// Función para encontrar perfumes que coincidan con criterios específicos
function findMatchingPerfumes(query: string): PerfumeInfo[] {
  query = query.toLowerCase();
  
  // Patrones de búsqueda comunes
  const patterns = {
    floral: ['floral', 'flores', 'jazmín', 'rosa', 'lirio'],
    frutal: ['frutal', 'fruta', 'fresa', 'cítrico', 'naranja', 'limón', 'sandía', 'melón', 'mango', 'piña'],
    maderado: ['maderado', 'madera', 'cedro', 'sándalo', 'roble', 'vetiver'],
    dulce: ['dulce', 'vainilla', 'ámbar', 'chocolate'],
    fresco: ['fresco', 'menta', 'lavanda', 'brisa', 'marino', 'oceánico'],
    especiado: ['especia', 'jengibre', 'cardamomo', 'incienso', 'oriental'],
    occasions: {
      formal: ['formal', 'elegante', 'sofisticado', 'trabajo', 'oficina', 'negocios'],
      casual: ['casual', 'diario', 'día a día', 'cotidiano'],
      romántico: ['romántico', 'cita', 'noche', 'especial', 'boda'],
      verano: ['verano', 'calor', 'playa', 'caluroso'],
      invierno: ['invierno', 'frío', 'navidad', 'nieve']
    }
  };
  
  // Buscar coincidencias en los patrones
  const matches = perfumesData.filter(perfume => {
    // Búsqueda directa por nombre o descripción
    if (
      perfume.name.toLowerCase().includes(query) || 
      perfume.description.toLowerCase().includes(query)
    ) {
      return true;
    }
    
    // Búsqueda por notas
    const notasCoinciden = perfume.notes.some(nota => 
      nota.toLowerCase().includes(query)
    );
    if (notasCoinciden) return true;
    
    // Búsqueda por tipo de aroma
    for (const [tipo, keywords] of Object.entries(patterns)) {
      if (tipo === 'occasions') continue; // Saltamos el objeto de ocasiones
      
      if (keywords.some(keyword => query.includes(keyword))) {
        // Verificar si el perfume tiene notas relacionadas con este tipo
        const tieneNotas = perfume.notes.some(nota => 
          keywords.some(keyword => nota.toLowerCase().includes(keyword))
        );
        if (tieneNotas) return true;
        
        // También buscar en la descripción
        const tieneDescripcion = keywords.some(keyword => 
          perfume.description.toLowerCase().includes(keyword)
        );
        if (tieneDescripcion) return true;
      }
    }
    
    // Búsqueda por ocasión
    for (const [ocasion, keywords] of Object.entries(patterns.occasions)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        if (perfume.occasions.toLowerCase().includes(ocasion)) return true;
      }
    }
    
    return false;
  });
  
  return matches.length > 0 ? matches : perfumesData.slice(0, 3); // Si no hay coincidencias, retornar los primeros 3
}

// Función para generar una recomendación basada en un mensaje del usuario
function generateRecommendation(message: string): {response: string, perfumes: PerfumeInfo[]} {
  const query = message.toLowerCase();
  const matchingPerfumes = findMatchingPerfumes(query);
  
  // Patrones para detectar preferencias
  const containsFloral = /flor|jazmín|rosa|lirio/i.test(query);
  const containsFrutal = /frut|cítrico|naranja|limón|fresa|melón|sandía/i.test(query);
  const containsMaderado = /madera|cedro|sándalo|roble/i.test(query);
  const containsDulce = /dulce|vainilla|ámbar|chocolate/i.test(query);
  const containsFormal = /formal|trabajo|oficina|elegant|sofistica/i.test(query);
  const containsCasual = /casual|diario|cotidiano/i.test(query);
  const containsRomantico = /romántico|cita|noche|especial/i.test(query);
  const containsEstacion = /verano|invierno|primavera|otoño/i.test(query);
  
  let responseText = "";
  
  // Construir respuesta personalizada
  if (matchingPerfumes.length === 1) {
    responseText = `He encontrado un perfume perfecto para ti: **${matchingPerfumes[0].name}**. ${matchingPerfumes[0].description}`;
  } else if (matchingPerfumes.length <= 3) {
    responseText = `Basándome en tus preferencias, te recomiendo estos perfumes:\n\n`;
    matchingPerfumes.forEach((perfume, index) => {
      responseText += `**${index + 1}. ${perfume.name}**: ${perfume.description.substring(0, 100)}...\n\n`;
    });
  } else {
    // Seleccionar los 3 mejores perfumes basados en los criterios más dominantes
    let bestMatches = [...matchingPerfumes];
    
    // Priorizar según las preferencias detectadas
    if (containsFloral || containsFrutal || containsMaderado || containsDulce) {
      bestMatches = bestMatches.filter(p => {
        const notasLower = p.notes.map(n => n.toLowerCase().trim());
        const descripcionLower = p.description.toLowerCase();
        
        if (containsFloral && (notasLower.some(n => /flor|jazmín|rosa|lirio|orquídea/i.test(n)) || /floral|flor/i.test(descripcionLower))) {
          return true;
        }
        if (containsFrutal && (notasLower.some(n => /frut|cítrico|naranja|limón|fresa|sandía|melón|piña|mango/i.test(n)) || /frutal|fruta|cítrico/i.test(descripcionLower))) {
          return true;
        }
        if (containsMaderado && (notasLower.some(n => /madera|cedro|sándalo|roble|vetiver/i.test(n)) || /madera|maderado/i.test(descripcionLower))) {
          return true;
        }
        if (containsDulce && (notasLower.some(n => /dulce|vainilla|ámbar|chocolate/i.test(n)) || /dulce|vainilla|ámbar/i.test(descripcionLower))) {
          return true;
        }
        return false;
      });
    }
    
    // Si todavía tenemos demasiados, filtrar por ocasión
    if (bestMatches.length > 3 && (containsFormal || containsCasual || containsRomantico || containsEstacion)) {
      bestMatches = bestMatches.filter(p => {
        const ocasionLower = p.occasions.toLowerCase();
        
        if (containsFormal && /formal|trabajo|oficina|negocio/i.test(ocasionLower)) {
          return true;
        }
        if (containsCasual && /casual|diario|día a día/i.test(ocasionLower)) {
          return true;
        }
        if (containsRomantico && /romántico|cita|noche|especial/i.test(ocasionLower)) {
          return true;
        }
        if (containsEstacion) {
          if (/verano/i.test(query) && /verano/i.test(ocasionLower)) return true;
          if (/invierno/i.test(query) && /invierno/i.test(ocasionLower)) return true;
          if (/primavera/i.test(query) && /primavera/i.test(ocasionLower)) return true;
          if (/otoño/i.test(query) && /otoño/i.test(ocasionLower)) return true;
        }
        return false;
      });
    }
    
    // Si aún hay demasiados o ninguno, seleccionar los primeros 3 de los matches originales
    if (bestMatches.length === 0 || bestMatches.length > 3) {
      bestMatches = matchingPerfumes.slice(0, 3);
    }
    
    responseText = `Basándome en tus gustos, he seleccionado estas fragancias para ti:\n\n`;
    bestMatches.forEach((perfume, index) => {
      responseText += `**${index + 1}. ${perfume.name}**: ${perfume.description.substring(0, 100)}...\n\n`;
    });
  }
  
  // Añadir cierre
  responseText += "¿Te gustaría más información sobre alguno de estos perfumes o prefieres explorar otras opciones?";
  
  return {
    response: responseText,
    perfumes: matchingPerfumes.slice(0, 3)  // Retornar máximo 3 perfumes
  };
}

export default function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentPerfume, setCurrentPerfume] = useState<PerfumeInfo | null>(null);
  const [showPerfumeInfo, setShowPerfumeInfo] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedPerfumes, setSuggestedPerfumes] = useState<PerfumeInfo[]>([]);
  const [, setLocation] = useLocation();
  const assistantRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { ttsSettings, speakText } = useAISettings();
  const { state: chatState } = useChatContext();

  // Mostrar el asistente automáticamente al cargar el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      setCurrentMessage(greeting);

      if (ttsSettings.enabled) {
        setIsSpeaking(true);
        speakText(greeting);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [speakText, ttsSettings.enabled]);

  // Efecto para animar la aparición de los mensajes
  useEffect(() => {
    if (assistantRef.current && isOpen) {
      assistantRef.current.classList.add("animate-bounce-in");

      const timer = setTimeout(() => {
        if (assistantRef.current) {
          assistantRef.current.classList.remove("animate-bounce-in");
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentMessage]);

  // Efecto para hacer scroll al último mensaje
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Añadir mensaje del usuario
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userInput
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    setIsTyping(true);
    
    // Simular tiempo de respuesta
    setTimeout(() => {
      // Generar respuesta basada en el mensaje del usuario
      const { response, perfumes } = generateRecommendation(newUserMessage.content);
      
      // Añadir mensaje del asistente
      const newAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };
      
      setChatMessages(prev => [...prev, newAssistantMessage]);
      setIsTyping(false);
      setSuggestedPerfumes(perfumes);
      
      // Leer la respuesta si TTS está habilitado
      if (ttsSettings.enabled) {
        // Eliminar formato markdown para TTS
        const plainText = response.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ');
        speakText(plainText);
      }
    }, 1500);
  };

  const activateChatMode = () => {
    setChatMode(true);
    // Mensaje inicial del asistente
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: "¡Hola! Soy tu asistente personal de AROMASENS. Cuéntame qué tipo de perfume estás buscando. ¿Prefieres fragancias florales, frutales, amaderadas o quizás algo para una ocasión especial?"
    };
    setChatMessages([initialMessage]);
  };

  const handlePerfumeSelect = (perfume: PerfumeInfo) => {
    setCurrentPerfume(perfume);
    setShowPerfumeInfo(true);
    const message = `Has seleccionado ${perfume.name}. ${perfume.description}`;
    setCurrentMessage(message);

    if (ttsSettings.enabled) {
      setIsSpeaking(true);
      speakText(message);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Resetear estado al cerrar
    setChatMode(false);
    setChatMessages([]);
    setShowPerfumeInfo(false);
    setCurrentPerfume(null);
    setSuggestedPerfumes([]);
  };

  const handleSpeakDescription = () => {
    if (currentPerfume && !isSpeaking) {
      setIsSpeaking(true);
      speakText(currentPerfume.description);
    }
  };

  const handleBackFromChat = () => {
    setChatMode(false);
    setChatMessages([]);
    setSuggestedPerfumes([]);
    setCurrentMessage(greetings[Math.floor(Math.random() * greetings.length)]);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={assistantRef}
      className="fixed bottom-8 right-8 z-50 max-w-sm transition-all duration-300 ease-in-out"
    >
      <div className="glass-effect fancy-border relative overflow-hidden backdrop-blur-lg shadow-xl">
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
        >
          <X className="w-4 h-4 text-accent" />
        </button>

        {!chatMode ? (
          // Modo normal - selección de opciones
          <div className="p-4">
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-white animate-pulse-subtle" />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-accent mb-1">Asistente AROMASENS</h3>
                <p className="text-sm text-foreground">{currentMessage}</p>

                {!showPerfumeInfo && (
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {/* Botón para activar modo chat */}
                    <button
                      onClick={activateChatMode}
                      className="text-left text-sm p-3 rounded-md border border-accent/20 bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-colors"
                    >
                      <span className="font-medium text-accent flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Conversar con el asistente
                      </span>
                      <span className="text-xs block text-foreground/70 mt-1">Recibe recomendaciones personalizadas</span>
                    </button>

                    {/* Botón para acceder a recomendaciones personalizadas */}
                    {chatState.sessionId && (
                      <button
                        onClick={() => {
                          if (chatState.sessionId) {
                            if (chatState.recommendation) {
                              setLocation(`/recommendation/${chatState.sessionId}`, { 
                                recommendation: chatState.recommendation, 
                                state: { recommendation: chatState.recommendation } 
                              });
                            } else {
                              window.location.href = `/recommendation/${chatState.sessionId}`;
                            }
                            setIsOpen(false);
                          }
                        }}
                        className="text-left text-sm p-3 rounded-md border border-accent/20 bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-colors"
                      >
                        <span className="font-medium text-accent flex items-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Ver mi recomendación personalizada
                        </span>
                        <span className="text-xs block text-foreground/70 mt-1">Basada en tus preferencias</span>
                      </button>
                    )}

                    {/* Botón para acceder directamente a recomendaciones sin un chat previo */}
                    <button
                      onClick={() => {
                        // Navegar a recomendaciones
                        window.location.href = `/recommendation`;
                        setIsOpen(false);
                      }}
                      className="text-left text-sm p-3 rounded-md border border-accent/20 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 transition-colors"
                    >
                      <span className="font-medium text-orange-500 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Explorar recomendaciones
                      </span>
                      <span className="text-xs block text-foreground/70 mt-1">Ver catálogo de fragancias</span>
                    </button>

                    {/* Lista desplegable de perfumes */}
                    <div className="mt-2">
                      <details className="group">
                        <summary className="flex justify-between items-center text-sm cursor-pointer">
                          <span className="text-xs italic text-foreground/70">Perfumes exclusivos AROMASENS</span>
                          <ChevronDown className="w-4 h-4 text-foreground/70 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-2 space-y-2 pl-1">
                          {perfumesData.slice(0, 5).map(perfume => (
                            <button
                              key={perfume.id}
                              onClick={() => handlePerfumeSelect(perfume)}
                              className="text-left text-sm p-2 rounded-md border border-accent/20 bg-card/50 hover:bg-accent/10 transition-colors w-full"
                            >
                              <span className="font-medium text-accent">{perfume.name}</span>
                              <span className="text-xs block text-foreground/70">{perfume.notes.slice(0, 2).join(", ")}</span>
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                )}

                {showPerfumeInfo && currentPerfume && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-accent">{currentPerfume.name}</h4>
                      <button 
                        onClick={handleSpeakDescription}
                        className="p-1 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors"
                        title="Escuchar descripción"
                      >
                        <Volume2 className="w-4 h-4 text-accent" />
                      </button>
                    </div>

                    <p className="text-xs"><span className="font-medium">Notas:</span> {currentPerfume.notes.join(", ")}</p>
                    <p className="text-xs"><span className="font-medium">Ideal para:</span> {currentPerfume.occasions}</p>

                    <div className="pt-2">
                      <button 
                        onClick={() => setShowPerfumeInfo(false)}
                        className="text-xs text-accent hover:underline"
                      >
                        ← Ver otros perfumes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Modo chat - conversación con el asistente
          <div className="flex flex-col h-[450px]">
            {/* Cabecera del chat */}
            <div className="flex items-center justify-between p-3 border-b border-accent/20">
              <button 
                onClick={handleBackFromChat}
                className="flex items-center text-accent text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Volver</span>
              </button>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-medium text-accent text-sm">Chat AROMASENS</h3>
              </div>
              <div className="w-6"></div> {/* Espaciador para centrar el título */}
            </div>
            
            {/* Área de mensajes */}
            <div className="flex-grow overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-accent text-white ml-auto' 
                        : 'glass-effect border border-accent/20'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div 
                        className="text-sm"
                        // Renderizar markdown básico
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n\n/g, '<br/><br/>')
                        }}
                      />
                    ) : (
                      <span className="text-sm">{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Indicador de escritura */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass-effect border border-accent/20 rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Perfumes sugeridos */}
              {suggestedPerfumes.length > 0 && !isTyping && (
                <div className="flex flex-col space-y-2 mt-2">
                  <p className="text-xs text-foreground/70 italic">Perfumes recomendados:</p>
                  {suggestedPerfumes.map((perfume) => (
                    <button
                      key={perfume.id}
                      onClick={() => handlePerfumeSelect(perfume)}
                      className="text-left text-sm p-2 rounded-md border border-accent/20 bg-card/50 hover:bg-accent/10 transition-colors"
                    >
                      <span className="font-medium text-accent">{perfume.name}</span>
                      <span className="text-xs block text-foreground/70">{perfume.notes.slice(0, 3).join(", ")}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Referencia para scroll automático */}
              <div ref={chatEndRef} />
            </div>
            
            {/* Área de entrada de texto */}
            <form onSubmit={handleSendMessage} className="border-t border-accent/20 p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribe tu consulta sobre perfumes..."
                  className="flex-grow p-2 rounded-md bg-background/30 border border-accent/20 focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isTyping}
                  className={`p-2 rounded-full ${
                    !userInput.trim() || isTyping
                      ? 'bg-foreground/10 text-foreground/30'
                      : 'bg-accent text-white hover:bg-accent/80'
                  } transition-colors`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-center mt-2">
                <div className="text-xs text-foreground/50 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-accent" />
                  <span>Asistente de fragancias AROMASENS</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
