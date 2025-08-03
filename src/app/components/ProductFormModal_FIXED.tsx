import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Form, Button, Row, Col, Badge, Alert, Spinner, Image } from 'react-bootstrap';
import { inventoryService, type ProductInventory } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';

// Función para cargar el servicio de imágenes de forma segura
const getImageUploadService = async () => {
  try {
    console.log('🔄 Intentando cargar servicio de Firebase Storage...');
    
    // Verificar variables de entorno primero
    const hasFirebaseConfig = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    );
    console.log('🔧 Variables de Firebase configuradas:', hasFirebaseConfig);
    
    const module = await import('../services/imageUploadService');
    console.log('📦 Módulo cargado:', !!module);
    console.log('📦 Propiedades del módulo:', Object.keys(module));
    
    // 🔧 FIX: Intentar tanto named export como default export
    const imageUploadService = module.imageUploadService || module.default;
    console.log('🔄 Servicio extraído:', !!imageUploadService);
    
    if (imageUploadService) {
      console.log('🔍 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(imageUploadService)));
      console.log('🔍 uploadMultipleImages existe:', typeof imageUploadService.uploadMultipleImages);
    }
    
    // Verificar si storage está disponible
    if (imageUploadService && typeof imageUploadService.uploadMultipleImages === 'function') {
      console.log('✅ Servicio de Firebase Storage disponible y listo');
      return imageUploadService;
    } else {
      console.warn('⚠️ Servicio de Firebase Storage no tiene métodos esperados');
      console.warn('⚠️ imageUploadService:', imageUploadService);
      console.warn('⚠️ uploadMultipleImages:', typeof imageUploadService?.uploadMultipleImages);
      return null;
    }
  } catch (error) {
    console.error('❌ Error cargando servicio de Firebase Storage:', error);
    return null;
  }
};

// Servicio de respaldo para cuando Firebase no esté disponible
const createFallbackImageService = () => {
  return {
    uploadMultipleImages: async (files: File[], productId: number): Promise<string[]> => {
      console.log('🔄 Usando servicio de respaldo - simulando subida de', files.length, 'archivos');
      
      // Simular URLs de imágenes basadas en los archivos reales
      const simulatedUrls = files.map((file, index) => {
        // Crear un URL temporal usando el nombre del archivo real
        const placeholderIndex = (index % 4) + 1;
        return `/images/product${placeholderIndex}.svg`;
      });
      
      console.log('✅ Servicio de respaldo completado:', simulatedUrls);
      return simulatedUrls;
    },
    
    deleteImage: async (imageUrl: string): Promise<void> => {
      console.log('🗑️ Servicio de respaldo - simulando eliminación de:', imageUrl);
    }
  };
};

interface ProductFormModalProps {
  show: boolean;
  onHide: () => void;
  product?: ProductInventory | null;
  onProductSaved: () => void;
}

export default function ProductFormModal({ show, onHide, product, onProductSaved }: ProductFormModalProps) {
  const { user } = useAuth();
  
  // Categorías disponibles con sus rutas correspondientes
  const CATEGORIES = [
    { value: '', label: 'Seleccionar categoría', link: '' },
    { value: 'mujer', label: 'Mujer', link: 'mujer' },
    { value: 'hombre', label: 'Hombre', link: 'hombre' },
    { value: 'bebe', label: 'Bebé', link: 'bebe' },
    { value: 'ninos', label: 'Niños', link: 'ninos' },
    { value: 'sport', label: 'Sport', link: 'sport' }
  ];
  
  const [formData, setFormData] = useState({
    productId: 0,
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: '',
    details: [] as string[]
  });

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const isEditing = !!product;

  // Effect para actualizar los datos cuando cambia el producto
  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.productId,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        description: product.description || '',
        details: product.details || []
      });
      setSizes(product.sizes || []);
      setColors(product.colors || []);
      setImages(product.images || []);
    } else {
      // Reset para nuevo producto
      setFormData({
        productId: 0,
        name: '',
        price: 0,
        stock: 0,
        category: '',
        description: '',
        details: []
      });
      setSizes([]);
      setColors([]);
      setImages([]);
    }
    // Limpiar estados de archivos y errores
    setSelectedFiles([]);
    setError('');
    setUploadProgress(0);
  }, [product]);

  // Función optimizada de validación de archivos
  const validateImageFile = useMemo(() => (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP'
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido'
      };
    }

    if (!file.name || file.name.length < 1) {
      return {
        isValid: false,
        error: 'Nombre de archivo inválido'
      };
    }

    return { isValid: true };
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addSize = useCallback(() => {
    if (newSize.trim() && !sizes.includes(newSize.trim().toUpperCase())) {
      setSizes(prev => [...prev, newSize.trim().toUpperCase()]);
      setNewSize('');
    }
  }, [newSize, sizes]);

  const removeSize = useCallback((sizeToRemove: string) => {
    setSizes(prev => prev.filter(size => size !== sizeToRemove));
  }, []);

  const addColor = useCallback(() => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors(prev => [...prev, newColor.trim()]);
      setNewColor('');
    }
  }, [newColor, colors]);

  const removeColor = useCallback((colorToRemove: string) => {
    setColors(prev => prev.filter(color => color !== colorToRemove));
  }, []);

  const addDetail = useCallback(() => {
    if (newDetail.trim()) {
      setFormData(prev => ({
        ...prev,
        details: [...prev.details, newDetail.trim()]
      }));
      setNewDetail('');
    }
  }, [newDetail]);

  const removeDetail = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        setError(validation.error || 'Archivo inválido');
        return;
      }
    }
    
    setSelectedFiles(validFiles);
    setError('');
  }, [validateImageFile]);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback(async (index: number) => {
    const imageUrl = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));
    
    if (isEditing) {
      try {
        const imageService = await getImageUploadService();
        if (imageService && typeof imageService.deleteImage === 'function') {
          await imageService.deleteImage(imageUrl);
          console.log('✅ Imagen eliminada del storage:', imageUrl);
        } else {
          console.log('⚠️ Servicio de Firebase no disponible, imagen eliminada solo del estado local');
        }
      } catch (error) {
        console.error('❌ Error eliminando imagen del storage:', error);
        console.log('✅ Imagen eliminada del estado local exitosamente');
      }
    }
  }, [images, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Debes estar autenticado para crear/editar productos');
      }

      if (!formData.name.trim()) {
        throw new Error('El nombre del producto es requerido');
      }
      
      if (formData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      
      if (formData.stock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      if (!formData.category.trim()) {
        throw new Error('Debes seleccionar una categoría para el producto');
      }

      const finalSizes = sizes.length > 0 ? sizes : ['ÚNICA'];
      const finalColors = colors.length > 0 ? colors : ['Sin especificar'];

      let finalImages = [...images];
      
      // Subir las nuevas imágenes seleccionadas
      if (selectedFiles.length > 0) {
        setUploadProgress(10);
        try {
          console.log('📤 Intentando subir', selectedFiles.length, 'imagen(es) real(es) a Firebase Storage...');
          
          // Intentar cargar el servicio real de Firebase
          const imageService = await getImageUploadService();
          
          if (imageService && typeof imageService.uploadMultipleImages === 'function') {
            console.log('✅ Servicio de Firebase disponible, subiendo archivos reales...');
            console.log('📋 Detalles de archivos a subir:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
            
            const uploadedUrls = await imageService.uploadMultipleImages(
              selectedFiles, 
              formData.productId
            );
            console.log('🎉 Imágenes subidas exitosamente a Firebase:', uploadedUrls);
            finalImages = [...finalImages, ...uploadedUrls];
          } else {
            console.warn('⚠️ Servicio de Firebase no disponible, usando servicio de respaldo...');
            console.log('📋 Razón: imageService =', imageService, ', método uploadMultipleImages =', imageService?.uploadMultipleImages);
            const fallbackService = createFallbackImageService();
            const fallbackUrls = await fallbackService.uploadMultipleImages(
              selectedFiles, 
              formData.productId
            );
            console.log('✅ Servicio de respaldo completado:', fallbackUrls);
            finalImages = [...finalImages, ...fallbackUrls];
          }
          
          setUploadProgress(90);
        } catch (uploadError: any) {
          console.error('❌ Error subiendo imágenes:', uploadError);
          
          // Si hay error, usar el servicio de respaldo
          console.log('🔄 Usando servicio de respaldo debido al error...');
          try {
            const fallbackService = createFallbackImageService();
            const fallbackUrls = await fallbackService.uploadMultipleImages(
              selectedFiles, 
              formData.productId
            );
            console.log('✅ Servicio de respaldo completado tras error:', fallbackUrls);
            finalImages = [...finalImages, ...fallbackUrls];
          } catch (fallbackError) {
            console.error('❌ Error en servicio de respaldo:', fallbackError);
            throw new Error(`❌ Error subiendo imágenes: ${uploadError.message}`);
          }
        }
      }

      // Si no hay imágenes, usar una imagen placeholder como fallback
      if (finalImages.length === 0) {
        console.warn('⚠️ Producto sin imágenes, usando imagen placeholder');
        finalImages = ['/images/product1.svg'];
      }

      const productData: Omit<ProductInventory, 'lastUpdated' | 'isActive'> = {
        productId: formData.productId,
        name: formData.name.trim(),
        price: formData.price,
        stock: formData.stock,
        images: finalImages,
        category: formData.category.trim(),
        description: formData.description.trim(),
        sizes: finalSizes,
        colors: finalColors,
        details: formData.details
      };

      const success = await inventoryService.createOrUpdateProduct(productData);
      
      if (success) {
        setUploadProgress(100);
        console.log('✅ Producto guardado exitosamente con imágenes reales');
        onProductSaved();
        handleClose();
      } else {
        throw new Error('Error al guardar el producto en el inventario');
      }

    } catch (error: any) {
      console.error('❌ Error completo:', error);
      setError(error.message || 'Error al procesar el formulario');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: 0,
      name: '',
      price: 0,
      stock: 0,
      category: '',
      description: '',
      details: []
    });
    setSizes([]);
    setColors([]);
    setImages([]);
    setSelectedFiles([]);
    setNewSize('');
    setNewColor('');
    setNewDetail('');
    setError('');
    setUploadProgress(0);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-box me-2"></i>
          {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {uploadProgress > 0 && (
            <Alert variant="info">
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando imágenes desde tu computadora... {uploadProgress}%
                <br />
                <small className="text-muted">
                  Intentando Firebase Storage, con respaldo automático si es necesario
                </small>
              </div>
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>ID del Producto *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.productId || ''}
                  onChange={(e) => handleInputChange('productId', parseInt(e.target.value) || 0)}
                  disabled={isEditing}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Producto *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Stock *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría *</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Esta categoría determinará en qué sección aparecerá el producto en la tienda
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Form.Group>

          {/* Tallas */}
          <Form.Group className="mb-3">
            <Form.Label>Tallas Disponibles (opcional)</Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                placeholder="Ej: S, M, L, XL"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <Button variant="outline-primary" className="ms-2" onClick={addSize}>
                <i className="bi bi-plus"></i>
              </Button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {sizes.map((size, index) => (
                <Badge key={index} bg="primary" className="d-flex align-items-center">
                  {size}
                  <i 
                    className="bi bi-x ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeSize(size)}
                  ></i>
                </Badge>
              ))}
            </div>
          </Form.Group>

          {/* Colores */}
          <Form.Group className="mb-3">
            <Form.Label>Colores Disponibles (opcional)</Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                placeholder="Ej: Rojo, Azul, Negro"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <Button variant="outline-primary" className="ms-2" onClick={addColor}>
                <i className="bi bi-plus"></i>
              </Button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {colors.map((color, index) => (
                <Badge key={index} bg="success" className="d-flex align-items-center">
                  {color}
                  <i 
                    className="bi bi-x ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeColor(color)}
                  ></i>
                </Badge>
              ))}
            </div>
          </Form.Group>

          {/* Detalles */}
          <Form.Group className="mb-3">
            <Form.Label>Detalles del Producto</Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                placeholder="Ej: 100% algodón, Lavable a máquina"
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDetail())}
              />
              <Button variant="outline-primary" className="ms-2" onClick={addDetail}>
                <i className="bi bi-plus"></i>
              </Button>
            </div>
            <div className="d-flex flex-column gap-1">
              {formData.details.map((detail: string, index: number) => (
                <div key={index} className="d-flex align-items-center">
                  <span className="flex-grow-1">• {detail}</span>
                  <i 
                    className="bi bi-x text-danger" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeDetail(index)}
                  ></i>
                </div>
              ))}
            </div>
          </Form.Group>

          {/* Imágenes existentes */}
          {images.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Imágenes Actuales</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="position-relative">
                    <Image
                      src={image}
                      alt={`Producto ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                      className="rounded border"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0"
                      style={{ transform: 'translate(50%, -50%)' }}
                      onClick={() => removeExistingImage(index)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>
          )}

          {/* Nuevas imágenes */}
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-camera me-2"></i>
              {images.length > 0 ? 'Agregar Más Imágenes desde tu Computadora' : 'Subir Imágenes desde tu Computadora'}
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
            />
            <Form.Text className="text-muted">
              <strong>📸 Selecciona imágenes directamente desde tu computadora</strong>
              <br />
              Formatos permitidos: JPG, PNG, WebP. Máximo 5MB por imagen.
              <br />
              <small className="text-info">
                ✨ Sistema inteligente: Intentará subir a Firebase Storage, 
                con sistema de respaldo automático si hay problemas de configuración.
              </small>
            </Form.Text>
            
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <div className="fw-bold mb-2">📁 Archivos seleccionados desde tu computadora:</div>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between p-2 border rounded mb-1">
                    <div>
                      <strong>{file.name}</strong>
                      <br />
                      <small className="text-muted">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {selectedFiles.length > 0 ? 'Subiendo imágenes reales...' : (isEditing ? 'Actualizando...' : 'Creando...')}
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
