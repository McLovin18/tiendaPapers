"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  title: string;
  image: string;
  link: string;
}

const categories: Category[] = [
  { id: 1, title: "Engrapadoras", image: "/engrapadora.jpeg", link: "/categories/grapadoras" },
  { id: 2, title: "Organizadores de Escritorio", image: "/organizadoresEscritorio.jpeg", link: "/categories/organizadores-de-escritorio" },
  { id: 3, title: "Bolígrafos", image: "/boligrafos.jpeg", link: "/categories/boligrafos" },
  { id: 4, title: "Cuadernos", image: "/cuadernos.jpeg", link: "/categories/cuadernos" },
  { id: 5, title: "Tijeras", image: "/tijeras.jpeg", link: "/categories/tijeras" },
  { id: 6, title: "Carpetas", image: "/carpetas.jpeg", link: "/categories/carpetas" },
];

const FeaturedCategories = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Controla visibilidad de flechas dinámicamente
  const checkScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const container = containerRef.current;
    if (container) container.addEventListener("scroll", checkScroll);
    return () => container?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const cardWidth = container.firstElementChild?.clientWidth || 0;
    const scrollAmount = cardWidth + 16; // un poco de espacio entre tarjetas
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="my-10 relative">
      <h2
        className="text-center mb-6 fw-bold"
        style={{ fontSize: "2rem", color: "var(--cosmetic-tertiary)" }}
      >
        Categorías Destacadas
      </h2>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Flecha Izquierda */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition ${
            !canScrollLeft ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft size={28} />
        </button>

        {/* Carrusel scrollable */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto scroll-smooth no-scrollbar gap-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex-none scroll-snap-align-start w-full sm:w-[48%] lg:w-[32%] relative"
              style={{ height: "380px", borderRadius: "1rem", overflow: "hidden" }}
            >
              <div className="relative hover:scale-[1.03] transition-transform duration-300 h-full">
                <Image src={cat.image} alt={cat.title} fill style={{ objectFit: "cover" }} />
                <div
                  className="absolute bottom-0 start-0 w-full p-3 text-center"
                  style={{
                    background: "linear-gradient(to top, rgba(58,48,41,0.8), transparent)",
                  }}
                >
                  <h3 className="text-white fw-bold mb-3 text-lg sm:text-xl">{cat.title}</h3>
                  <Link
                    href={cat.link}
                    className="btn btn-cosmetic-primary rounded-1 px-4 text-decoration-none text-sm sm:text-base"
                  >
                    Ver Colección
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flecha Derecha */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition ${
            !canScrollRight ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
};

export default FeaturedCategories;
