'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge, Modal } from 'react-bootstrap';
import { db } from '../../app/utils/firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

interface DeliveryUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  zones: string[];
  active: boolean;
  createdAt: Date;
}

interface DeliverySettingsProps {
  className?: string;
}

const AVAILABLE_ZONES = [
  // Guayaquil
  'guayaquil-centro',
  'guayaquil-norte', 
  'guayaquil-sur',
  'guayaquil-urdesa',
  'guayaquil-samborondon',
  'guayaquil-ceibos',
  'guayaquil-alborada',
  'guayaquil-kennedy',
  'guayaquil-las-penas',
  'guayaquil-mapasingue',
  'guayaquil-sauces',
  'guayaquil-via-costa',
  'guayaquil-general',
  // Santa Elena
  'santa-elena-centro',
  'santa-elena-libertad',
  'santa-elena-ballenita',
  'santa-elena-salinas',
  'santa-elena-general'
];

const DeliverySettings: React.FC<DeliverySettingsProps> = ({ className }) => {
  const [deliveryUsers, setDeliveryUsers] = useState<DeliveryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  
  // Edit states
  const [editingUser, setEditingUser] = useState<DeliveryUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadDeliveryUsers();
  }, []);

  const loadDeliveryUsers = async () => {
    try {
      setLoading(true);
      const deliveryCollection = collection(db, 'deliveryUsers');
      const snapshot = await getDocs(deliveryCollection);
      
      const users: DeliveryUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          zones: data.zones || [],
          active: data.active !== false,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      setDeliveryUsers(users);
      setError(null);
    } catch (error) {
      console.error('Error loading delivery users:', error);
      setError('Error al cargar usuarios delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async () => {
    if (!newEmail.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!newEmail.includes('@')) {
      setError('El email debe ser válido');
      return;
    }

    if (selectedZones.length === 0) {
      setError('Debe seleccionar al menos una zona');
      return;
    }

    try {
      // Check if email already exists
      const existingUser = deliveryUsers.find(u => u.email.toLowerCase() === newEmail.toLowerCase());
      if (existingUser) {
        setError('Este email ya está registrado como delivery');
        return;
      }

      const deliveryData = {
        email: newEmail.toLowerCase(),
        name: newName.trim() || newEmail.split('@')[0],
        phone: newPhone.trim(),
        zones: selectedZones,
        active: true,
        createdAt: new Date(),
        role: 'delivery',
        isDelivery: true
      };

      // Save to Firestore
      await setDoc(doc(db, 'deliveryUsers', newEmail.toLowerCase()), deliveryData);
      
      // Also save to users collection for auth integration
      await setDoc(doc(db, 'users', newEmail.toLowerCase()), {
        email: newEmail.toLowerCase(),
        role: 'delivery',
        isDelivery: true,
        deliveryZones: selectedZones,
        name: deliveryData.name,
        phone: deliveryData.phone,
        active: true,
        updatedAt: new Date()
      }, { merge: true });

      setSuccess(`✅ Usuario delivery "${newEmail}" agregado correctamente`);
      
      // Reset form
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      setSelectedZones([]);
      setShowAddModal(false);
      
      // Reload data
      await loadDeliveryUsers();
      
    } catch (error) {
      console.error('Error adding delivery user:', error);
      setError('Error al agregar usuario delivery');
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'deliveryUsers', userId), {
        active: !currentActive,
        updatedAt: new Date()
      });

      // Also update users collection
      await updateDoc(doc(db, 'users', userId), {
        active: !currentActive,
        updatedAt: new Date()
      });

      setSuccess(`✅ Usuario ${!currentActive ? 'activado' : 'desactivado'} correctamente`);
      await loadDeliveryUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Error al cambiar estado del usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario delivery?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'deliveryUsers', userId));
      
      // Also update users collection (don't delete, just remove delivery role)
      await updateDoc(doc(db, 'users', userId), {
        role: 'client',
        isDelivery: false,
        deliveryZones: [],
        updatedAt: new Date()
      });

      setSuccess('✅ Usuario delivery eliminado correctamente');
      await loadDeliveryUsers();
    } catch (error) {
      console.error('Error deleting delivery user:', error);
      setError('Error al eliminar usuario delivery');
    }
  };

  const handleEditUser = (user: DeliveryUser) => {
    setEditingUser(user);
    setSelectedZones(user.zones);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const updateData = {
        zones: selectedZones,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'deliveryUsers', editingUser.id), updateData);
      
      // Also update users collection
      await updateDoc(doc(db, 'users', editingUser.id), {
        deliveryZones: selectedZones,
        updatedAt: new Date()
      });

      setSuccess('✅ Zonas actualizadas correctamente');
      setShowEditModal(false);
      setEditingUser(null);
      await loadDeliveryUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error al actualizar usuario');
    }
  };

  const handleZoneToggle = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  if (loading) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-3">
          {success}
        </Alert>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1">👨‍💼 Gestión de Deliveries</h3>
              <p className="text-muted mb-0">Administra cuentas y zonas de entrega</p>
            </div>
            <Button 
              variant="success" 
              onClick={() => setShowAddModal(true)}
              className="btn-sm"
            >
              <i className="bi bi-plus-circle me-1"></i>
              Agregar Delivery
            </Button>
          </div>
        </Col>
      </Row>

      {/* Delivery Users Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-people me-2"></i>
            Usuarios Delivery ({deliveryUsers.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {deliveryUsers.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-person-x fs-1 text-muted"></i>
              <p className="text-muted mt-2">No hay usuarios delivery registrados</p>
              <Button variant="outline-success" onClick={() => setShowAddModal(true)}>
                Agregar primer delivery
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Zonas</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {deliveryUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="fw-bold">{user.email}</div>
                      {user.phone && (
                        <small className="text-muted">{user.phone}</small>
                      )}
                    </td>
                    <td>{user.name || 'Sin nombre'}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {user.zones.map((zone) => (
                          <Badge key={zone} bg="primary" className="small">
                            {zone.replace('guayaquil-', '')}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge bg={user.active ? 'success' : 'secondary'}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {user.createdAt.toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Editar zonas"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant={user.active ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          onClick={() => handleToggleActive(user.id, user.active)}
                          title={user.active ? 'Desactivar' : 'Activar'}
                        >
                          <i className={`bi bi-${user.active ? 'pause' : 'play'}`}></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Delivery Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-plus me-2"></i>
            Agregar Nuevo Delivery
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="delivery@ejemplo.com"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre del delivery"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0999999999"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Zonas de Entrega *</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Row>
                  {AVAILABLE_ZONES.map((zone) => (
                    <Col key={zone} sm={6} md={4} className="mb-2">
                      <Form.Check
                        type="checkbox"
                        id={`new-zone-${zone}`}
                        label={zone.replace('guayaquil-', '').replace('-', ' ')}
                        checked={selectedZones.includes(zone)}
                        onChange={() => handleZoneToggle(zone)}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
              <Form.Text className="text-muted">
                Selecciona las zonas donde este delivery puede realizar entregas
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAddDelivery}>
            <i className="bi bi-plus-circle me-1"></i>
            Agregar Delivery
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Zones Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-geo-alt me-2"></i>
            Editar Zonas - {editingUser?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Zonas de Entrega</Form.Label>
            <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <Row>
                {AVAILABLE_ZONES.map((zone) => (
                  <Col key={zone} sm={6} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`edit-zone-${zone}`}
                      label={zone.replace('guayaquil-', '').replace('-', ' ')}
                      checked={selectedZones.includes(zone)}
                      onChange={() => handleZoneToggle(zone)}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            <i className="bi bi-check-circle me-1"></i>
            Actualizar Zonas
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeliverySettings;
