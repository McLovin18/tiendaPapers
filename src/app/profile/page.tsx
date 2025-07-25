'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tab, Nav, ListGroup, Badge, Tabs, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import NavbarComponent from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoginRequired from '../components/LoginRequired';
import Image from 'next/image';
import Modal from 'react-bootstrap/Modal';
import { getUserPurchases, clearUserPurchases, getUserFavourites, removeFavourite } from '../services/purchaseService';
import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateProfile } from 'firebase/auth';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState(user?.photoURL || '/images/avatar.svg');
  const fileInputRef = useRef(null);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loadingFavourites, setLoadingFavourites] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Cargar historial de compras desde Firestore y detectar parámetro de consulta 'tab'
  useEffect(() => {
    const loadPurchases = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      setLoadError('');
      
      try {
        
        // Cargar compras desde Firestore
        const userPurchases = await getUserPurchases(user.uid);
        console.log('Compras cargadas desde Firestore:', userPurchases);
        setPurchases(userPurchases);
      } catch (error) {
        console.error('Error al cargar compras:', error);
        setLoadError('No se pudieron cargar tus compras. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    // Detectar parámetro de consulta 'tab' en la URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['personal', 'orders', 'notifications'].includes(tabParam)) {
        setActiveTab(tabParam);
        
        // Si se selecciona la pestaña de compras mediante URL, cargar los datos
        if (tabParam === 'orders') {
          loadPurchases();
        }
      }
    } else {
      // Cargar compras de todos modos si no hay parámetro de URL
      loadPurchases();
    }
  }, [user?.uid]);

  // Efecto para sincronizar el tab con la URL
  const [activeTab, setActiveTab] = useState('personal');
  
  const handleTabChange = (key: string | null) => {
    if (key) {
      setActiveTab(key);
      
      // Si se selecciona la pestaña de compras, actualizar los datos desde Firestore
      if (key === 'purchases' && user?.uid) {
        setLoading(true);
        setLoadError('');
        
        getUserPurchases(user.uid)
          .then(userPurchases => {
            console.log('Actualizando compras desde Firestore:', userPurchases);
            setPurchases(userPurchases);
          })
          .catch(error => {
            console.error('Error al actualizar compras:', error);
            setLoadError('No se pudieron cargar tus compras. Intenta de nuevo más tarde.');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar el perfil del usuario
    setSuccess(true);
    setError('');
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      await clearUserPurchases(user.uid);
      setPurchases([]);
    } catch (error) {
      console.error('Error al limpiar historial de compras:', error);
      setLoadError('No se pudo limpiar el historial. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (purchase: any) => {
    setSelectedPurchase(purchase);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedPurchase(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);
    try {
      if (user && name && user.displayName !== name) {
        await updateProfile(user, { displayName: name });
      }
      if (user && email && user.email !== email) {
        await updateProfile(user, { email: email });
      }
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('No se pudo actualizar el perfil. Intenta de nuevo.');
    }
  };

  // Cargar favoritos desde Firestore cuando el usuario o la pestaña cambian
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user?.uid || activeTab !== 'favorites') return;
      setLoadingFavourites(true);
      const favs = await getUserFavourites(user.uid);
      setFavourites(favs);
      setLoadingFavourites(false);
    };
    fetchFavourites();
  }, [user?.uid, activeTab]);

  const removeFavouriteHandler = async (id: string | number) => {
    if (!user?.uid) return;
    await removeFavourite(user.uid, id);
    setFavourites(favourites.filter(fav => fav.id !== id));
  };

  if (!user) {
    return <LoginRequired />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Eliminar <NavbarComponent /> de aquí, ya que el layout global ya lo incluye */}
      
      <main>
        <Container className="py-5">
          <h1 className="fw-bold text-center mb-5">Mi Cuenta</h1>
          <Row className="g-4 justify-content-center">
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm mb-4 p-4">
                <Card.Body>
                  <div className="mb-3 text-center">
                    <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#888' }}></i>
                    <h5 className="fw-bold mb-2 mt-2">{name}</h5>
                    <div className="mb-2 text-muted">{email}</div>
                  </div>
                  <div className="d-grid gap-2">
                    <Button 
                      variant={activeTab === 'personal' ? 'dark' : 'outline-dark'} 
                      className="rounded-1" 
                      onClick={() => {
                        setActiveTab('personal');
                        router.push('/profile?tab=personal');
                      }}
                    >
                      <i className="bi bi-person me-2"></i>Información personal
                    </Button>
                    <Button 
                      variant={activeTab === 'orders' ? 'dark' : 'outline-dark'} 
                      className="rounded-1" 
                      onClick={() => {
                        setActiveTab('orders');
                        router.push('/profile?tab=orders');
                      }}
                    >
                      <i className="bi bi-bag-check me-2"></i>Historial de pedidos
                    </Button>
                    <Button 
                      variant={activeTab === 'favorites' ? 'dark' : 'outline-dark'} 
                      className="rounded-1" 
                      onClick={() => {
                        setActiveTab('favorites');
                        router.push('/profile?tab=favorites');
                      }}
                    >
                      <i className="bi bi-heart me-2"></i>Favoritos
                    </Button>
                    <Button 
                      variant="danger" 
                      className="rounded-1 mt-2" 
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  {activeTab === 'personal' && (
                    <div className="p-3">
                      <h5 className="fw-bold mb-3">Información personal</h5>
                      <div className="text-center mb-4">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={avatar} alt="Avatar" width={96} height={96} className="rounded-circle border" style={{ objectFit: 'cover' }} />
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="position-absolute bottom-0 end-0 border shadow-sm" 
                            style={{ borderRadius: '50%' }}
                            onClick={() => fileInputRef.current.click()}
                          >
                            <i className="bi bi-camera"></i>
                          </Button>
                          <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleAvatarChange}
                          />
                        </div>
                      </div>
                      {editMode ? (
                        <Form onSubmit={handleEditSubmit} className="text-start">
                          <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} required className="rounded-1" />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-1" disabled={user?.providerData[0]?.providerId !== 'password'} />
                            {user?.providerData[0]?.providerId !== 'password' && (
                              <Form.Text className="text-muted">El email no se puede modificar</Form.Text>
                            )}
                          </Form.Group>
                          <div className="d-flex gap-2 mt-3">
                            <Button type="submit" variant="dark" className="rounded-1">Guardar cambios</Button>
                            <Button type="button" variant="outline-secondary" className="rounded-1" onClick={() => setEditMode(false)}>Cancelar</Button>
                          </div>
                        </Form>
                      ) : (
                        <>
                          <div className="mb-2"><strong>Nombre:</strong> {name}</div>
                          <div className="mb-2"><strong>Email:</strong> {email}</div>
                          <Button variant="outline-dark" className="rounded-1 mt-3" onClick={() => setEditMode(true)}>
                            <i className="bi bi-pencil me-2"></i>Editar datos personales
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  {activeTab === 'orders' && (
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Historial de Pedidos</h5>
                        {purchases.length > 0 && !loading && (
                          <Button variant="outline-danger" size="sm" onClick={handleClearHistory} disabled={loading}>
                            <i className="bi bi-trash me-1"></i> Limpiar Historial
                          </Button>
                        )}
                      </div>
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" role="status" className="mb-3" />
                          <p className="text-muted">Cargando tus compras...</p>
                        </div>
                      ) : purchases.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-box2 fs-1"></i>
                          <h5 className="fw-bold mb-2">No tienes compras recientes</h5>
                          <Button variant="dark" href="/products" className="rounded-1 px-4 mt-3">Ver Productos</Button>
                        </div>
                      ) : (
                        <>
                          <ListGroup>
                            {purchases.map((purchase, idx) => (
                              <ListGroup.Item key={idx} className="mb-3 bg-white rounded-1 shadow-sm border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h6 className="fw-bold mb-1">Pedido #{purchase.id}</h6>
                                    <div className="small text-muted mb-2">{purchase.date}</div>
                                    <div>
                                      {purchase.items.map((item, i) => (
                                        <span key={i} className="me-3">
                                          <Image src={item.image} alt={item.name} width={40} height={40} className="me-2 rounded-1" />
                                          {item.name} x{item.quantity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold fs-5 mb-2">${purchase.total.toFixed(2)}</div>
                                    <Badge bg="success">Pagado</Badge>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          <div className="text-end mt-3">
                            <span className="fw-bold">Total gastado: ${purchases.reduce((acc, p) => acc + p.total, 0).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {activeTab === 'favorites' && (
                    <div className="p-3 text-center">
                      <h5 className="fw-bold mb-3">Favoritos</h5>
                      {loadingFavourites ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" role="status" className="mb-3" />
                          <p className="text-muted">Cargando tus favoritos...</p>
                        </div>
                      ) : favourites.length === 0 ? (
                        <>
                          <i className="bi bi-heart fs-1 text-danger mb-3"></i>
                          <p className="text-muted">Aún no tienes productos favoritos.</p>
                          <Button variant="dark" href="/products" className="rounded-1 px-4 mt-3">Ver Productos</Button>
                        </>
                      ) : (
                        <Row className="g-4 justify-content-center">
                          {favourites.map((fav, idx) => (
                            <Col xs={12} md={6} lg={4} key={fav.id}>
                              <Card className="mb-4 border-0 shadow-sm text-start">
                                <Card.Body>
                                  <div className="d-flex align-items-center mb-3">
                                    <Image src={fav.image} alt={fav.name} width={60} height={60} className="me-3 rounded-1" />
                                    <div>
                                      <h5 className="fw-bold mb-1">{fav.name}</h5>
                                      <div className="text-primary fw-bold mb-1">${fav.price.toFixed(2)}</div>
                                      <div className="small text-muted mb-2">{fav.description?.substring(0, 60)}...</div>
                                    </div>
                                    <Button variant="link" className="text-danger ms-auto p-0" onClick={() => removeFavouriteHandler(fav.id)}><i className="bi bi-x-lg"></i></Button>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
      
      <footer className="bg-light text-dark py-5 border-top">
        <Container>
          <Row>
            <Col md={6} className="mb-4 mb-md-0">
              <h5 className="fw-bold mb-3">Comprar</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="/products/mujer" className="text-dark text-decoration-none">Mujer</a></li>
                <li className="mb-2"><a href="/products/hombre" className="text-dark text-decoration-none">Hombre</a></li>
                <li className="mb-2"><a href="/products/ninos" className="text-dark text-decoration-none">Niños</a></li>
                <li className="mb-2"><a href="/products/bebe" className="text-dark text-decoration-none">Bebé</a></li>
                <li className="mb-2"><a href="/products/sport" className="text-dark text-decoration-none">Sport</a></li>
              </ul>
            </Col>
            <Col md={6}>
              <h5 className="fw-bold mb-3">Contacto</h5>
              <p className="mb-1">Email: info@tiendaropa.com</p>
              <p className="mb-0">Teléfono: (123) 456-7890</p>
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

export default ProfilePage;