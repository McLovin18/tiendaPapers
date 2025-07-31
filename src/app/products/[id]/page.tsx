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



// Productos relacionados
const relatedProducts = [
  {
    id: 6,
    name: 'Jeans Regular',
    price: 44.99,
    image: '/images/product2.svg',
    category: 'jeans'
  },
  {
    id: 7,
    name: 'Camiseta Básica',
    price: 14.99,
    image: '/images/product3.svg',
    category: 'camisas'
  },
  {
    id: 8,
    name: 'Pantalón Deportivo',
    price: 29.99,
    image: '/images/product4.svg',
    category: 'pantalones'
  },
];

const ProductDetailPage = () => {
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
  
  // Comentarios por producto (Firestore)
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({}); // para respuestas
  // Estado para mostrar el botón y picker de emojis en comentario principal
  const [showEmojiButton, setShowEmojiButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = React.useRef(null);
  const emojiPickerRef = React.useRef(null);

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
  const [replyEmojiState, setReplyEmojiState] = useState({});
  const replyEmojiButtonRefs = React.useRef({});
  const replyEmojiPickerRefs = React.useRef({});
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(replyEmojiState).forEach(idx => {
        if (!replyEmojiState[idx]?.picker) return;
        const btnRef = replyEmojiButtonRefs.current[idx];
        const pickerRef = replyEmojiPickerRefs.current[idx];
        if (btnRef && btnRef.contains(event.target)) return;
        if (pickerRef && pickerRef.contains(event.target)) return;
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



  const handleAddToFavourites = async () => {
    if (!user?.uid || !product) return;
  
    if (isFavourite) {
      await removeFavourite(user.uid, product.id);
    } else {
      await addFavourite(user.uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image || "/placeholder.jpg",
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
      name: c.name || "Usuario",
      text: c.text || "",
      date: c.date || "",
      rating: c.rating || 0,
      replies: c.replies || [],
      photoURL: c.photoURL || "/new_user.png"
    }));
    setComments(mappedComments);

    // 🔹 Calcular y guardar promedio
    const avg = mappedComments.reduce((acc, c) => acc + (c.rating || 0), 0) / mappedComments.length;
    setAverageRating(avg);
    await updateProductRating(product.id, avg);
  };
  


  const handleReply = async (commentIndex: number) => {

    const replyMessage = replyText[commentIndex]?.trim();
    if (!replyMessage || !user || !product) return;

    const reply = {
      name: user.displayName || "Usuario",
      text: replyMessage,
      date: new Date().toISOString(),
      photoURL: user.photoURL || "/new_user.png"
    };

    // 🔹 Obtener ID real del comentario (hay que mapear doc.id en getProductComments)
    const comment = comments[commentIndex];
    await addReplyToComment(product.id, comment.id, reply);

    // 🔹 Recargar comentarios
    const fetched = await getProductComments(product.id);
    setComments(fetched.map((c: any) => ({
      ...c,
      replies: c.replies || []
    })));

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
  };
  
  

  const [errorMessage, setErrorMessage] = useState('');

  const handleAddToCart = () => {
    console.log('Add to cart clicked:', { selectedSize, selectedColor, quantity, user: user?.uid });
    
    // Clear any previous error messages
    setErrorMessage('');
    
    if (!product) {
      console.log('Add to cart failed: Product not loaded');
      setErrorMessage('Error: Producto no cargado');
      return;
    }
    
    if (!user?.uid) {
      console.log('Add to cart failed: No user authenticated');
      setErrorMessage('Debes iniciar sesión para agregar productos al carrito');
      return;
    }
    
    if (!selectedSize) {
      console.log('Add to cart failed: No size selected');
      setErrorMessage('Por favor selecciona una talla');
      return;
    }
    
    if (!selectedColor) {
      console.log('Add to cart failed: No color selected');
      setErrorMessage('Por favor selecciona un color');
      return;
    }
    
    if (quantity < 1) {
      console.log('Add to cart failed: Invalid quantity');
      setErrorMessage('La cantidad debe ser mayor a 0');
      return;
    }
    
    try {
      const cartKey = `cartItems_${user.uid}`;
      const cartItems = JSON.parse(localStorage.getItem(cartKey) || '[]');
      console.log('Current cart items:', cartItems);
      
      const existingIndex = cartItems.findIndex((item: any) => 
        item.id === product.id && item.size === selectedSize && item.color === selectedColor
      );
      
      if (existingIndex !== -1) {
        cartItems[existingIndex].quantity += quantity;
        console.log('Updated existing item quantity');
      } else {
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0] || '/placeholder.jpg',
          quantity,
          size: selectedSize,
          color: selectedColor
        };
        cartItems.push(newItem);
        console.log('Added new item to cart:', newItem);
      }
      
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      console.log('Cart saved to localStorage:', { cartKey, cartItems });
      
      // Dispatch event to update navbar and other components
      window.dispatchEvent(new Event('cart-updated'));
      console.log('Cart updated event dispatched');
      
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
      
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
      
      {/* Productos relacionados */}
      <div className="my-5">
        <Container>
          <h3 className="fw-bold mb-4">También te puede interesar</h3>
          <Row>
            {relatedProducts.map((relatedProduct) => (
              <Col key={relatedProduct.id} md={4} className="mb-4">
                <div className="product-item">
                  <div className="position-relative" style={{ height: '350px' }}>
                    <Image 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                    <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between align-items-center">
                      <Button 
                        as={Link} 
                        href={`/products/${relatedProduct.id}`} 
                        variant="light" 
                        className="rounded-1 px-3 py-1"
                        size="sm"
                      >
                        Ver Detalles
                      </Button>
                      <Button 
                        variant="light" 
                        className="rounded-circle p-1"
                        size="sm"
                      >
                        <i className="bi bi-heart"></i>
                      </Button>
                    </div>
                  </div>
                  <div className="py-2">
                    <h5 className="mb-1">{relatedProduct.name}</h5>
                    <p className="fw-bold mb-0">${relatedProduct.price.toFixed(2)}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

    {/* Footer */}
      <Footer/>
    </div>
  );
};

export default ProductDetailPage;