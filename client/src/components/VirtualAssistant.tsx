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

// Precios de los perfumes (dólares)
const perfumePrices: Record<string, number> = {
  "fruto-silvestre": 85,
  "bosque-de-lunas": 120,
  "citrico-oriental": 95,
  "jardin-dulce": 110,
  "selva-mistica": 135,
  "brisa-tropical": 90,
  "euforia-de-noche": 140,
  "cielo-de-sandia": 80,
  "amor-de-lirio": 125,
  "horizon-musk": 105
};

// Detalles adicionales para cada perfume
interface PerfumeDetails {
  duracion: string;
  intensidad: string;
  estilo: string;
  popularidad: string;
}

const perfumeDetails: Record<string, PerfumeDetails> = {
  "fruto-silvestre": {
    duracion: "6-8 horas",
    intensidad: "Media",
    estilo: "Casual y juvenil",
    popularidad: "Alta entre 18-30 años"
  },
  "bosque-de-lunas": {
    duracion: "8-10 horas",
    intensidad: "Alta",
    estilo: "Elegante y misterioso",
    popularidad: "Preferido por profesionales"
  },
  "citrico-oriental": {
    duracion: "7-9 horas",
    intensidad: "Media-alta",
    estilo: "Sofisticado y versátil",
    popularidad: "Muy popular en temporada otoño-invierno"
  },
  "jardin-dulce": {
    duracion: "6-7 horas",
    intensidad: "Media",
    estilo: "Romántico y delicado",
    popularidad: "Favorito para ocasiones especiales"
  },
  "selva-mistica": {
    duracion: "10-12 horas",
    intensidad: "Alta",
    estilo: "Intenso y enigmático",
    popularidad: "Exclusivo para conocedores"
  },
  "brisa-tropical": {
    duracion: "5-6 horas",
    intensidad: "Media-baja",
    estilo: "Fresco y despreocupado",
    popularidad: "Ideal para climas cálidos"
  },
  "euforia-de-noche": {
    duracion: "10-14 horas",
    intensidad: "Muy alta",
    estilo: "Seductor y memorable",
    popularidad: "Perfecto para eventos nocturnos"
  },
  "cielo-de-sandia": {
    duracion: "4-6 horas",
    intensidad: "Baja",
    estilo: "Ligero y refrescante",
    popularidad: "Favorito para uso diario en verano"
  },
  "amor-de-lirio": {
    duracion: "8-10 horas",
    intensidad: "Media-alta",
    estilo: "Elegante y floral",
    popularidad: "Muy apreciado para bodas y eventos formales"
  },
  "horizon-musk": {
    duracion: "8-12 horas",
    intensidad: "Media",
    estilo: "Versátil y contemporáneo",
    popularidad: "Popular entre todos los géneros"
  }
};

// Función para obtener información detallada de un perfume específico
function getPerfumeDetailedInfo(perfumeId: string): string {
  const perfume = perfumesData.find(p => p.id === perfumeId);
  if (!perfume) return "Lo siento, no tengo información detallada sobre ese perfume.";
  
  const details = perfumeDetails[perfumeId];
  const price = perfumePrices[perfumeId];
  
  return `
## ${perfume.name} (${price} USD)

${perfume.description}

### Características
- **Notas principales:** ${perfume.notes.join(", ")}
- **Ideal para:** ${perfume.occasions}
- **Duración:** ${details.duracion}
- **Intensidad:** ${details.intensidad}
- **Estilo:** ${details.estilo}

### ¿Por qué elegir ${perfume.name}?
${getPerfumeUniqueSellingPoint(perfumeId)}

### Recomendación del experto
${getExpertRecommendation(perfumeId)}
  `;
}

// Función para generar un punto de venta único para cada perfume
function getPerfumeUniqueSellingPoint(perfumeId: string): string {
  const sellingPoints: Record<string, string> = {
    "fruto-silvestre": "Su combinación única de frutas silvestres crea una experiencia olfativa juvenil y enérgica que te hará destacar. La adición de menta proporciona un toque refrescante inesperado que eleva esta fragancia por encima de otros perfumes frutales.",
    "bosque-de-lunas": "La mezcla magistral de maderas nobles con lavanda crea una atmósfera nocturna inigualable. Es una fragancia que evoca recuerdos y despierta emociones profundas, perfecta para quienes buscan dejar una impresión duradera.",
    "citrico-oriental": "La perfecta fusión entre Occidente y Oriente en una botella. Sus notas cítricas iniciales evolucionan hacia un corazón especiado que revela diferentes facetas a lo largo del día, convirtiéndolo en una experiencia olfativa compleja y sofisticada.",
    "jardin-dulce": "Un abrazo floral con un toque de dulzura que nunca resulta empalagoso. El balance perfecto entre las flores y la suavidad de la vainilla crea una sensación reconfortante que perdura en la piel.",
    "selva-mistica": "Inspirado en las profundidades inexploradas de selvas ancestrales, este perfume transporta a quien lo usa a un mundo de misterio y sofisticación. Sus materias primas de la más alta calidad aseguran una experiencia olfativa premium.",
    "brisa-tropical": "Captura la esencia del paraíso tropical en cada aplicación. Es como unas vacaciones en una isla paradisíaca condensadas en fragancia, ideal para quienes buscan escapar de la rutina diaria.",
    "euforia-de-noche": "Una obra maestra nocturna que evoluciona con el calor de la piel, revelando diferentes facetas a lo largo de la noche. Su estela memorable garantiza que serás recordado mucho después de haber dejado la habitación.",
    "cielo-de-sandia": "La frescura reinventada con un toque contemporáneo. Su composición única captura la jugosidad de la sandía sin resultar infantil, creando una fragancia sorprendentemente sofisticada dentro de su ligereza.",
    "amor-de-lirio": "Elaborado con extractos de lirios blancos cultivados exclusivamente para AROMASENS, ofrece una experiencia floral de lujo que celebra momentos especiales con elegancia atemporal.",
    "horizon-musk": "La versatilidad llevada a su máxima expresión. Su fórmula innovadora permite adaptarse a diferentes situaciones y personalidades, convirtiéndolo en el compañero perfecto para quienes llevan un estilo de vida dinámico."
  };
  
  return sellingPoints[perfumeId] || "Una fragancia excepcional que refleja la calidad y exclusividad de AROMASENS.";
}

// Función para generar una recomendación de experto
function getExpertRecommendation(perfumeId: string): string {
  const recommendations: Record<string, string> = {
    "fruto-silvestre": "Recomiendo aplicarlo en puntos de pulso por la mañana para maximizar su proyección energética. Ideal para personas extrovertidas y dinámicas que disfrutan de un estilo de vida activo.",
    "bosque-de-lunas": "Perfecto para eventos nocturnos importantes. Aplícalo 30 minutos antes de salir para permitir que las notas de fondo se desarrollen completamente. Especialmente recomendado para personalidades misteriosas y sofisticadas.",
    "citrico-oriental": "Excelente para transiciones día-noche. Su evolución en la piel lo hace ideal para profesionales que necesitan una fragancia que funcione tanto en reuniones de trabajo como en compromisos sociales después de la oficina.",
    "jardin-dulce": "Recomendado para personas románticas y soñadoras. Su proyección moderada lo hace perfecto para encuentros íntimos donde la cercanía permitirá apreciar todos sus matices.",
    "selva-mistica": "Para conocedores que aprecian la complejidad. Sugiero utilizarlo en climas fríos donde sus notas amaderadas e incienso pueden desarrollarse completamente, creando una experiencia olfativa excepcional.",
    "brisa-tropical": "Ideal para uso diario en climas cálidos. Su frescura perdura sorprendentemente bien bajo el sol. Perfecto para personalidades alegres y sociables que disfrutan del aire libre.",
    "euforia-de-noche": "Reservado para momentos especiales y noches memorables. Su intensidad y complejidad lo convierten en una declaración de intenciones. Ideal para personalidades atrevidas y seguras de sí mismas.",
    "cielo-de-sandia": "Recomendado para actividades deportivas y momentos de relax. Su ligereza lo hace refrescante sin ser invasivo. Perfecto para quienes valoran la discreción y naturalidad.",
    "amor-de-lirio": "La elección perfecta para bodas y celebraciones. Su elegancia floral atemporal complementa perfectamente los momentos de felicidad. Ideal para personalidades refinadas y sentimentales.",
    "horizon-musk": "Mi recomendación para quienes buscan una fragancia versátil que funcione en cualquier situación. Su balance perfecto entre frescura y calidez lo hace apropiado para todo clima y ocasión."
  };
  
  return recommendations[perfumeId] || "Una excelente elección que garantiza sofisticación y distinción.";
}

// Función para encontrar perfumes que coincidan con criterios específicos
function findMatchingPerfumes(query: string): PerfumeInfo[] {
  query = query.toLowerCase();
  
  // Si la consulta es muy corta o genérica, mostrar una selección curada
  if (query.length < 3 || query === "hola" || query === "perfume" || query === "recomendacion") {
    return [
      perfumesData.find(p => p.id === "fruto-silvestre")!,
      perfumesData.find(p => p.id === "bosque-de-lunas")!,
      perfumesData.find(p => p.id === "citrico-oriental")!
    ];
  }
  
  // Buscar por nombre específico del perfume
  const exactMatch = perfumesData.find(p => 
    p.name.toLowerCase() === query || 
    p.id.toLowerCase() === query.replace(/\s+/g, '-')
  );
  
  if (exactMatch) {
    return [exactMatch];
  }
  
  // Patrones de búsqueda comunes
  const patterns = {
    floral: ['floral', 'flores', 'jazmín', 'rosa', 'lirio', 'orquídea'],
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
  
  // Verificar si el usuario está preguntando específicamente por un perfume
  const perfumeNames = perfumesData.map(p => p.name.toLowerCase());
  const mentionedPerfume = perfumeNames.find(name => query.includes(name.toLowerCase()));
  
  if (mentionedPerfume) {
    const perfume = perfumesData.find(p => p.name.toLowerCase() === mentionedPerfume)!;
    const price = perfumePrices[perfume.id];
    const details = perfumeDetails[perfume.id];
    
    return {
      response: `
**${perfume.name}** - *${price} USD*

${perfume.description}

**Notas principales:** ${perfume.notes.join(", ")}
**Duración:** ${details.duracion}
**Intensidad:** ${details.intensidad}
**Ideal para:** ${perfume.occasions}

${getPerfumeUniqueSellingPoint(perfume.id)}

¿Te gustaría conocer otra fragancia similar o prefieres más detalles sobre ${perfume.name}?`,
      perfumes: [perfume]
    };
  }
  
  // Comprobar si es una pregunta sobre precio
  if (query.includes("precio") || query.includes("costo") || query.includes("vale") || query.includes("dolar") || query.includes("$")) {
    const matchingPerfumes = findMatchingPerfumes(query);
    
    let responseText = "Aquí tienes los precios de nuestras exclusivas fragancias:\n\n";
    
    // Si la consulta menciona un perfume específico, mostrar solo ese
    if (matchingPerfumes.length === 1) {
      const perfume = matchingPerfumes[0];
      const price = perfumePrices[perfume.id];
      responseText = `**${perfume.name}** tiene un precio de **${price} USD**.\n\nEs una inversión en calidad y exclusividad, elaborado con los mejores ingredientes naturales y presentado en un elegante frasco de diseño. ¿Te gustaría conocer más detalles sobre esta fragancia?`;
    } else {
      // Mostrar precios de varios perfumes
      matchingPerfumes.forEach((perfume, index) => {
        const price = perfumePrices[perfume.id];
        responseText += `**${perfume.name}:** ${price} USD\n`;
      });
      
      responseText += "\n¿Alguna de estas fragancias te interesa particularmente?";
    }
    
    return {
      response: responseText,
      perfumes: matchingPerfumes.slice(0, 3)
    };
  }
  
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
    const perfume = matchingPerfumes[0];
    const price = perfumePrices[perfume.id];
    responseText = `He encontrado el perfume perfecto para ti: **${perfume.name}** (${price} USD).\n\n${perfume.description}\n\n**Notas principales:** ${perfume.notes.join(", ")}\n\n¿Te gustaría conocer más detalles sobre esta exquisita fragancia?`;
  } else if (matchingPerfumes.length <= 3) {
    responseText = `Basándome en tus preferencias, te recomiendo estas fragancias exclusivas:\n\n`;
    matchingPerfumes.forEach((perfume, index) => {
      const price = perfumePrices[perfume.id];
      responseText += `**${index + 1}. ${perfume.name}** (${price} USD): ${perfume.description}\n\n`;
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
    
    responseText = `Basándome en tu consulta, estas son las fragancias premium que te recomiendo:\n\n`;
    bestMatches.forEach((perfume, index) => {
      const price = perfumePrices[perfume.id];
      responseText += `**${index + 1}. ${perfume.name}** (${price} USD): ${perfume.description}\n\n`;
    });
  }
  
  // Añadir cierre personalizado
  if (query.length < 5 || query === "hola") {
    responseText = `¡Bienvenido/a a AROMASENS! ${responseText}`;
  }
  
  responseText += "¿Te gustaría conocer más detalles sobre alguna de estas fragancias o tienes alguna preferencia específica?";
  
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
    
    // Verificar si es una consulta específica sobre un perfume
    const isPerfumeQuery = perfumesData.some(perfume => 
      userInput.toLowerCase().includes(perfume.name.toLowerCase()) ||
      userInput.toLowerCase().includes(perfume.id.toLowerCase().replace('-', ' '))
    );
    
    // Verificar si es sobre precio, características, etc.
    const isDetailQuery = /precio|costo|vale|dolar|\$|caracter[ií]sticas|detalles|duraci[oó]n|intensidad/i.test(userInput.toLowerCase());
    
    // Simular tiempo de respuesta (más corto para consultas simples, más largo para respuestas elaboradas)
    const responseTime = isPerfumeQuery || isDetailQuery ? 2000 : 1500;
    
    setTimeout(() => {
      // Generar respuesta basada en el mensaje del usuario y el contexto
      let { response, perfumes } = generateRecommendation(newUserMessage.content);
      
      // Verificar si hay mensajes previos para mantener coherencia
      if (chatMessages.length > 1) {
        const lastAssistantMessage = [...chatMessages]
          .reverse()
          .find(msg => msg.role === 'assistant');
        
        const lastUserMessages = chatMessages
          .filter(msg => msg.role === 'user')
          .slice(-2);
        
        // Si el usuario pregunta por más detalles después de una recomendación
        if (lastAssistantMessage && perfumes.length === 1 && 
            (userInput.toLowerCase().includes("más detalles") || 
             userInput.toLowerCase().includes("cuéntame más") ||
             userInput.toLowerCase().includes("información") ||
             userInput.toLowerCase().includes("dime más"))) {
          // Obtener información detallada del perfume
          response = getPerfumeDetailedInfo(perfumes[0].id);
        }
        
        // Si el usuario está pidiendo una recomendación después de mencionar preferencias
        if (lastUserMessages.length >= 2 && 
            (userInput.toLowerCase().includes("recomienda") || 
             userInput.toLowerCase().includes("sugiere") ||
             userInput.toLowerCase().includes("cuál es mejor"))) {
          // Combinar mensajes anteriores para contextualizar la recomendación
          const context = lastUserMessages.map(msg => msg.content).join(" ");
          const contextRecommendation = generateRecommendation(context);
          
          if (contextRecommendation.perfumes.length > 0) {
            perfumes = contextRecommendation.perfumes;
            response = `Basándome en tus preferencias anteriores, estas son mis recomendaciones personalizadas:\n\n`;
            
            perfumes.forEach((perfume, index) => {
              const price = perfumePrices[perfume.id];
              response += `**${index + 1}. ${perfume.name}** (${price} USD): ${perfume.description}\n\n`;
            });
            
            response += "¿Te gustaría conocer más detalles sobre alguna de estas fragancias exclusivas?";
          }
        }
      }
      
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
        const plainText = response.replace(/\*\*(.*?)\*\*/g, '$1')
                                 .replace(/\n\n/g, '. ')
                                 .replace(/\n/g, ' ')
                                 .replace(/\*/g, '')
                                 .replace(/#{1,3} /g, '');
        speakText(plainText);
      }
    }, responseTime);
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
