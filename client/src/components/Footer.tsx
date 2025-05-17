export default function Footer() {
  return (
    <footer className="bg-primary text-neutral py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="font-display text-secondary text-xl">AROMASENS</h2>
            <p className="text-neutral-light text-sm mt-1">Encuentra tu fragancia perfecta</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-neutral-light hover:text-secondary transition-colors">
              <i className="ri-instagram-line text-xl"></i>
            </a>
            <a href="#" className="text-neutral-light hover:text-secondary transition-colors">
              <i className="ri-facebook-fill text-xl"></i>
            </a>
            <a href="#" className="text-neutral-light hover:text-secondary transition-colors">
              <i className="ri-twitter-x-line text-xl"></i>
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-neutral-dark text-sm">
          <p>&copy; {new Date().getFullYear()} AROMASENS Perfume Boutique. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
import { Link } from "wouter";
import { useAISettings } from "@/context/AISettingsContext";
import { getMessages } from "@/lib/aiService";
import BotidinamixLogo from "./BotidinamixLogo";

export default function Footer() {
  const { settings } = useAISettings();
  const messages = getMessages(settings.language);
  
  return (
    <footer className="py-4 px-4 border-t border-accent/20 text-center text-xs text-foreground/60 glass-effect">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="hover:text-accent transition-colors">
                {messages.home}
              </a>
            </Link>
            <Link href="/chat">
              <a className="hover:text-accent transition-colors">
                {messages.chat}
              </a>
            </Link>
            <Link href="/shop">
              <a className="hover:text-accent transition-colors">
                {settings.language === 'en' ? 'Shop' : 'Tienda'}
              </a>
            </Link>
          </div>
          
          <div className="flex items-center gap-1">
            <span>{messages.poweredBy}</span>
            <a 
              href="https://botidinamix.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-accent transition-colors"
            >
              <BotidinamixLogo className="h-4 w-auto ml-1" />
            </a>
          </div>
          
          <div>
            © 2025 AROMASENS. {messages.rightsReserved}
          </div>
        </div>
      </div>
    </footer>
  );
}
