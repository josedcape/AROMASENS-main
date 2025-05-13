import { QueryClient, QueryFunction } from "@tanstack/react-query";

export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = (await res.text()) || res.statusText;
      console.error(`Error en la respuesta: ${res.status}: ${text}`);
      throw new Error(`${res.status}: ${text}`);
    } catch (error) {
      console.error("Error al procesar la respuesta:", error);
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  headers?: HeadersInit
) {
  try {
    // Añadir log para depuración
    if (process.env.NODE_ENV === 'development' && body) {
      console.log(`Enviando datos a ${url}:`, body);
    }
    
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Intentar obtener y mostrar el cuerpo del error para mejor diagnóstico si hay error
    if (!res.ok) {
      console.warn(`Error en la solicitud a ${url}: ${res.status} ${res.statusText}`);
      
      try {
        const errorText = await res.text();
        console.warn(`Detalles del error:`, errorText);
      } catch (e) {
        console.warn(`No se pudieron obtener detalles adicionales del error`);
      }
      
      // No devolver respuesta simulada, lanzar el error
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    
    return res;
  } catch (error) {
    console.error(`Error en la solicitud a ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

