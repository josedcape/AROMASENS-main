export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ChatStep {
  LIFESTYLE = 0,  // Nueva primera pregunta sobre estilo de vida
  AGE = 1,        // Movemos edad a segundo lugar
  EXPERIENCE = 2,
  OCCASION = 3,
  PREFERENCES = 4,
  PERSONALITY = 5,
  COMPLETE = 6    // Ajustado para incluir el nuevo paso
}

export interface ChatState {
  selectedGender: string;
  selectedLanguage?: 'es' | 'en';
  currentStep: ChatStep;
  messages: ChatMessage[];
  isTyping: boolean;
  quickResponses?: string[];
  userResponses: {
    gender: string;
    lifestyle: string;  // Nuevo campo para estilo de vida
    age: string;
    experience: string; 
    occasion: string;
    preferences: string;
    personality: string;
  };
}

export interface PerfumeRecommendation {
  perfumeId?: number;
  brand?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  notes?: string[];
  occasions?: string;
}

export interface ApiResponse {
  message: string;
  quickResponses?: string[];
  step?: number;
  isComplete?: boolean;
  recommendation?: PerfumeRecommendation;
}


