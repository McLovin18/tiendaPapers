'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Row, Col, Button, Form, Tabs, Tab, Badge, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import NavbarComponent from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoginRequired from '../../components/LoginRequired';
import { addFavourite, removeFavourite, getUserFavourites, addProductComment, getProductComments } from '../../services/purchaseService';
import allProducts from '../productsData';

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
  const [comments, setComments] = useState<{name: string, text: string, date: string, rating?: number}[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const checkFavourite = async () => {
      if (!user?.uid || !product?.id) return;
      const favs = await getUserFavourites(user.uid);
      setIsFavourite(favs.some((item: any) => item.id == product.id));
    };
    checkFavourite();
  }, [user?.uid, product?.id]);

  // Cargar comentarios desde Firestore
  useEffect(() => {
    const fetchComments = async () => {
      if (!product?.id) return;
      setLoadingComments(true);
      const fetched = await getProductComments(product.id);
      // Mapear a tipo seguro
      setComments(fetched.map((c: any) => ({
        name: c.name || 'Usuario',
        text: c.text || '',
        date: c.date || '',
        rating: c.rating || 0
      })));
      setLoadingComments(false);
    };
    fetchComments();
  }, [product?.id]);

  // Guardar comentario en Firestore
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!commentText.trim() || rating < 1) return;
    const newComment = {
      name: user.displayName || 'Usuario',
      text: commentText.trim(),
      date: new Date().toISOString(),
      rating
    };
    if (!product) return;
    
    await addProductComment(product.id, newComment);
    setCommentText('');
    setRating(0);
    // Recargar comentarios
    const fetched = await getProductComments(product.id);
    setComments(fetched.map((c: any) => ({
      name: c.name || 'Usuario',
      text: c.text || '',
      date: c.date || '',
      rating: c.rating || 0
    })));
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

  const handleAddToFavourites = async () => {
    if (!user?.uid || !product) return;
    if (isFavourite) {
      await removeFavourite(user.uid, product.id);
      setIsFavourite(false);
    } else {
      await addFavourite(user.uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description
      });
      setIsFavourite(true);
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
            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm">
                <div className="position-relative" style={{ width: '350px', height: '500px', margin: '0 auto', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem 1rem 0 0', overflow: 'hidden' }}>
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
              {errorMessage && (
                <div className="alert alert-danger text-center" role="alert">
                  {errorMessage}
                </div>
              )}
              <div className="d-flex gap-2">
                <Button variant="dark" size="lg" className="w-100 rounded-1 mb-3" onClick={handleAddToCart}>
                  Añadir al carrito
                </Button>
                <Button variant="outline-danger" size="lg" className="rounded-1 mb-3" onClick={handleAddToFavourites}>
                  <i className={`bi ${isFavourite ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </main>

      {/* Sección de comentarios */}
      <div className="my-5">
        <Container>
          <h3 className="fw-bold mb-4">Comentarios</h3>
          <form onSubmit={handleAddComment} className="mb-4">
            <Row className="g-2 align-items-end">
              <Col xs={12} md={3} className="d-flex align-items-center">
                <div className="fw-bold">{user?.displayName || 'Usuario'}</div>
              </Col>
              <Col xs={12} md={7}>
                <Form.Group>
                  <Form.Label>Calificación</Form.Label>
                  <div style={{ fontSize: '1.5rem', color: '#e63946', marginBottom: 6 }}>
                    {[1,2,3,4,5].map(star => (
                      <span
                        key={star}
                        style={{ cursor: 'pointer', filter: star > rating ? 'grayscale(1)' : 'none', transition: 'filter 0.15s' }}
                        onClick={() => setRating(star)}
                        onMouseOver={() => setRating(star)}
                        onMouseLeave={() => setRating(rating)}
                        role="button"
                        aria-label={`Calificar ${star} estrellas`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <Form.Label>Comentario</Form.Label>
                  <Form.Control as="textarea" rows={1} value={commentText} onChange={e => setCommentText(e.target.value)} required maxLength={200} />
                </Form.Group>
              </Col>
              <Col xs={12} md={2} className="d-grid">
                <Button type="submit" variant="dark" className="rounded-1">Comentar</Button>
              </Col>
            </Row>
          </form>
          {loadingComments ? (
            <div className="text-center text-muted py-4">
              <span className="spinner-border spinner-border-sm me-2"></span>
              Cargando comentarios...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted py-4">Aún no hay comentarios para este producto.</div>
          ) : (
            <Row className="g-4">
              {comments.map((c, idx) => (
                <Col key={idx} xs={12} md={6} lg={4}>
                  <Card className="mb-3 border-0 shadow-sm">
                    <Card.Body className="d-flex align-items-start gap-3">
                      <div style={{ minWidth: 60 }}>
                        {product.images && product.images[0] && (
                          <Image src={product.images[0]} alt={product.name} width={60} height={60} className="rounded-1" />
                        )}
                      </div>
                      <div>
                        <div className="fw-bold mb-1">{c.name}</div>
                        <div style={{ color: '#e63946', fontSize: '1.2rem', marginBottom: 2 }}>
                          {[1,2,3,4,5].map(star => (
                            <span key={star} style={{ filter: star > c.rating ? 'grayscale(1)' : 'none' }}>★</span>
                          ))}
                        </div>
                        <div className="small text-muted mb-2">{new Date(c.date).toLocaleString()}</div>
                        <div>{c.text}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
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
};

export default ProductDetailPage;