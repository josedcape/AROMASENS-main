// Configuración del WebSocket
export function setupWebSocket(token: string, onMessage: (data: any) => void) {
  // Obtener el host actual
  const host = window.location.hostname;
  // Usar el puerto 5000 para desarrollo local, o el puerto actual para producción
  const port = process.env.NODE_ENV === 'development' ? '5000' : window.location.port;
  
  // Construir la URL del WebSocket asegurándose de que el puerto esté definido
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${host}${port ? ':' + port : ''}/?token=${token}`;
  
  console.log("Conectando WebSocket a:", wsUrl);
  
  try {
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket conectado");
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("Error al procesar mensaje WebSocket:", error);
      }
    };
    
    socket.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };
    
    socket.onclose = () => {
      console.log("WebSocket desconectado");
      // Intentar reconectar después de un tiempo
      setTimeout(() => {
        setupWebSocket(token, onMessage);
      }, 5000);
    };
    
    return socket;
  } catch (error) {
    console.error("Error al configurar WebSocket:", error);
    return null;
  }
}