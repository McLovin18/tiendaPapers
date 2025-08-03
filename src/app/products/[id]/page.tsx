'use client';

import React, { useState, useEffect , useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Row, Col, Button, Form, Tabs, Tab, Badge, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import NavbarComponent from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoginRequired from '../../components/LoginRequired';
import { addFavourite, removeFavourite, getUserFavourites, addProductComment, getProductComments, updateProductRating, addReplyToComment } from '../../services/purchaseService';
import allProducts from '../productsData';
import FavouriteButton from '../../components/FavouriteButton';
import Footer from "../../components/Footer";
import { recommendationEngine, type Product } from '../../services/recommendationService';
import { cartService } from '../../services/cartService';

const ProductDetailPage = () => {
  // Función para mapear colores a códigos hexadecimales
  const getColorCode = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'blanco': '#ffffff',
      'white': '#ffffff',
      'negro': '#000000',
      'black': '#000000',
      'azul': '#007bff',
      'blue': '#007bff',
      'azul marino': '#001f3f',
      'navy': '#001f3f',
      'rojo': '#dc3545',
      'red': '#dc3545',
      'verde': '#28a745',
      'green': '#28a745',
      'verde oscuro': '#155724',
      'gris': '#6c757d',
      'gray': '#6c757d',
      'grey': '#6c757d',
      'plomo': '#708090',
      'rosa': '#e91e63',
      'pink': '#e91e63',
      'amarillo': '#ffc107',
      'yellow': '#ffc107',
      'beige': '#f5f5dc',
      'celeste': '#87ceeb',
      'naranja': '#fd7e14',
      'orange': '#fd7e14',
      'morado': '#6f42c1',
      'purple': '#6f42c1',
      'violeta': '#6f42c1',
      'cafe': '#8b4513',
      'brown': '#8b4513',
      'marron': '#8b4513'
    };
    
    return colorMap[colorName.toLowerCase()] || '#ccc';
  };

  // Control de comentarios y respuestas visibles
  const INITIAL_COMMENTS_TO_SHOW = 3;
  const INITIAL_REPLIES_TO_SHOW = 2;
  const [commentsToShow, setCommentsToShow] = useState(INITIAL_COMMENTS_TO_SHOW);
  const [repliesToShow, setRepliesToShow] = useState<{ [key: number]: number }>({});

  // Función para mostrar más comentarios
  const handleShowMoreComments = () => {
    setCommentsToShow((prev) => prev + INITIAL_COMMENTS_TO_SHOW);
  };

  // Función para mostrar más respuestas de un comentario
  const handleShowMoreReplies = (idx: number, totalReplies: number) => {
    setRepliesToShow((prev) => ({
      ...prev,
      [idx]: Math.min((prev[idx] || INITIAL_REPLIES_TO_SHOW) + INITIAL_REPLIES_TO_SHOW, totalReplies)
    }));
  };
  const { user } = useAuth();
  const params = useParams();
  const productId = Number(params.id);
  
  const [product, setProduct] = useState(() => allProducts.find(p => p.id === productId));
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [addSuccess, setAddSuccess] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [smartRecommendations, setSmartRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  
  // Comentarios por producto (Firestore)
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [replyText, setReplyText] = useState<{ [key: number]: string | undefined }>({}); // para respuestas
  // Estado para mostrar el botón y picker de emojis en comentario principal
  const [showEmojiButton, setShowEmojiButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
  const emojiPickerRef = React.useRef<HTMLDivElement>(null);

  const [showCommentActions, setShowCommentActions] = useState(false);
  // Cerrar el emoji picker solo si se hace clic fuera del input, botón y picker
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiButtonRef.current && emojiButtonRef.current.contains(event.target)
      ) {
        return;
      }
      if (
        emojiPickerRef.current && emojiPickerRef.current.contains(event.target)
      ) {
        return;
      }
      setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  // Estado para mostrar el botón y picker de emojis en cada campo de respuesta
  // Estado para controlar el flujo de emoji en cada reply
  // Estado para controlar el emoji en cada reply: { idx: { button: bool, picker: bool } }
  const [replyEmojiState, setReplyEmojiState] = useState<{ [key: number]: { button?: boolean; picker?: boolean } }>({});
  const replyEmojiButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const replyEmojiPickerRefs = React.useRef<{ [key: number]: HTMLDivElement | null }>({});
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(replyEmojiState).forEach(idxStr => {
        const idx = Number(idxStr);
        if (!replyEmojiState[idx]?.picker) return;
        const btnRef = replyEmojiButtonRefs.current[idx];
        const pickerRef = replyEmojiPickerRefs.current[idx];
        if (btnRef && btnRef.contains(event.target as Node)) return;
        if (pickerRef && pickerRef.contains(event.target as Node)) return;
        setReplyEmojiState(prev => ({ ...prev, [idx]: { ...prev[idx], picker: false } }));
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [replyEmojiState]);
  const emojiList = [
    "😀","😂","😍","👍","🙏","🔥","🎉","😎","🥳","😢","😡","❤️","🤩","👏","😅","😇","😜","🤔","🙌","💯","😱","😏","😃","😆","😋","😌","😔","😤","😩","😬","😳","😵","😭","😰","😓","😪","😴","😷","🤒","🤕","🤢","🤧","🤠","🤡","🤥","🤫","🤭","🧐","🤓","😈","👿","👹","👺","💀","👻","👽","🤖","💩","😺","😸","😹","😻","😼","😽","🙀","😿","😾"
  ];



  const updateFavouriteState = useCallback(async () => {
    if (!user?.uid || !product?.id) {
      setIsFavourite(false);
      return;
    }
  
    // 🔥 Siempre obtener favoritos del usuario actual desde Firestore
    const favs = await getUserFavourites(user.uid);
    const fav = favs.some((item: any) => item.id == product.id);
    setIsFavourite(fav);
  }, [user?.uid, product?.id]);
  
  useEffect(() => {
    updateFavouriteState();
  }, [updateFavouriteState]);

  // Cargar recomendaciones inteligentes cuando cambie el producto
  useEffect(() => {
    const loadSmartRecommendations = async () => {
      if (!product?.id) return;
      
      setLoadingRecommendations(true);
      
      try {
        // Simular un pequeño delay para mostrar el loading (opcional)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const recommendations = recommendationEngine.getSmartRecommendations(product.id, 3);
        setSmartRecommendations(recommendations);
        
      } catch (error) {
        console.error('❌ Error al cargar recomendaciones:', error);
        // En caso de error, mostrar productos aleatorios
        const fallbackRecommendations = allProducts
          .filter(p => p.id !== product.id && p.inStock)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setSmartRecommendations(fallbackRecommendations);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadSmartRecommendations();
  }, [product?.id]);

  // Migrar carrito desde localStorage cuando el usuario esté autenticado
  useEffect(() => {
    const migrateCartIfNeeded = async () => {
      if (!user?.uid) return;
      
      try {
        await cartService.migrateFromLocalStorage(user.uid);
      } catch (error) {
        console.error('❌ Error durante la migración del carrito:', error);
      }
    };

    migrateCartIfNeeded();
  }, [user?.uid]);



  const handleAddToFavourites = async () => {
    if (!user?.uid || !product) return;
  
    if (isFavourite) {
      await removeFavourite(user.uid, product.id);
    } else {
      await addFavourite(user.uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "/placeholder.jpg",
      });
    }

    const favs = await getUserFavourites(user.uid);

    window.dispatchEvent(new Event("favourites-updated"));


  
    // 🔥 Volvemos a cargar favoritos desde Firestore
    await updateFavouriteState();
  };
  


  // Cargar comentarios desde Firestore
  useEffect(() => {
    const fetchComments = async () => {
      if (!product?.id) return;
      setLoadingComments(true);
      const fetched = await getProductComments(product.id);

      const mappedComments = fetched.map((c: any) => ({
        id: c.id,
        name: c.name || "Usuario",
        text: c.text || "",
        date: c.date || "",
        rating: c.rating || 0,
        replies: c.replies || [],
        photoURL: c.photoURL || "/new_user.png"
      }));
      
      setComments(mappedComments);

      // 🔹 Calcular promedio (por si no existe en Firestore)
      if (mappedComments.length > 0) {
        const avg = mappedComments.reduce((acc, c) => acc + (c.rating || 0), 0) / mappedComments.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }
  
      setLoadingComments(false);
    };
  
    fetchComments();
  }, [product?.id]);
  

  // Guardar comentario en Firestore
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    let error = "";
    if (!user) return;
    if (!commentText.trim()) return;
    if (rating < 1) {
      error = 'Por favor selecciona una calificación antes de comentar';
      setErrorMessage(error);
      setTimeout(() => {
        setErrorMessage("");
      }, 2000);
      return;
    }

    try {
      const newComment = {
        name: user.displayName || "Usuario",
        text: commentText.trim(),
        date: new Date().toISOString(),
        rating,
        replies: [],
        photoURL: user.photoURL || "/new_user.png", // 🔹 Se guarda la foto de perfil
      };

      if (!product) return;

      await addProductComment(product.id, newComment);

      // Reset campos antes de actualizar comentarios
      setCommentText("");
      setRating(0);
      setErrorMessage("");

      // 🔹 Obtener comentarios actualizados
      const fetched = await getProductComments(product.id);
      const mappedComments = fetched.map((c: any) => ({
        id: c.id, // ✅ IMPORTANTE: incluir el ID
        name: c.name || "Usuario",
        text: c.text || "",
        date: c.date || "",
        rating: c.rating || 0,
        replies: c.replies || [],
        photoURL: c.photoURL || "/new_user.png"
      }));
      setComments(mappedComments);

      // 🔹 Calcular y guardar promedio (con manejo de errores)
      try {
        const avg = mappedComments.reduce((acc, c) => acc + (c.rating || 0), 0) / mappedComments.length;
        setAverageRating(avg);
        await updateProductRating(product.id, avg);
      } catch (ratingError) {
        // No mostrar error al usuario, el comentario se guardó correctamente
      }
      
    } catch (error) {
      console.error('❌ Error al enviar comentario:', error);
      setErrorMessage('Error al enviar el comentario. Inténtalo de nuevo.');
    }
  };
  


  const handleReply = async (commentIndex: number) => {
    try {
      const replyMessage = replyText[commentIndex]?.trim();
      if (!replyMessage || !user || !product) {
        return;
      }

      const reply = {
        name: user.displayName || "Usuario",
        text: replyMessage,
        date: new Date().toISOString(),
        photoURL: user.photoURL || "/new_user.png"
      };

      // 🔹 Obtener ID real del comentario y verificar que existe
      const comment = comments[commentIndex];
      
      if (!comment) {
        console.error("❌ Comentario no encontrado en índice:", commentIndex);
        return;
      }
      
      if (!comment.id) {
        console.error("❌ Comentario sin ID:", comment);
        return;
      }
      
      // Agregar la respuesta a Firestore
      const success = await addReplyToComment(product.id, comment.id, reply);
      
      if (!success) {
        console.error("❌ Error al guardar respuesta en Firestore");
        return;
      }

      // 🔹 Recargar comentarios desde Firestore
      const fetched = await getProductComments(product.id);
      const mappedComments = fetched.map((c: any) => ({
        id: c.id,
        name: c.name || "Usuario",
        text: c.text || "",
        date: c.date || "",
        rating: c.rating || 0,
        replies: c.replies || [],
        photoURL: c.photoURL || "/new_user.png"
      }));
      
      setComments(mappedComments);

      // Limpiar y ocultar el campo de respuesta y emoji después de responder
      setReplyText((prev) => {
        const updated = { ...prev };
        delete updated[commentIndex];
        return updated;
      });
      setReplyEmojiState(prev => {
        const updated = { ...prev };
        delete updated[commentIndex];
        return updated;
      });

    } catch (error) {
      console.error("❌ Error al enviar respuesta:", error);
    }
  };
  
  

  const [errorMessage, setErrorMessage] = useState('');

  const handleAddToCart = async () => {
    // Clear any previous error messages
    setErrorMessage('');
    
    if (!product) {
      setErrorMessage('Error: Producto no cargado');
      return;
    }
    
    if (!user?.uid) {
      setErrorMessage('Debes iniciar sesión para agregar productos al carrito');
      return;
    }
    
    if (!selectedSize) {
      setErrorMessage('Por favor selecciona una talla');
      return;
    }
    
    if (!selectedColor) {
      setErrorMessage('Por favor selecciona un color');
      return;
    }
    
    if (quantity < 1) {
      setErrorMessage('La cantidad debe ser mayor a 0');
      return;
    }
    
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.jpg',
        quantity,
        size: selectedSize,
        color: selectedColor
      };

      const success = await cartService.addToCart(user.uid, cartItem);
      
      if (success) {
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 3000);
        
        // Limpiar campos después de agregar exitosamente
        setSelectedSize('');
        setSelectedColor('');
        setQuantity(1);
      } else {
        setErrorMessage('Error al agregar el producto al carrito');
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setErrorMessage('Error al agregar el producto al carrito');
    }
  };


  // Si el usuario no está autenticado, mostrar mensaje de inicio de sesión requerido
  if (!user) {
    return <LoginRequired message="Para ver los detalles del producto y realizar compras, por favor inicia sesión." />;
  }
  
  // Si no se encuentra el producto, mostrar mensaje de error
  if (!product) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Container className="py-5 flex-grow-1 text-center">
          <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem' }}></i>
          <h2 className="mt-3">Producto no encontrado</h2>
          <p className="text-muted">El producto que estás buscando no existe o ha sido eliminado.</p>
          <Button as={Link} href="/products" variant="outline-dark" className="mt-3 rounded-1 px-4">
            Ver todos los productos
          </Button>
        </Container>
        
        <footer className="bg-light text-dark py-5 border-top">
          <Container>
            <Row>
              <Col md={3}>
                <h5 className="fw-bold mb-3">Comprar</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><Link href="/products/mujer" className="text-dark text-decoration-none">Mujer</Link></li>
                  <li className="mb-2"><Link href="/products/hombre" className="text-dark text-decoration-none">Hombre</Link></li>
                  <li className="mb-2"><Link href="/products/ninos" className="text-dark text-decoration-none">Niños</Link></li>
                  <li className="mb-2"><Link href="/products/bebe" className="text-dark text-decoration-none">Bebé</Link></li>
                  <li className="mb-2"><Link href="/products/sport" className="text-dark text-decoration-none">Sport</Link></li>
                </ul>
              </Col>
              <Col md={3}>
                <h5 className="fw-bold mb-3">Información Corporativa</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><Link href="/about" className="text-dark text-decoration-none">Acerca de nosotros</Link></li>
                  <li className="mb-2"><Link href="/sustainability" className="text-dark text-decoration-none">Sostenibilidad</Link></li>
                  <li className="mb-2"><Link href="/press" className="text-dark text-decoration-none">Sala de prensa</Link></li>
                  <li className="mb-2"><Link href="/investors" className="text-dark text-decoration-none">Relación con inversores</Link></li>
                </ul>
              </Col>
              <Col md={3}>
                <h5 className="fw-bold mb-3">Ayuda</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><Link href="/customer-service" className="text-dark text-decoration-none">Servicio al cliente</Link></li>
                  <li className="mb-2"><Link href="/my-account" className="text-dark text-decoration-none">Mi cuenta</Link></li>
                  <li className="mb-2"><Link href="/store-locator" className="text-dark text-decoration-none">Encontrar tiendas</Link></li>
                  <li className="mb-2"><Link href="/legal" className="text-dark text-decoration-none">Términos legales</Link></li>
                </ul>
              </Col>
              <Col md={3}>
                <h5 className="fw-bold mb-3">Únete a nosotros</h5>
                <p>Recibe noticias sobre nuevas colecciones y ofertas exclusivas</p>
                <div className="d-flex gap-3 mt-3">
                  <Link href="#" className="text-dark fs-5"><i className="bi bi-facebook"></i></Link>
                  <Link href="#" className="text-dark fs-5"><i className="bi bi-instagram"></i></Link>
                  <Link href="#" className="text-dark fs-5"><i className="bi bi-twitter"></i></Link>
                  <Link href="#" className="text-dark fs-5"><i className="bi bi-youtube"></i></Link>
                </div>
              </Col>
            </Row>
            <hr className="my-4" />
            <div className="text-center">
              <p className="small">&copy; {new Date().getFullYear()} Fashion Store. Todos los derechos reservados.</p>
            </div>
          </Container>
        </footer>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <main>
        <Container className="py-5">
          <Row className="g-5 align-items-center">
            <Col xs={12} md={6} style={{ width: '40%' }}>
              <Card className="border-0 shadow-sm">
                <div className="position-relative" style={{ width: '300px', height: '450px', margin: '0 auto', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem 1rem 0 0', overflow: 'hidden' }}>
                  {product.images && product.images.length > 0 && (
                    <>
                      <Image
                        src={product.images[currentImageIndex]}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => prev === 0 ? product.images.length - 1 : prev - 1)}
                            style={{
                              position: 'absolute',
                              left: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.4)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              zIndex: 2
                            }}
                            aria-label="Imagen anterior"
                          >
                            &#8592;
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => prev === product.images.length - 1 ? 0 : prev + 1)}
                            style={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.4)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              zIndex: 2
                            }}
                            aria-label="Imagen siguiente"
                          >
                            &#8594;
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <h2 className="fw-bold mb-3">{product.name}</h2>
              <div className="text-primary fw-bold fs-3 mb-3">${product.price.toFixed(2)}</div>
              <div className="mb-4">{product.description}</div>
              <div className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Talla</Form.Label>
                  <Form.Select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} required className="rounded-1">
                    <option value="">Selecciona una talla</option>
                    {product.sizes && product.sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} required className="rounded-1">
                    <option value="">Selecciona un color</option>
                    {product.colors && product.colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded-1" />
                </Form.Group>
              </div>
              {addSuccess && (
                <div className="alert alert-success text-center" role="alert">
                  Producto añadido correctamente a tu carrito
                </div>
              )}
              {/* El error de calificación solo se muestra debajo del comentario, no aquí */}
              {/* Otros errores de carrito sí se muestran aquí */}
              {errorMessage && errorMessage !== 'Por favor selecciona una calificación antes de comentar' && (
                <div className="alert alert-danger text-center" role="alert">
                  {errorMessage}
                </div>
              )}
              <div className="d-flex gap-2">
                <Button variant="dark" size="lg" className="w-100 rounded-1 mb-3" onClick={handleAddToCart}>
                  Añadir al carrito
                </Button>
                <FavouriteButton product={product} />
              </div>
            </Col>
          </Row>
        </Container>
      </main>

      {/* Sección de comentarios */}
      <div className="my-5">
        <Container>
          <div className="mb-3">
            <h5 className="fw-bold">Calificación promedio:</h5>

            <div style={{ fontSize: "1.5rem", color: "#e63946" }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const full = star <= Math.floor(averageRating); // Estrella llena
                const half = star === Math.ceil(averageRating) && averageRating % 1 >= 0.5; // Media estrella

                return (
                  <span
                    key={star}
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "1.2em",
                    }}
                  >
                    <span style={{ color: "#ccc" }}>★</span>
                    <span
                      style={{
                        color: "#e63946",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: full ? "100%" : half ? "50%" : "0%",
                        overflow: "hidden",
                      }}
                    >
                      ★
                    </span>
                  </span>
                );
              })}
              <span className="ms-2">({averageRating.toFixed(1)}/5)</span>
            </div>
          </div>

          <h3 className="fw-bold mb-4">Comentarios</h3>

          {/* Formulario de nuevo comentario */}
          <Form onSubmit={handleAddComment} className="mb-4 p-3 rounded shadow-sm bg-light">
            <Row className="g-2 align-items-center">
              <Col xs={12} className="d-flex align-items-start gap-2">
                {/* Avatar del usuario */}
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid #eee", background: "#f7f7f7", marginTop: 2 }}>
                  <img src={user?.photoURL || "/new_user.png"} alt="avatar" width={40} height={40} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="flex-grow-1">
                  <Form.Group className="w-100 mb-2">
                    <Form.Label className="mb-1" style={{ fontWeight: 500, fontSize: "0.98rem" }}>Calificación</Form.Label>
                    <div style={{ fontSize: "1.3rem", color: "#e63946", marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            cursor: "pointer",
                            filter: star > rating ? "grayscale(1)" : "none",
                            transition: "filter 0.2s",
                            fontSize: "1.3rem"
                          }}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </Form.Group>
                  <Form.Group className="w-100 mb-0">
                    <Form.Label className="mb-1" style={{ fontWeight: 500, fontSize: "0.98rem" }}>Comentario</Form.Label>
                    <div style={{
                      background: "#fff",
                      borderRadius: "0.7rem",
                      boxShadow: "0 2px 8px -4px rgba(0,0,0,0.07)",
                      border: "1px solid #eee",
                      padding: "12px 18px 0 18px",
                      position: "relative",
                      minHeight: "70px"
                    }}>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        className="youtube-input"
                        style={{
                          resize: "vertical",
                          minHeight: "38px",
                          maxHeight: "120px",
                          fontSize: "1rem",
                          padding: "8px 36px 8px 0px",
                          border: "none",
                          borderRadius: "0px",
                          borderBottom: "1px solid rgba(0,0,0,0.10)",
                          boxShadow: "none",
                          outline: "none",
                          background: "#fff",
                          transition: "border-color 0.2s"
                        }}
                        value={commentText}
                        onChange={e => {
                          setCommentText(e.target.value);
                          if (!showCommentActions) setShowCommentActions(true);
                        }}
                        placeholder="Escribe un comentario..."
                        maxLength={200}
                        onFocus={e => {
                          e.currentTarget.style.borderBottom = "1px solid rgba(230,57,70,0.18)";
                          setShowCommentActions(true);
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderBottom = "1px solid rgba(0,0,0,0.10)";
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            // Evita enviar el formulario con Enter
                            e.preventDefault();
                            setCommentText(prev => prev + '\n');
                          }
                        }}
                      />
                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "calc(100% + 6px)",
                            zIndex: 99,
                            background: "#fff",
                            border: "1px solid #eee",
                            boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)",
                            borderRadius: "0.7rem",
                            padding: "8px 10px 6px 10px",
                            minWidth: "220px",
                            maxWidth: "320px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px 8px",
                            maxHeight: "180px",
                            overflowY: "auto"
                          }}
                        >
                          {emojiList.map((emoji) => (
                            <span
                              key={emoji}
                              style={{ fontSize: "1.35rem", cursor: "pointer", transition: "transform 0.1s", borderRadius: "6px", padding: "2px 4px" }}
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => {
                                setCommentText(prev => prev + emoji);
                              }}
                              onMouseOver={e => e.currentTarget.style.background = "#f7f7f7"}
                              onMouseOut={e => e.currentTarget.style.background = "transparent"}
                            >{emoji}</span>
                          ))}
                        </div>
                      )}
                      {showCommentActions && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", marginBottom: "8px" }}>
                          <div>
                            <button
                              type="button"
                              ref={emojiButtonRef}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1.3rem",
                                color: "#888"
                              }}
                              title="Agregar emoji"
                              onClick={() => setShowEmojiPicker(prev => !prev)}
                              tabIndex={0}
                            >
                              😊
                            </button>
                          </div>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <Button
                              type="button"
                              variant="light"
                              style={{ borderRadius: "1.5rem", fontWeight: 500, color: "#333", background: "#f7f7f7", border: "none", boxShadow: "none", padding: "4px 18px" }}
                              onClick={() => {
                                setCommentText("");
                                setShowCommentActions(false);
                                setShowEmojiPicker(false);
                              }}
                            >Cancelar</Button>
                            <Button
                              type="submit"
                              variant="dark"
                              style={{ borderRadius: "1.5rem", fontWeight: 500, background: "#e63946", border: "none", boxShadow: "none", color: "#fff", padding: "4px 18px", display: "flex", alignItems: "center", gap: "6px" }}
                              disabled={!commentText.trim()}
                            >
                              <i className="bi bi-chat-left-text" style={{ fontSize: "1.1rem", marginRight: 4 }}></i>
                              Comentar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Solo mostrar el error de calificación aquí debajo del comentario */}
                    {errorMessage === 'Por favor selecciona una calificación antes de comentar' && (
                      <div className="text-danger mt-2" style={{ fontSize: "0.95rem" }}>
                        {errorMessage}
                      </div>
                    )}
                  </Form.Group>
                </div>
                {/* Botón de comentar eliminado, solo se usan los botones dentro de las acciones debajo del campo */}
              </Col>
            </Row>
          </Form>

          {/* Lista de comentarios */}
          {loadingComments ? (
            <div className="text-center text-muted py-4">
              <span className="spinner-border spinner-border-sm me-2"></span>
              Cargando comentarios...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted py-4">
              Aún no hay comentarios para este producto.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {comments.slice(0, commentsToShow).map((c, idx) => (
                <div
                  key={idx}
                  className="w-100"
                  style={{
                    maxWidth: "100%",
                    background: "#fff",
                    minHeight: "60px",
                    borderRadius: 0,
                    border: "none",
                    boxShadow: "0 2px 8px -4px rgba(0,0,0,0.07)",
                    borderLeft: "3px solid #e0e0e0",
                    marginBottom: "18px",
                    padding: "18px 0 8px 0"
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid #eee",
                        margin: "0 auto",
                        background: "#f7f7f7"
                      }}
                    >
                      <Image
                        src={c.photoURL || "/new_user.png"}
                        alt={c.name}
                        width={40}
                        height={40}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold" style={{ fontSize: "1rem" }}>{c.name}</span>
                        <span style={{ color: "#e63946", fontSize: "1rem" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ filter: star > c.rating ? "grayscale(1)" : "none" }}>
                              ★
                            </span>
                          ))}
                        </span>
                        <span className="small text-muted ms-2">{new Date(c.date).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 mb-1" style={{ fontSize: "0.98rem", lineHeight: "1.3", wordBreak: "break-word", boxShadow: "0 2px 8px -4px rgba(0,0,0,0.07)", marginBottom: "8px" }}>{c.text}</p>

                      {/* Respuestas estilo YouTube */}
                      {c.replies && c.replies.length > 0 && (
                        <div className="mt-1 ps-3" style={{ borderLeft: "2px solid #e0e0e0" }}>
                          {c.replies.slice(0, repliesToShow[idx] || INITIAL_REPLIES_TO_SHOW).map((r, i) => (
                            <div key={i} className="mb-1 d-flex align-items-start gap-2" style={{ borderRadius: 0, border: "none", boxShadow: "0 2px 8px -4px rgba(0,0,0,0.07)", borderLeft: "2px solid #e0e0e0", background: "#fff" }}>
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", border: "1px solid #eee", background: "#f7f7f7" }}>
                                <Image src={r.photoURL || "/new_user.png"} alt={r.name} width={28} height={28} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                              <div>
                                <span className="fw-bold" style={{ fontSize: "0.95rem" }}>{r.name}</span>
                                <span className="small text-muted ms-2">{new Date(r.date).toLocaleString()}</span>
                                <p className="mb-1" style={{ fontSize: "0.95rem", lineHeight: "1.3", wordBreak: "break-word", boxShadow: "0 2px 8px -4px rgba(0,0,0,0.07)", marginBottom: "8px" }}>{r.text}</p>
                              </div>
                            </div>
                          ))}
                          {c.replies.length > (repliesToShow[idx] || INITIAL_REPLIES_TO_SHOW) && (
                            <Button variant="link" className="p-0 text-primary" style={{ fontSize: "0.92rem" }} onClick={() => handleShowMoreReplies(idx, c.replies.length)}>
                              Ver más respuestas ({c.replies.length - (repliesToShow[idx] || INITIAL_REPLIES_TO_SHOW)})
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Botón para mostrar campo de respuesta */}
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="link"
                          className="p-0 text-primary"
                          style={{ fontSize: "0.95rem" }}
                          onClick={() => setReplyText((prev) => ({ ...prev, [idx]: prev[idx] === undefined ? "" : undefined }))}
                        >
                          Responder
                        </Button>
                      </div>

                      {/* Formulario de respuesta solo si está activo */}
                      {replyText[idx] !== undefined && (
                        <div style={{ position: "relative" }}>
                          <Form
                            className="mt-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleReply(idx);
                            }}
                          >
                            <Form.Control
                              className="mb-1 youtube-input"
                              style={{
                                minHeight: "32px",
                                maxHeight: "80px",
                                fontSize: "0.98rem",
                                resize: "vertical",
                                padding: "6px 36px 6px 0px",
                                border: "none",
                                borderRadius: "0px",
                                borderBottom: "1px solid rgba(0,0,0,0.10)",
                                boxShadow: "0 2px 6px -2px rgba(0,0,0,0.08)",
                                outline: "none",
                                background: "#fff",
                                transition: "border-color 0.2s"
                              }}
                              value={replyText[idx] || ""}
                              onChange={(e) => setReplyText((prev) => ({ ...prev, [idx]: e.target.value }))}
                              placeholder="Responder..."
                              onFocus={e => {
                                e.currentTarget.style.borderBottom = "1px solid rgba(230,57,70,0.18)";
                                if (!replyEmojiState[idx]?.button) {
                                  setReplyEmojiState(prev => ({ ...prev, [idx]: { button: true, picker: false } }));
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  setReplyText(prev => ({ ...prev, [idx]: (prev[idx] || "") + '\n' }));
                                }
                              }}
                            />
                            {replyEmojiState[idx]?.button && (
                              <button
                                type="button"
                                ref={el => { replyEmojiButtonRefs.current[idx] = el; }}
                                style={{
                                  position: "absolute",
                                  right: 4,
                                  bottom: 8,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                  color: "#888"
                                }}
                                title="Agregar emoji"
                                onClick={() => setReplyEmojiState(prev => ({ ...prev, [idx]: { ...prev[idx], picker: !prev[idx]?.picker } }))}
                                tabIndex={0}
                              >
                                😊
                              </button>
                            )}
                            {replyEmojiState[idx]?.picker && (
                              <div
                                ref={el => { replyEmojiPickerRefs.current[idx] = el; }}
                                style={{
                                  position: "absolute",
                                  left: "auto",
                                  right: 0,
                                  top: "calc(100% + 6px)",
                                  zIndex: 99,
                                  background: "#fff",
                                  border: "1px solid #eee",
                                  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)",
                                  borderRadius: "0.7rem",
                                  padding: "8px 10px 6px 10px",
                                  minWidth: "220px",
                                  maxWidth: "320px",
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "6px 8px",
                                  maxHeight: "180px",
                                  overflowY: "auto"
                                }}
                              >
                                {emojiList.map((emoji) => (
                                  <span
                                    key={emoji}
                                    style={{ fontSize: "1.25rem", cursor: "pointer", transition: "transform 0.1s", borderRadius: "6px", padding: "2px 4px" }}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => {
                                      setReplyText(prev => ({ ...prev, [idx]: (prev[idx] || "") + emoji }));
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = "#f7f7f7"}
                                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                                  >{emoji}</span>
                                ))}
                              </div>
                            )}
                            <Button size="sm" variant="dark" type="submit" style={{ height: "32px", fontSize: "0.95rem", alignSelf: "flex-end", boxShadow: "none", background: "#e63946", border: "none", color: "#fff", fontWeight: 500, transition: "background 0.2s" }}
                              onMouseOver={e => e.currentTarget.style.background = '#d62839'}
                              onMouseOut={e => e.currentTarget.style.background = '#e63946'}
                            >
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <i className="bi bi-reply" style={{ fontSize: "1rem", marginRight: 3 }}></i>
                                Responder
                              </span>
                            </Button>
                          </Form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {comments.length > commentsToShow && (
                <div className="text-center mt-3">
                  <Button variant="link" className="p-0 text-primary" style={{ fontSize: "1rem" }} onClick={handleShowMoreComments}>
                    Ver más comentarios ({comments.length - commentsToShow})
                  </Button>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>


            
      {/* Tabs de información adicional */}
      <div className="my-5">
        <Container>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => k && setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="details" title="Detalles">
              <div className="p-4 bg-light">
                <h5 className="fw-bold mb-3">Características del producto</h5>
                <ul>
                  {Array.isArray(product.details) && product.details.length > 0 ? (
                    product.details.map((detail, index) => (
                      <li key={index} className="mb-2">{detail}</li>
                    ))
                  ) : (
                    <li className="mb-2 text-muted">Sin detalles adicionales</li>
                  )}
                </ul>
                <p className="mt-3 mb-0">Referencia: {product.id.toString().padStart(6, '0')}</p>
              </div>
            </Tab>
            <Tab eventKey="shipping" title="Envío y devoluciones">
              <div className="p-4 bg-light">
                <h5 className="fw-bold mb-3">Información de envío</h5>
                <p>Envío estándar: 3-5 días hábiles</p>
                <p>Envío express: 1-2 días hábiles (costo adicional)</p>
                
                <h5 className="fw-bold mb-3 mt-4">Política de devoluciones</h5>
                <p>Tienes 30 días para devolver tu compra. Los artículos deben estar en su estado original con las etiquetas intactas.</p>
                <p>Las devoluciones son gratuitas para miembros de Fashion Store.</p>
              </div>
            </Tab>
            <Tab eventKey="reviews" title="Opiniones">
              <div className="p-4 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Opiniones de clientes</h5>
                  <Button variant="outline-dark" className="rounded-1">
                    Escribir una opinión
                  </Button>
                </div>
                
                <div className="text-center py-4">
                  <i className="bi bi-chat-square-text" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3">Aún no hay opiniones</h5>
                  <p className="text-muted">Sé el primero en opinar sobre este producto.</p>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Container>
      </div>
      
      {/* Productos recomendados inteligentes */}
      <div className="my-5">
        <Container>
          <div className="d-flex align-items-center mb-4">
            <h3 className="fw-bold mb-0 me-3">Productos recomendados para ti</h3>
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-robot me-2" style={{ fontSize: '1.2rem' }}></i>
              <small>Seleccionados por IA</small>
            </div>
          </div>
          
          {loadingRecommendations ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Cargando recomendaciones...</span>
              </div>
              <p className="text-muted">Analizando productos similares...</p>
            </div>
          ) : (
            <Row>
              {smartRecommendations.length > 0 ? (
                smartRecommendations.map((recommendedProduct) => (
                  <Col key={recommendedProduct.id} md={4} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 product-recommendation-card">
                      <div className="position-relative overflow-hidden" style={{ height: '350px' }}>
                        <Image 
                          src={recommendedProduct.images[0] || '/placeholder.jpg'} 
                          alt={recommendedProduct.name} 
                          fill 
                          style={{ objectFit: 'cover' }}
                          className="product-image"
                        />
                        {/* Badge de recomendación */}
                        <Badge 
                          bg="primary" 
                          className="position-absolute top-0 start-0 m-2 px-2 py-1"
                          style={{ fontSize: '0.7rem' }}
                        >
                          <i className="bi bi-stars me-1"></i>
                          Recomendado
                        </Badge>
                        
                        {/* Overlay con acciones */}
                        <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient" style={{ 
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' 
                        }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <Button 
                              as={Link} 
                              href={`/products/${recommendedProduct.id}`} 
                              variant="light" 
                              className="rounded-pill px-3 py-1 fw-bold"
                              size="sm"
                            >
                              Ver Detalles
                            </Button>
                            <FavouriteButton product={recommendedProduct} />
                          </div>
                        </div>
                      </div>
                      
                      <Card.Body className="p-3">
                        <h6 className="fw-bold mb-1 text-truncate">{recommendedProduct.name}</h6>
                        <p className="text-muted small mb-2">{recommendedProduct.category}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary fs-5">${recommendedProduct.price.toFixed(2)}</span>
                          <div className="d-flex gap-1">
                            {recommendedProduct.colors.slice(0, 3).map((color, index) => (
                              <div 
                                key={index}
                                className="color-indicator rounded-circle border border-light-subtle"
                                style={{ 
                                  width: '12px', 
                                  height: '12px',
                                  backgroundColor: getColorCode(color)
                                }}
                                title={color}
                              ></div>
                            ))}
                            {recommendedProduct.colors.length > 3 && (
                              <small className="text-muted">+{recommendedProduct.colors.length - 3}</small>
                            )}
                          </div>
                        </div>
                        
                        {/* Indicadores de similitud */}
                        <div className="mt-2">
                          <div className="d-flex flex-wrap gap-1">
                            {recommendedProduct.category.toLowerCase() === product?.category.toLowerCase() && (
                              <Badge bg="success" className="small">Misma categoría</Badge>
                            )}
                            {recommendedProduct.colors.some(color => 
                              product?.colors.some(productColor => 
                                color.toLowerCase() === productColor.toLowerCase()
                              )
                            ) && (
                              <Badge bg="info" className="small">Colores similares</Badge>
                            )}
                            {Math.abs(recommendedProduct.price - (product?.price || 0)) <= (product?.price || 0) * 0.3 && (
                              <Badge bg="warning" className="small">Precio similar</Badge>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-search" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <h5 className="mt-3 text-muted">No se encontraron recomendaciones</h5>
                  <p className="text-muted">Intenta explorar otros productos de nuestro catálogo.</p>
                  <Button 
                    as={Link} 
                    href="/products" 
                    variant="outline-primary" 
                    className="mt-2 rounded-pill px-4"
                  >
                    Ver todos los productos
                  </Button>
                </div>
              )}
            </Row>
          )}
        </Container>
      </div>

    {/* Footer */}
      <Footer/>
    </div>
  );
};

export default ProductDetailPage;