// Preguntas clave del flujo de conversación
const CONVERSATION_FLOW = [
  {id: 'lifestyle', question: '¿Cómo describirías tu estilo de vida? ¿Eres deportista, formal, casual, aventurero...?'},
  {id: 'age', question: '¿Podrías compartirme tu edad?'},
  {id: 'gender', question: '¿Para qué género buscas esta fragancia?'},
  {id: 'experience', question: '¿Has usado perfumes anteriormente? ¿Tienes alguna fragancia favorita?'},
  {id: 'occasion', question: '¿Para qué ocasiones principalmente buscas este perfume?'},
  {id: 'scent_preferences', question: '¿Qué tipo de aromas prefieres?'},
  {id: 'personality', question: '¿Cómo describirías tu personalidad?'}
];

const prompt = `
  Analiza esta conversación entre un usuario y un asistente de perfumería:

  ${conversationText}

  Extrae la siguiente información del usuario (si está disponible):
  - gender: género para el que busca perfume (masculino/femenino/unisex)
  - lifestyle: estilo de vida (deportista, formal, casual, aventurero, etc.)
  - age: edad aproximada (número)
  - experience: nivel de experiencia con perfumes (principiante/intermedio/experto)
  - occasion: ocasión para la que busca el perfume
  - preferences: preferencias olfativas o de personalidad
  - personality: rasgos de personalidad mencionados

  Responde SOLO en formato JSON con los campos que hayas podido identificar:
`;

// Actualizar el perfil del usuario con la información extraída
if (analysis.extractedInfo) {
  switch (lastQuestionAsked) {
    case 'lifestyle':
      userProfile.lifestyle = analysis.extractedInfo;
      break;
    case 'age':
      const ageMatch = analysis.extractedInfo.match(/\d+/);
      if (ageMatch) {
        userProfile.age = parseInt(ageMatch[0]);
      }
      break;
    case 'gender':
      userProfile.gender = analysis.extractedInfo;
      break;
    case 'experience':
      userProfile.experience = analysis.extractedInfo;
      break;
    case 'occasion':
      userProfile.occasion = analysis.extractedInfo;
      break;
    case 'scent_preferences':
      userProfile.preferences = analysis.extractedInfo;
      break;
    case 'personality':
      userProfile.personality = analysis.extractedInfo;
      break;
  }
}


