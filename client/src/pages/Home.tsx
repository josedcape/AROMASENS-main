import GenderSelection from "@/components/GenderSelection";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-grow animated-bg min-h-screen">
      {/* Botón flotante para acceder a recomendaciones */}
      <div className="fixed bottom-10 right-10 z-50">
        <a href="/Recommendation" onClick={(e) => {
          e.preventDefault();
          // Forzar navegación directa
          window.location.replace("/Recommendation");
        }}>
          <button className="py-3 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg hover:shadow-accent/20 transition-all duration-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Ver Recomendaciones</span>
          </button>
        </a>
      </div>
      
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Círculos decorativos animados */}
        <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-accent/5 animate-float"></div>
        <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full bg-primary/5 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-secondary/5 animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        <GenderSelection />
      </div>
    </div>
  );
}


              <Link href="/shop">
                <button className="flex-1 btn-animated py-3 px-6 glass-effect border border-accent/20 text-accent rounded-full transition-all duration-300 hover:bg-accent/10">
                  <Store className="w-5 h-5 mr-2" />
                  <span>{settings.language === 'en' ? 'Visit Store' : 'Visitar Tienda'}</span>
                </button>
              </Link>
