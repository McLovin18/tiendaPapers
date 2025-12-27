'use client';

import React, { useState, useEffect } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { addFavourite, removeFavourite, getUserFavourites } from "../services/purchaseService";
import { useRouter } from "next/navigation";


interface FavouriteButtonProps {
  product: {
    id: string | number;
    name: string;
    price: number;
    images: string[];
    description?: string;
  };
  size?: 'sm' | 'lg'; // tamaño opcional para ajustar altura
  fullHeight?: boolean; // 🔹 estirar a la altura del contenedor
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ product, size, fullHeight }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);

  const productImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "/images/product1.svg";

  // ✅ Al montar o cuando cambia el usuario, consulta Firestore
  useEffect(() => {
    const fetchFavStatus = async () => {
      if (!user?.uid) {
        setIsFav(false);
        return;
      }
      const favs = await getUserFavourites(user.uid);
      setIsFav(favs.some((fav: any) => fav.id == product.id));
    };
    fetchFavStatus();
  }, [user?.uid, product.id]);

  // ✅ Agregar o quitar de Firestore
  const toggleFavourite = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (isFav) {
      await removeFavourite(user.uid, product.id);
    } else {
      await addFavourite(user.uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImage,
        description: product.description || "",
      });
    }

    // 🔥 Volver a consultar para actualizar estado real
    const favs = await getUserFavourites(user.uid);
    setIsFav(favs.some((fav: any) => fav.id == product.id));
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={!user ? <Tooltip>Inicia sesión para guardar en favoritos</Tooltip> : <div></div>}
    >
      <Button
        size={size}
        className={`rounded-1 ${isFav ? 'btn-cosmetic-accent' : 'btn-outline-cosmetic-primary'}`}
        onClick={toggleFavourite}
        aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        style={{
          backgroundColor: isFav ? 'var(--cosmetic-accent)' : 'transparent',
          borderColor: isFav ? 'var(--cosmetic-accent)' : 'var(--cosmetic-primary)',
          color: isFav ? 'white' : 'var(--cosmetic-primary)',
          ...(fullHeight
            ? {
                height: '100%',               // 🔹 misma altura que el botón grande del lado
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
            : {}),
        }}
      >
        <i className={`bi ${isFav ? "bi-heart-fill" : "bi-heart"}`}></i>
      </Button>
    </OverlayTrigger>
  );
};

export default FavouriteButton;
