"use client";

import { useState } from "react";
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
  {
    id: 1,
    title: "Engrapadoras",
    image: "/engrapadora.jpeg",
    link: "/categories/grapadoras",
  },
  {
    id: 2,
    title: "Organizadores de Escritorio",
    image: "/organizadoresEscritorio.jpeg",
    link: "/categories/organizadores-de-escritorio",
  },
  {
    id: 3,
    title: "Bolígrafos",
    image: "/boligrafos.jpeg",
    link: "/categories/boligrafos",
  },
  {
    id: 4,
    title: "Cuadernos",
    image: "/cuadernos.jpeg",
    link: "/categories/cuadernos",
  },
  {
    id: 5,
    title: "Tijeras",
    image: "/tijeras.jpeg",
    link: "/categories/tijeras",
  },
  {
    id: 6,
    title: "Carpetas",
    image: "/carpetas.jpeg",
    link: "/categories/carpetas",
  },
];

const FeaturedCategories = () => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < categories.length - 3) {
      setIndex(index + 1);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <section className="my-10 relative">
      <h2
        className="text-center mb-6 fw-bold"
        style={{ fontSize: "2rem", color: "var(--cosmetic-tertiary)" }}
      >
        Categorías Destacadas
      </h2>

      <div className="relative flex items-center justify-center">
        {/* Flecha Izquierda */}
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="absolute left-0 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition disabled:opacity-40"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Contenedor de las categorías */}
        <div className="overflow-hidden w-full max-w-6xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${index * (100 / 3)}%)`,
              width: `${(categories.length * 100) / 6}%`,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="w-1/3 px-3 flex-shrink-0"
                style={{ height: "400px" }}
              >
                <div
                  className="relative hover:scale-105 transition-transform duration-300"
                  style={{
                    borderRadius: "1rem",
                    overflow: "hidden",
                    height: "100%",
                  }}
                >
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div
                    className="absolute bottom-0 start-0 w-100 p-3 text-center"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(58,48,41,0.8), transparent)",
                    }}
                  >
                    <h3 className="text-white fw-bold mb-3">{cat.title}</h3>
                    <Link
                      href={cat.link}
                      className="btn btn-cosmetic-primary rounded-1 px-4 text-decoration-none"
                    >
                      Ver Colección
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flecha Derecha */}
        <button
          onClick={handleNext}
          disabled={index >= categories.length - 3}
          className="absolute right-0 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition disabled:opacity-40"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
};

export default FeaturedCategories;
