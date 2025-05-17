
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAISettings } from "@/context/AISettingsContext";
import { Store, Search, Star, Heart, ShoppingCart, Filter, ChevronDown, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logoImg from "@/assets/aromasens-logo.png";
import { motion } from "framer-motion";

// Tipos para los productos
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  notes: string[];
  occasions: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  stock: number;
  details: {
    duracion: string;
    intensidad: string;
    estilo: string;
    popularidad: string;
  }
}

// Tipo para las reviews
interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

// Datos de perfumes AROMASENS
const productsData: Product[] = [
  {
    id: "fruto-silvestre",
    name: "Fruto Silvestre",
    brand: "AROMASENS",
    price: 85,
    originalPrice: 95,
    description: "Una explosión de frutas frescas como la frambuesa, la fresa y el arándano, combinada con un toque ligero de menta. Ideal para un día lleno de energía y frescura.",
    notes: ["Frambuesa", "Fresa", "Arándano", "Menta", "Almizcle"],
    occasions: "Uso diario, ambientes casuales, primavera/verano",
    rating: 4.8,
    reviewCount: 127,
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    isNew: true,
    stock: 12,
    details: {
      duracion: "6-8 horas",
      intensidad: "Media",
      estilo: "Casual y juvenil",
      popularidad: "Alta entre 18-30 años"
    }
  },
  {
    id: "bosque-de-lunas",
    name: "Bosque de Lunas",
    brand: "AROMASENS",
    price: 120,
    description: "Perfume que evoca la tranquilidad de un paseo nocturno por el bosque. Una mezcla armoniosa de madera de cedro y sándalo, con un toque suave de lavanda y musk.",
    notes: ["Cedro", "Sándalo", "Lavanda", "Musk", "Pachulí"],
    occasions: "Eventos nocturnos, ocasiones formales, otoño/invierno",
    rating: 4.9,
    reviewCount: 84,
    imageUrl: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    isBestSeller: true,
    stock: 5,
    details: {
      duracion: "8-10 horas",
      intensidad: "Alta",
      estilo: "Elegante y misterioso",
      popularidad: "Preferido por profesionales"
    }
  },
  {
    id: "citrico-oriental",
    name: "Cítrico Oriental",
    brand: "AROMASENS",
    price: 95,
    description: "Fusión entre la frescura de los cítricos como el limón y la naranja, con un corazón de especias orientales como el jengibre y el cardamomo. Elegante y audaz, para quienes buscan algo único.",
    notes: ["Limón", "Naranja", "Jengibre", "Cardamomo", "Ámbar"],
    occasions: "Eventos especiales, ocasiones de negocios, todo el año",
    rating: 4.7,
    reviewCount: 96,
    imageUrl: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    stock: 20,
    details: {
      duracion: "7-9 horas",
      intensidad: "Media-alta",
      estilo: "Sofisticado y versátil",
      popularidad: "Muy popular en temporada otoño-invierno"
    }
  },
  {
    id: "jardin-dulce",
    name: "Jardín Dulce",
    brand: "AROMASENS",
    price: 110,
    originalPrice: 130,
    description: "Un bouquet floral de jazmín, rosa y lirio del valle, acentuado por la suavidad de la vainilla y un toque frutal de manzana verde. Un perfume que te envuelve en un abrazo floral.",
    notes: ["Jazmín", "Rosa", "Lirio del valle", "Manzana verde", "Vainilla"],
    occasions: "Eventos románticos, celebraciones, primavera",
    rating: 4.6,
    reviewCount: 73,
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    isNew: true,
    stock: 8,
    details: {
      duracion: "6-7 horas",
      intensidad: "Media",
      estilo: "Romántico y delicado",
      popularidad: "Favorito para ocasiones especiales"
    }
  },
  {
    id: "selva-mistica",
    name: "Selva Mística",
    brand: "AROMASENS",
    price: 135,
    description: "Perfume amaderado con notas de vetiver, madera de roble y toques de incienso que evocan la esencia de un lugar misterioso y fascinante. Para los que buscan una fragancia profunda y enigmática.",
    notes: ["Vetiver", "Roble", "Incienso", "Almizcle"],
    occasions: "Eventos formales, noches especiales, otoño/invierno",
    rating: 4.9,
    reviewCount: 62,
    imageUrl: "https://images.unsplash.com/photo-1605804931335-34ac138adfe9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    isBestSeller: true,
    stock: 3,
    details: {
      duracion: "10-12 horas",
      intensidad: "Alta",
      estilo: "Intenso y enigmático",
      popularidad: "Exclusivo para conocedores"
    }
  },
  {
    id: "brisa-tropical",
    name: "Brisa Tropical",
    brand: "AROMASENS",
    price: 90,
    description: "Frescura en su máxima expresión, combinando notas frutales de piña, mango y coco con la suavidad de las flores de hibisco. Un perfume ideal para días calurosos y veraniegos.",
    notes: ["Piña", "Mango", "Coco", "Hibisco", "Flor de tiaré"],
    occasions: "Playa, actividades al aire libre, verano",
    rating: 4.5,
    reviewCount: 112,
    imageUrl: "https://images.unsplash.com/photo-1605126300886-3300a57a69e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    stock: 18,
    details: {
      duracion: "5-6 horas",
      intensidad: "Media-baja",
      estilo: "Fresco y despreocupado",
      popularidad: "Ideal para climas cálidos"
    }
  },
  {
    id: "euforia-de-noche",
    name: "Euforia de Noche",
    brand: "AROMASENS",
    price: 140,
    description: "Un perfume intenso que mezcla la calidez de la vainilla, el ámbar y el chocolate con un toque de frutas rojas. Es una fragancia que cautiva y perdura, perfecta para las noches especiales.",
    notes: ["Vainilla", "Ámbar", "Chocolate", "Frutos rojos", "Musk"],
    occasions: "Salidas nocturnas, eventos románticos, invierno",
    rating: 4.8,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    stock: 7,
    details: {
      duracion: "10-14 horas",
      intensidad: "Muy alta",
      estilo: "Seductor y memorable",
      popularidad: "Perfecto para eventos nocturnos"
    }
  },
  {
    id: "cielo-de-sandia",
    name: "Cielo de Sandía",
    brand: "AROMASENS",
    price: 80,
    originalPrice: 95,
    description: "Frutal y refrescante, con el jugoso aroma de la sandía, combinada con notas de melón y pepino para un toque verde y limpio. Perfecto para los amantes de las fragancias frescas y ligeras.",
    notes: ["Sandía", "Melón", "Pepino", "Menta"],
    occasions: "Uso diario, actividades deportivas, verano",
    rating: 4.6,
    reviewCount: 103,
    imageUrl: "https://images.unsplash.com/photo-1616510262525-ca77dadf5a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    stock: 15,
    details: {
      duracion: "4-6 horas",
      intensidad: "Baja",
      estilo: "Ligero y refrescante",
      popularidad: "Favorito para uso diario en verano"
    }
  },
  {
    id: "amor-de-lirio",
    name: "Amor de Lirio",
    brand: "AROMASENS",
    price: 125,
    description: "La fragancia del lirio blanco y las orquídeas se fusionan con una base amaderada de sándalo y cedro. Un perfume delicado y sofisticado, ideal para ocasiones especiales.",
    notes: ["Lirio blanco", "Orquídea", "Sándalo", "Cedro"],
    occasions: "Bodas, ceremonias, primavera",
    rating: 4.7,
    reviewCount: 67,
    imageUrl: "https://images.unsplash.com/photo-1608614291888-ef628e988eb1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    isNew: true,
    stock: 10,
    details: {
      duracion: "8-10 horas",
      intensidad: "Media-alta",
      estilo: "Elegante y romántico",
      popularidad: "Preferido para celebraciones especiales"
    }
  },
  {
    id: "horizon-musk",
    name: "Horizon Musk",
    brand: "AROMASENS",
    price: 115,
    description: "Un perfume unisex que combina la calidez del almizcle con la frescura de las frutas cítricas y la suavidad de la madera de roble. Ideal para un estilo de vida activo y moderno.",
    notes: ["Almizcle", "Naranja", "Roble", "Bergamota", "Lavanda"],
    occasions: "Uso diario, ambiente de trabajo, todo el año",
    rating: 4.7,
    reviewCount: 91,
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    stock: 9,
    details: {
      duracion: "7-9 horas",
      intensidad: "Media",
      estilo: "Moderno y versátil",
      popularidad: "Popular entre profesionales"
    }
  }
];

// Reseñas de ejemplo para productos
const reviewsData: Record<string, Review[]> = {
  "fruto-silvestre": [
    { id: 1, userName: "Marta L.", rating: 5, comment: "¡Increíble fragancia! Me encanta lo fresca y juvenil que es. Perfecta para el día a día.", date: "15/04/2025", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, userName: "Carlos R.", rating: 5, comment: "La compré para mi pareja y está encantada. Las notas de frambuesa son deliciosas.", date: "02/04/2025", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, userName: "Elena T.", rating: 4, comment: "Muy buena fragancia pero la duración podría ser mejor. Aun así, la volvería a comprar.", date: "28/03/2025", avatar: "https://i.pravatar.cc/150?img=3" }
  ],
  "bosque-de-lunas": [
    { id: 1, userName: "Javier M.", rating: 5, comment: "Sofisticado y misterioso. El aroma a madera me transporta a un bosque otoñal.", date: "12/04/2025", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 2, userName: "Laura S.", rating: 5, comment: "Lo uso para eventos formales y siempre recibo cumplidos. Una joya de AROMASENS.", date: "05/04/2025", avatar: "https://i.pravatar.cc/150?img=5" }
  ],
  "citrico-oriental": [
    { id: 1, userName: "Miguel Á.", rating: 5, comment: "La mezcla de cítricos con especias orientales es única. Mi perfume favorito actualmente.", date: "18/04/2025", avatar: "https://i.pravatar.cc/150?img=6" },
    { id: 2, userName: "Sandra P.", rating: 4, comment: "Muy buen equilibrio entre frescura y calidez. Versátil para todo el año.", date: "29/03/2025", avatar: "https://i.pravatar.cc/150?img=7" }
  ]
};

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortOption, setSortOption] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { settings } = useAISettings();
  
  // Filtrar productos
  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.notes.some(note => note.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           (selectedCategory === "new" && product.isNew) ||
                           (selectedCategory === "best-seller" && product.isBestSeller);
    
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortOption) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default: // featured
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    }
  });
  
  // Agregar al carrito
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingCartItem = cart.find(item => item.product.id === product.id);
    
    if (existingCartItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? {...item, quantity: item.quantity + quantity} 
          : item
      ));
    } else {
      setCart([...cart, {product, quantity}]);
    }
    
    // Mostrar el carrito brevemente
    setShowCart(true);
    setTimeout(() => setShowCart(false), 3000);
  };
  
  // Remover del carrito
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };
  
  // Actualizar cantidad en carrito
  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(cart.map(item => 
      item.product.id === productId 
        ? {...item, quantity: Math.max(1, quantity)} 
        : item
    ));
  };
  
  // Calcular total del carrito
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  // Mostrar detalles del producto
  const showProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab("description");
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-70">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-accent/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        {/* Header y título */}
        <header className="mb-10 text-center">
          <Link href="/">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 logo-container overflow-hidden animate-float">
                <img 
                  src={logoImg} 
                  alt="AROMASENS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl text-gradient font-bold mb-2"
          >
            BOUTIQUE AROMASENS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-foreground/80 max-w-2xl mx-auto"
          >
            Descubre nuestra colección exclusiva de fragancias diseñadas para despertar emociones y crear recuerdos inolvidables
          </motion.p>
        </header>

        {/* Barra de búsqueda */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-foreground/50" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, notas o descripción..."
                className="w-full bg-card border border-accent/20 rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <button 
                  className="flex items-center gap-2 glass-effect py-3 px-5 rounded-full"
                  onClick={() => document.getElementById('filterMenu')?.classList.toggle('hidden')}
                >
                  <Filter className="h-5 w-5" />
                  <span>Filtros</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div id="filterMenu" className="hidden absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-lg z-10 p-4 border border-accent/20">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Categoría</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="category" 
                          value="all" 
                          checked={selectedCategory === "all"} 
                          onChange={() => setSelectedCategory("all")}
                          className="accent-accent"
                        />
                        <span>Todos</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="category" 
                          value="new" 
                          checked={selectedCategory === "new"} 
                          onChange={() => setSelectedCategory("new")}
                          className="accent-accent"
                        />
                        <span>Novedades</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="category" 
                          value="best-seller" 
                          checked={selectedCategory === "best-seller"} 
                          onChange={() => setSelectedCategory("best-seller")}
                          className="accent-accent"
                        />
                        <span>Más vendidos</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Precio</h3>
                    <div className="flex items-center justify-between gap-4">
                      <input 
                        type="number" 
                        value={priceRange[0]} 
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-20 p-2 rounded bg-background border border-accent/20"
                        min="0"
                      />
                      <span>a</span>
                      <input 
                        type="number" 
                        value={priceRange[1]} 
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-20 p-2 rounded bg-background border border-accent/20"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-2 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors"
                    onClick={() => document.getElementById('filterMenu')?.classList.add('hidden')}
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  className="flex items-center gap-2 glass-effect py-3 px-5 rounded-full"
                  onClick={() => document.getElementById('sortMenu')?.classList.toggle('hidden')}
                >
                  <span>Ordenar</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div id="sortMenu" className="hidden absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg z-10 p-4 border border-accent/20">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="featured" 
                        checked={sortOption === "featured"} 
                        onChange={() => setSortOption("featured")}
                        className="accent-accent"
                      />
                      <span>Destacados</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="price-asc" 
                        checked={sortOption === "price-asc"} 
                        onChange={() => setSortOption("price-asc")}
                        className="accent-accent"
                      />
                      <span>Precio: Menor a Mayor</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="price-desc" 
                        checked={sortOption === "price-desc"} 
                        onChange={() => setSortOption("price-desc")}
                        className="accent-accent"
                      />
                      <span>Precio: Mayor a Menor</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="rating" 
                        checked={sortOption === "rating"} 
                        onChange={() => setSortOption("rating")}
                        className="accent-accent"
                      />
                      <span>Mejor valorados</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="newest" 
                        checked={sortOption === "newest"} 
                        onChange={() => setSortOption("newest")}
                        className="accent-accent"
                      />
                      <span>Más recientes</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <button 
                className={`p-3 rounded-full ${viewMode === 'grid' ? 'bg-accent/20' : 'glass-effect'}`}
                onClick={() => setViewMode("grid")}
                title="Vista de cuadrícula"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              
              <button 
                className={`p-3 rounded-full ${viewMode === 'list' ? 'bg-accent/20' : 'glass-effect'}`}
                onClick={() => setViewMode("list")}
                title="Vista de lista"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              
              <button 
                className="p-3 glass-effect rounded-full relative"
                onClick={() => setShowCart(!showCart)}
                title="Ver carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Carrito de compras */}
        {showCart && (
          <div className="fixed top-20 right-4 w-80 md:w-96 bg-card shadow-lg rounded-xl z-50 p-4 border border-accent/20 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Carrito de compras</h3>
              <button onClick={() => setShowCart(false)} className="text-foreground/50 hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <ShoppingCart className="h-12 w-12 mx-auto text-foreground/30" />
                </div>
                <p className="text-foreground/50">Tu carrito está vacío</p>
                <button 
                  className="mt-4 py-2 px-4 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors"
                  onClick={() => setShowCart(false)}
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-2 hover:bg-accent/5 rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-accent font-medium text-sm">${item.product.price}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            className="w-6 h-6 rounded-full border border-foreground/20 flex items-center justify-center text-sm"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button 
                            className="w-6 h-6 rounded-full border border-foreground/20 flex items-center justify-center text-sm"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button 
                        className="text-foreground/40 hover:text-accent transition-colors p-1"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-accent/10 pt-3">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 py-2 px-4 bg-foreground/10 text-foreground rounded-full text-sm hover:bg-foreground/20 transition-colors"
                      onClick={() => setShowCart(false)}
                    >
                      Seguir comprando
                    </button>
                    <button 
                      className="flex-1 py-2 px-4 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors"
                    >
                      Finalizar compra
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Vista de detalle de producto seleccionado */}
        {selectedProduct ? (
          <div className="mb-12">
            <button 
              className="mb-6 flex items-center gap-1 text-accent hover:underline"
              onClick={() => setSelectedProduct(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Volver a todos los productos
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden glass-card border border-accent/20">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {selectedProduct.isNew && (
                  <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                    Nuevo
                  </div>
                )}
                
                {selectedProduct.isBestSeller && (
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    Más vendido
                  </div>
                )}
                
                {selectedProduct.originalPrice && (
                  <div className="absolute top-4 right-4 bg-accent/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%
                  </div>
                )}
              </div>
              
              <div>
                <div className="glass-effect py-1 px-4 rounded-full text-xs uppercase tracking-wider text-accent font-medium border border-accent/20 inline-block mb-2">
                  {selectedProduct.brand}
                </div>
                
                <h2 className="font-serif text-3xl font-bold text-gradient mb-2">
                  {selectedProduct.name}
                </h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground/70">{selectedProduct.rating}</span>
                  <span className="text-foreground/50">({selectedProduct.reviewCount} reseñas)</span>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">${selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xl text-foreground/50 line-through">${selectedProduct.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-accent mt-1">
                    {selectedProduct.stock <= 5 ? (
                      <span className="text-red-500">¡Solo quedan {selectedProduct.stock} unidades!</span>
                    ) : (
                      <span>Disponible: {selectedProduct.stock} unidades</span>
                    )}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="font-medium mb-2">Cantidad</h3>
                  <div className="flex items-center">
                    <button 
                      className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center"
                      onClick={() => {
                        const quantity = document.getElementById('quantity') as HTMLInputElement;
                        if (parseInt(quantity.value) > 1) {
                          quantity.value = (parseInt(quantity.value) - 1).toString();
                        }
                      }}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      id="quantity" 
                      defaultValue="1" 
                      min="1"
                      max={selectedProduct.stock}
                      className="w-14 text-center mx-2 p-2 rounded bg-background border border-accent/20"
                    />
                    <button 
                      className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center"
                      onClick={() => {
                        const quantity = document.getElementById('quantity') as HTMLInputElement;
                        if (parseInt(quantity.value) < selectedProduct.stock) {
                          quantity.value = (parseInt(quantity.value) + 1).toString();
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <button 
                    className="flex-1 py-3 px-6 bg-accent hover:bg-accent/90 text-white rounded-full flex items-center justify-center gap-2 transition-colors"
                    onClick={() => {
                      const quantity = document.getElementById('quantity') as HTMLInputElement;
                      addToCart(selectedProduct, parseInt(quantity.value));
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Añadir al carrito
                  </button>
                  
                  <button className="flex-1 py-3 px-6 border border-accent/50 text-accent rounded-full flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors">
                    <Heart className="h-5 w-5" />
                    Añadir a favoritos
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-accent/10 text-accent">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="22" height="18" rx="2" ry="2" />
                        <line x1="1" y1="9" x2="23" y2="9" />
                        <path d="M15 14h1" />
                        <path d="M19 14h1" />
                        <path d="M8 14h3" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Pago seguro</h4>
                      <p className="text-sm text-foreground/70">Todas las transacciones están protegidas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-accent/10 text-accent">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                        <path d="M12 12v9" />
                        <path d="m8 17 4 4 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Envío rápido</h4>
                      <p className="text-sm text-foreground/70">Entrega en 24-48 horas (días laborables)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-accent/10 text-accent">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m7.9 20 6.2-16" />
                        <path d="M4.9 9h9.2" />
                        <path d="M4.9 15h9.2" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Personalización</h4>
                      <p className="text-sm text-foreground/70">Opción de empaquetado para regalo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs de información del producto */}
            <div className="mb-6">
              <div className="flex border-b border-accent/20">
                <button 
                  className={`py-3 px-5 ${activeTab === 'description' ? 'border-b-2 border-accent text-accent' : 'text-foreground/60 hover:text-foreground/80'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Descripción
                </button>
                <button 
                  className={`py-3 px-5 ${activeTab === 'details' ? 'border-b-2 border-accent text-accent' : 'text-foreground/60 hover:text-foreground/80'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Detalles
                </button>
                <button 
                  className={`py-3 px-5 ${activeTab === 'reviews' ? 'border-b-2 border-accent text-accent' : 'text-foreground/60 hover:text-foreground/80'}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reseñas ({selectedProduct.reviewCount})
                </button>
              </div>
              
              <div className="py-6">
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <p className="leading-relaxed">{selectedProduct.description}</p>
                    <div>
                      <h3 className="font-medium mb-2">Notas principales</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.notes.map((note, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm border border-accent/20" 
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Ocasiones recomendadas</h3>
                      <p>{selectedProduct.occasions}</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-effect p-6 rounded-xl">
                        <h3 className="font-medium mb-4 text-accent">Características</h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-foreground/70">Marca</span>
                            <span className="font-medium">{selectedProduct.brand}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-foreground/70">Duración</span>
                            <span className="font-medium">{selectedProduct.details.duracion}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-foreground/70">Intensidad</span>
                            <span className="font-medium">{selectedProduct.details.intensidad}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-foreground/70">Estilo</span>
                            <span className="font-medium">{selectedProduct.details.estilo}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-foreground/70">Tipo</span>
                            <span className="font-medium">Eau de Parfum</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-foreground/70">Tamaño</span>
                            <span className="font-medium">100ml</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="glass-effect p-6 rounded-xl">
                        <h3 className="font-medium mb-4 text-accent">Información adicional</h3>
                        <p className="mb-4">
                          Cada fragancia AROMASENS está creada con ingredientes de la más alta calidad,
                          seleccionados cuidadosamente por nuestros maestros perfumistas. Elaborado en
                          Francia siguiendo técnicas tradicionales con un enfoque moderno.
                        </p>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Instrucciones de uso</h4>
                          <p className="text-sm text-foreground/70">
                            Aplicar en los puntos de pulso: muñecas, cuello y detrás de las orejas.
                            Para mayor duración, aplicar sobre la piel hidratada.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="font-medium mb-4">Envío y devoluciones</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-accent/20 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Envío estándar</h4>
                          <p className="text-sm text-foreground/70">
                            2-4 días laborables. Gratuito para pedidos superiores a $100.
                          </p>
                        </div>
                        <div className="p-4 border border-accent/20 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Envío express</h4>
                          <p className="text-sm text-foreground/70">
                            24-48 horas. Con coste adicional de $15.
                          </p>
                        </div>
                        <div className="p-4 border border-accent/20 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Devoluciones</h4>
                          <p className="text-sm text-foreground/70">
                            30 días para devoluciones. El producto debe estar sin abrir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{selectedProduct.rating}</div>
                        <div className="flex justify-center my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-foreground/60">{selectedProduct.reviewCount} reseñas</div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm w-6">5★</div>
                            <div className="flex-grow h-2 bg-foreground/10 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400" style={{width: '80%'}}></div>
                            </div>
                            <div className="text-sm text-foreground/60 w-8">80%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm w-6">4★</div>
                            <div className="flex-grow h-2 bg-foreground/10 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400" style={{width: '15%'}}></div>
                            </div>
                            <div className="text-sm text-foreground/60 w-8">15%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm w-6">3★</div>
                            <div className="flex-grow h-2 bg-foreground/10 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400" style={{width: '3%'}}></div>
                            </div>
                            <div className="text-sm text-foreground/60 w-8">3%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm w-6">2★</div>
                            <div className="flex-grow h-2 bg-foreground/10 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400" style={{width: '1%'}}></div>
                            </div>
                            <div className="text-sm text-foreground/60 w-8">1%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm w-6">1★</div>
                            <div className="flex-grow h-2 bg-foreground/10 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400" style={{width: '1%'}}></div>
                            </div>
                            <div className="text-sm text-foreground/60 w-8">1%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <button className="py-2 px-4 bg-accent text-white rounded-full text-sm">
                          Escribir reseña
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {(reviewsData[selectedProduct.id] || []).map((review) => (
                        <div key={review.id} className="p-4 glass-effect rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src={review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=random`} 
                                alt={review.userName} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{review.userName}</div>
                              <div className="text-sm text-foreground/60">{review.date}</div>
                            </div>
                            <div className="ml-auto flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-foreground/80">{review.comment}</p>
                        </div>
                      ))}
                      
                      {(!reviewsData[selectedProduct.id] || reviewsData[selectedProduct.id].length === 0) && (
                        <div className="text-center py-10">
                          <p className="text-foreground/50">No hay reseñas para este producto todavía. ¡Sé el primero en escribir una!</p>
                        </div>
                      )}
                      
                      {reviewsData[selectedProduct.id] && reviewsData[selectedProduct.id].length > 0 && (
                        <div className="text-center mt-4">
                          <button className="py-2 px-4 glass-effect border border-accent/20 rounded-full text-sm">
                            Ver todas las reseñas ({selectedProduct.reviewCount})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Productos relacionados */}
            <div className="mt-16">
              <h2 className="font-serif text-2xl text-gradient font-bold mb-6">
                También podría interesarte
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {sortedProducts
                  .filter(p => p.id !== selectedProduct.id)
                  .slice(0, 4)
                  .map((product) => (
                    <Card
                      key={product.id}
                      className="glass-card hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-accent/20 overflow-hidden"
                      onClick={() => showProductDetails(product)}
                    >
                      <div className="relative">
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        
                        {product.isNew && (
                          <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                            Nuevo
                          </div>
                        )}
                        
                        {product.isBestSeller && (
                          <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                            Top ventas
                          </div>
                        )}
                        
                        {product.originalPrice && (
                          <div className="absolute top-2 right-2 bg-accent/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}
                        
                        <button 
                          className="absolute bottom-2 right-2 p-2 rounded-full bg-card/80 hover:bg-accent text-foreground hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-foreground/60">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-foreground/50 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Resumen de productos */}
            <div className="mb-4">
              <p className="text-foreground/70">
                Mostrando {sortedProducts.length} de {productsData.length} productos
              </p>
            </div>
            
            {/* Lista de productos */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="glass-card hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-accent/20 overflow-hidden"
                    onClick={() => showProductDetails(product)}
                  >
                    <div className="relative">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      {product.isNew && (
                        <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                          Nuevo
                        </div>
                      )}
                      
                      {product.isBestSeller && (
                        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                          Top ventas
                        </div>
                      )}
                      
                      {product.originalPrice && (
                        <div className="absolute top-2 right-2 bg-accent/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <button 
                          className="p-2 rounded-full bg-card/80 hover:bg-accent/20 text-foreground hover:text-accent transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle favorite
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 rounded-full bg-card/80 hover:bg-accent text-foreground hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-foreground/60">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-foreground/50 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        {product.stock <= 5 && (
                          <span className="text-xs text-red-500">¡Últimas unidades!</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="glass-card hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-accent/20 rounded-xl overflow-hidden"
                    onClick={() => showProductDetails(product)}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 md:w-64">
                        <div className="aspect-square sm:h-full overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        
                        {product.isNew && (
                          <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                            Nuevo
                          </div>
                        )}
                        
                        {product.isBestSeller && (
                          <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                            Top ventas
                          </div>
                        )}
                        
                        {product.originalPrice && (
                          <div className="absolute top-2 right-2 bg-accent/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-foreground/60">({product.reviewCount})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-lg">${product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-foreground/50 line-through">${product.originalPrice}</span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {product.notes.slice(0, 3).map((note, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs" 
                                >
                                  {note}
                                </span>
                              ))}
                              {product.notes.length > 3 && (
                                <span className="px-2 py-1 bg-foreground/10 text-foreground/60 rounded-full text-xs">
                                  +{product.notes.length - 3} más
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center text-sm text-foreground/70">
                              <span className="mr-2 font-medium">Ideal para:</span>
                              <span>{product.occasions}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-accent/10">
                          <div>
                            {product.stock <= 5 ? (
                              <span className="text-sm text-red-500 font-medium">¡Solo quedan {product.stock} unidades!</span>
                            ) : (
                              <span className="text-sm text-accent">Disponible: {product.stock} unidades</span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              className="p-2 rounded-full bg-foreground/10 hover:bg-accent/20 text-foreground hover:text-accent transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle favorite
                              }}
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                            <button 
                              className="py-2 px-4 bg-accent hover:bg-accent/90 text-white rounded-full flex items-center gap-2 transition-colors text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Añadir al carrito
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Mensaje si no hay resultados */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-foreground/30">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">No se encontraron resultados</h3>
                <p className="text-foreground/60 max-w-md mx-auto">
                  No hemos encontrado productos que coincidan con tu búsqueda. Intenta con otros términos o ajusta los filtros.
                </p>
                <button 
                  className="mt-4 py-2 px-4 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPriceRange([0, 200]);
                  }}
                >
                  Restablecer filtros
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Sección de suscripción al boletín */}
        <div className="mt-20 mb-10">
          <div className="glass-effect rounded-2xl p-8 backdrop-blur-md fancy-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-accent/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-3xl"></div>

            <div className="max-w-3xl mx-auto text-center">
              <h3 className="font-serif text-3xl text-gradient mb-4">Únete a nuestro club exclusivo</h3>
              <p className="text-foreground/80 mb-6">
                Suscríbete a nuestro boletín y recibe novedades, ofertas exclusivas y un 10% de descuento en tu primera compra.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  className="flex-grow bg-card border border-accent/20 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
                <button className="btn-animated py-3 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg hover:shadow-accent/20 transition-all duration-300">
                  Suscribirme
                </button>
              </div>
              
              <p className="text-xs text-foreground/60 mt-4">
                Al suscribirte, aceptas nuestra política de privacidad y consientes recibir comunicaciones comerciales.
              </p>
            </div>
          </div>
        </div>
        
        {/* Testimonios destacados */}
        <div className="mt-16 mb-20">
          <h2 className="font-serif text-3xl text-gradient font-bold mb-10 text-center">
            Lo que dicen nuestros clientes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect p-6 rounded-xl relative">
              <div className="absolute -top-4 left-6 text-4xl text-accent">"</div>
              <p className="mb-4 pt-4">
                Los perfumes de AROMASENS han transformado la manera en que me siento cada día. La calidad y duración son simplemente excepcionales.
              </p>
              <div className="flex items-center mt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://i.pravatar.cc/150?img=10" 
                    alt="Cliente" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Laura Martínez</h4>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl relative">
              <div className="absolute -top-4 left-6 text-4xl text-accent">"</div>
              <p className="mb-4 pt-4">
                Me encanta la exclusividad de sus fragancias. Cada vez que uso "Bosque de Lunas" recibo cumplidos. Es mi firma personal.
              </p>
              <div className="flex items-center mt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://i.pravatar.cc/150?img=11" 
                    alt="Cliente" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Carlos Ruiz</h4>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl relative">
              <div className="absolute -top-4 left-6 text-4xl text-accent">"</div>
              <p className="mb-4 pt-4">
                El servicio es impecable. Pedí "Euforia de Noche" como regalo para mi pareja y llegó perfectamente empaquetado. ¡Volveré a comprar!
              </p>
              <div className="flex items-center mt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://i.pravatar.cc/150?img=12" 
                    alt="Cliente" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Elena Torres</h4>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Características de AROMASENS */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M12 2L8 6H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-4-4z" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="m19 15-2 2-2-2" />
                  <path d="M5 15 7 9" />
                  <line x1="7" y1="9" x2="17" y2="9" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Ingredientes exclusivos</h3>
              <p className="text-foreground/70">
                Seleccionamos los ingredientes más exclusivos de todo el mundo para crear fragancias únicas y duraderas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M20 17a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16z" />
                  <path d="M14 17v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3" />
                  <path d="M6 2v3" />
                  <path d="M10 2v3" />
                  <path d="M14 2v3" />
                  <path d="M18 2v3" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Elaboración artesanal</h3>
              <p className="text-foreground/70">
                Cada perfume está elaborado artesanalmente siguiendo las técnicas tradicionales francesas con un toque moderno.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="m2 9 3-3 3 3 4-4 3 3 2-2 3 3v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
                  <path d="M13.8 13H18l-8-8-4 4-3-3v4" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Sostenibilidad</h3>
              <p className="text-foreground/70">
                Comprometidos con el medio ambiente, utilizamos envases reciclables y prácticas sostenibles en todo nuestro proceso.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="glass-effect border-t border-accent/20 py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 logo-container overflow-hidden">
                  <img 
                    src={logoImg} 
                    alt="AROMASENS Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-serif text-xl text-gradient">AROMASENS</h3>
              </div>
              <p className="text-foreground/70 mb-4">
                Perfumes exclusivos elaborados con los mejores ingredientes para quienes buscan una experiencia sensorial única.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="p-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="p-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a href="#" className="p-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-accent transition-colors">Inicio</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Tienda</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Nuestra historia</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Contacto</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Información</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-accent transition-colors">Términos y condiciones</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Envíos y devoluciones</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Preguntas frecuentes</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Programa de fidelidad</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Contacto</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-accent mt-1" />
                  <span>+34 912 345 678</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-accent mt-1" />
                  <span>info@aromasens.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent mt-1" />
                  <span>Calle Gran Vía 123, 28013 Madrid, España</span>
                </li>
                <li>
                  <h4 className="font-medium mb-2">Horario de atención</h4>
                  <p className="text-foreground/70">Lun-Vie: 9:00-20:00<br />Sáb: 10:00-14:00</p>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-accent/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/60 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} AROMASENS. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <img src="https://cdn-icons-png.flaticon.com/128/196/196578.png" alt="Visa" className="h-6" />
              <img src="https://cdn-icons-png.flaticon.com/128/196/196561.png" alt="MasterCard" className="h-6" />
              <img src="https://cdn-icons-png.flaticon.com/128/196/196539.png" alt="PayPal" className="h-6" />
              <img src="https://cdn-icons-png.flaticon.com/128/196/196565.png" alt="American Express" className="h-6" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
